package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

const (
	brawlStarsAPIBase = "https://api.brawlstars.com/v1"
	defaultPort       = "8080"
)

var (
	apiKey      string
	rateLimiter *RateLimiter
)

// RateLimiter はIPベースのレート制限を管理
type RateLimiter struct {
	mu       sync.RWMutex
	clients  map[string]*Client
	rate     int           // 許可するリクエスト数
	interval time.Duration // 時間間隔
}

// Client はクライアントごとのレート制限状態
type Client struct {
	tokens    int
	lastCheck time.Time
}

// NewRateLimiter は新しいレート制限を作成
func NewRateLimiter(rate int, interval time.Duration) *RateLimiter {
	rl := &RateLimiter{
		clients:  make(map[string]*Client),
		rate:     rate,
		interval: interval,
	}
	// 古いエントリを定期的にクリーンアップ
	go rl.cleanup()
	return rl
}

// Allow はリクエストを許可するかどうかを判定
func (rl *RateLimiter) Allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	client, exists := rl.clients[ip]
	now := time.Now()

	if !exists {
		rl.clients[ip] = &Client{
			tokens:    rl.rate - 1,
			lastCheck: now,
		}
		return true
	}

	// 経過時間に基づいてトークンを補充
	elapsed := now.Sub(client.lastCheck)
	tokensToAdd := int(elapsed / rl.interval) * rl.rate
	client.tokens += tokensToAdd
	if client.tokens > rl.rate {
		client.tokens = rl.rate
	}
	client.lastCheck = now

	if client.tokens > 0 {
		client.tokens--
		return true
	}

	return false
}

// cleanup は古いエントリを定期的に削除
func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	for range ticker.C {
		rl.mu.Lock()
		for ip, client := range rl.clients {
			if time.Since(client.lastCheck) > 10*time.Minute {
				delete(rl.clients, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// getClientIP はクライアントのIPアドレスを取得
func getClientIP(r *http.Request) string {
	// X-Forwarded-For ヘッダーをチェック（プロキシ経由の場合）
	xff := r.Header.Get("X-Forwarded-For")
	if xff != "" {
		ips := strings.Split(xff, ",")
		return strings.TrimSpace(ips[0])
	}

	// X-Real-IP ヘッダーをチェック
	xri := r.Header.Get("X-Real-IP")
	if xri != "" {
		return xri
	}

	// RemoteAddr から取得
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

// rateLimitMiddleware はレート制限ミドルウェア
func rateLimitMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ip := getClientIP(r)

		if !rateLimiter.Allow(ip) {
			log.Printf("Rate limit exceeded for IP: %s", ip)
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Retry-After", "60")
			w.WriteHeader(http.StatusTooManyRequests)
			json.NewEncoder(w).Encode(map[string]string{
				"error":   "Too many requests",
				"message": "Rate limit exceeded. Please try again later.",
			})
			return
		}

		next(w, r)
	}
}

func main() {
	// 環境変数からAPIキーを取得
	apiKey = os.Getenv("BRAWL_STARS_API_KEY")
	if apiKey == "" {
		log.Fatal("BRAWL_STARS_API_KEY environment variable is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// レート制限: 1分間に30リクエストまで（IPごと）
	rateLimiter = NewRateLimiter(30, time.Minute)

	// ルーティング設定（レート制限ミドルウェア付き）
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/api/player/", rateLimitMiddleware(playerHandler))
	http.HandleFunc("/api/battlelog/", rateLimitMiddleware(battlelogHandler))

	log.Printf("Starting Brawl Stars API Proxy on port %s (rate limit: 30 req/min per IP)", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func playerHandler(w http.ResponseWriter, r *http.Request) {
	// CORSヘッダー
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	// プレイヤータグを取得
	tag := strings.TrimPrefix(r.URL.Path, "/api/player/")
	if tag == "" {
		http.Error(w, "Player tag is required", http.StatusBadRequest)
		return
	}

	// タグをエンコード（#を%23に）
	encodedTag := strings.ReplaceAll(tag, "#", "%23")
	if !strings.HasPrefix(encodedTag, "%23") {
		encodedTag = "%23" + encodedTag
	}

	// Brawl Stars APIにリクエスト
	apiURL := fmt.Sprintf("%s/players/%s", brawlStarsAPIBase, encodedTag)
	proxyRequest(w, apiURL)
}

func battlelogHandler(w http.ResponseWriter, r *http.Request) {
	// CORSヘッダー
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	// プレイヤータグを取得
	tag := strings.TrimPrefix(r.URL.Path, "/api/battlelog/")
	if tag == "" {
		http.Error(w, "Player tag is required", http.StatusBadRequest)
		return
	}

	// タグをエンコード
	encodedTag := strings.ReplaceAll(tag, "#", "%23")
	if !strings.HasPrefix(encodedTag, "%23") {
		encodedTag = "%23" + encodedTag
	}

	// Brawl Stars APIにリクエスト
	apiURL := fmt.Sprintf("%s/players/%s/battlelog", brawlStarsAPIBase, encodedTag)
	proxyRequest(w, apiURL)
}

func proxyRequest(w http.ResponseWriter, apiURL string) {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		log.Printf("Error creating request: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// APIキーをヘッダーに追加
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error making request to Brawl Stars API: %v", err)
		http.Error(w, "Failed to fetch data", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// レスポンスボディを読み取り
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response body: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// レスポンスヘッダーとステータスコードをコピー
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(body)
}

func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}
