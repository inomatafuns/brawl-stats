# brawl-stats.com 実装・公開までの作業記録（時系列）

## 0. 目的・背景

### なぜプロキシサーバーが必要になったか

Brawl Stars 公式 API には以下の制約がある：

1. **ホワイトリスト方式** - IPアドレスのホワイトリスト方式になっている
2. **CORS 制限** - ブラウザから直接APIを叩くことができない
3. **API キーの露出** - フロントエンドにAPIキーを埋め込むとユーザーに見られる
4. **レート制限** - 公式APIには厳しいレート制限がある

```
❌ ブラウザ → Brawl Stars API（CORS エラー + APIキー露出）
✅ ブラウザ → 自作Proxy → Brawl Stars API（APIキーはサーバー側で管理）
```

👉 **自作プロキシサーバーでAPIキーを隠蔽し、CORSを解決**

### なぜ Caddy が必要になったか

- フロントエンドは AWS Amplify + **HTTPS**
- 当初プロキシは `http://<my-instance-ip>:8080` で公開
- ブラウザが **Mixed Content**（HTTPS → HTTP）をブロック

```
HTTPS サイト (Amplify)
   ↓
HTTP API (プロキシ)  ← ❌ ブラウザがブロック！
```

解決策の選択肢：
| 方法 | コスト | 手間 |
|------|--------|------|
| AWS Certificate Manager + ALB | 月額数十ドル | 中 |
| Cloudflare Proxy | 無料 | 低（ただしDNS移管必要） |
| **Caddy + Let's Encrypt** | **無料** | **低** |

👉 **Caddy を採用：無料 + 自動証明書更新 + シンプルな設定**

---

## 1. 技術選定・方針決定

### 使用ツール

| ツール | 用途 |
|--------|------|
| ChatGPT | 設計相談・トラブルシュート |
| Claude Code | コード生成・設定ファイル作成・Git操作 |
| Pockode | CLI補助・調査 |

### 方針

- SSL証明書は **無料**
- 運用コストは **0円**
- 証明書更新は **自動**
- フロント／API の責務は明確に分離

👉 **Caddy + Let's Encrypt を採用**

---

## 2. Go プロキシサーバーの実装（Claude Code）

### 2.1 プロキシサーバーの作成

`proxy/main.go` を作成：

- Brawl Stars API へのプロキシ
- CORS ヘッダー付与
- エンドポイント:
  - `/api/player/{tag}` - プレイヤー情報
  - `/api/battlelog/{tag}` - バトルログ
  - `/health` - ヘルスチェック

### 2.2 レート制限の実装

IP ベースの Token Bucket アルゴリズムを実装：

- **30リクエスト/分/IP**
- X-Forwarded-For / X-Real-IP ヘッダー対応
- 429 Too Many Requests + Retry-After ヘッダー
- 10分間非アクティブでクリーンアップ

### 2.3 Oracle Cloud へのデプロイ

```bash
# SSH接続
ssh -i <my-ssh-key-path> ubuntu@<my-instance-ip>

# Goインストール
sudo apt update && sudo apt install -y golang-go

# コードアップロード・ビルド
scp -i <my-ssh-key-path> proxy/main.go ubuntu@<my-instance-ip>:/home/ubuntu/brawl-proxy/
ssh -i <my-ssh-key-path> ubuntu@<my-instance-ip> "cd /home/ubuntu/brawl-proxy && go build -o brawl-proxy main.go"

# systemd サービス設定
sudo tee /etc/systemd/system/brawl-proxy.service << 'EOF'
[Unit]
Description=Brawl Stars API Proxy Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/brawl-proxy
EnvironmentFile=-/home/ubuntu/brawl-proxy/.env
ExecStart=/home/ubuntu/brawl-proxy/brawl-proxy
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable brawl-proxy
sudo systemctl start brawl-proxy
```

---

## 3. ドメイン構成の設計

| 役割 | ドメイン |
|------|----------|
| フロント | https://www.brawl-stats.com |
| API | https://api.brawl-stats.com |

- 既存ドメイン `brawl-stats.com` を流用
- サブドメインで API を分離

---

## 4. DNS設定（お名前.com）

### 実施内容

A レコード追加：
```
api.brawl-stats.com → <my-instance-ip>
```

### ポイント

- サブドメイン追加自体に **追加料金なし**
- TTL はデフォルト（3600秒）

---

## 5. Oracle Cloud 側のネットワーク設定（VCN）

### OCI の防御構造

OCI は **二重ファイアウォール構造** になっている：

1. VCN セキュリティリスト（クラウド側）
2. Ubuntu iptables（OS側）

👉 どちらかが閉じていると通信不可

### 5.1 セキュリティリスト（VCN）

追加した Ingress ルール：

| Port | 用途 |
|------|------|
| 22 | SSH |
| 80 | Let's Encrypt / HTTP→HTTPS |
| 443 | HTTPS（本番） |
| 8080 | 初期デバッグ用（後で削除） |

```
Source: 0.0.0.0/0
Protocol: TCP
```

※ 実際の編集箇所は VNIC ではなく「**サブネットに紐づくセキュリティリスト**」

### 5.2 iptables 設定（Claude Code）

初期設定（HTTP プロキシ時）：
```bash
sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
```

---

## 6. Ubuntu へ SSH ログイン

```bash
ssh -i <my-ssh-key-path> ubuntu@<my-instance-ip>
```

---

## 7. Caddy のインストール

```bash
sudo apt update
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl

curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg

curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list

sudo apt update
sudo apt install -y caddy
```

確認：
```bash
caddy version
```

---

## 8. Caddyfile の設定

```bash
sudo nano /etc/caddy/Caddyfile
```

```
api.brawl-stats.com {
    reverse_proxy 127.0.0.1:8080
}
```

- 外部：443（HTTPS）
- 内部：8080（HTTP）

---

## 9. Caddy 起動

```bash
sudo systemctl reload caddy
sudo systemctl status caddy
```

---

## 10. Let's Encrypt が失敗 → 原因調査

### 発生したエラー

```
challenge failed
Error getting validation data
```

### 調査内容

- DNS：OK
- Caddy：80 / 443 LISTEN → OK
- OCI セキュリティリスト：OK

### 真の原因

**Ubuntu の iptables が 80 / 443 を REJECT していた**

👉 Oracle Cloud の Ubuntu イメージは iptables がデフォルトで厳しめ

---

## 11. iptables の修正

```bash
sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT
```

---

## 12. 証明書取得成功

```
certificate obtained successfully
```

- tls-alpn-01（443）
- Let's Encrypt による自動発行完了

---

## 13. 動作確認

```bash
curl -Ik https://api.brawl-stats.com
curl https://api.brawl-stats.com/health
```

```json
{"status":"ok"}
```

---

## 14. フロント側の修正（Claude Code）

### 14.1 環境変数の設定

`.env.local` / Amplify 環境変数：
```
NEXT_PUBLIC_BRAWL_API_PROXY=https://api.brawl-stats.com
```

### 14.2 page.tsx の修正

```typescript
// プロキシサーバーURL（環境変数から取得、フォールバックはローカルAPI）
const API_BASE = process.env.NEXT_PUBLIC_BRAWL_API_PROXY || '';

// プロキシサーバーまたはローカルAPIを使用
const playerUrl = API_BASE
  ? `${API_BASE}/api/player/${cleanTag}`
  : `/api/player/${encodeURIComponent(tag)}`;
```

### 修正前後

| 修正前 | 修正後 |
|--------|--------|
| `http://<my-instance-ip>:8080/api/...` | `https://api.brawl-stats.com/api/...` |

👉 ブラウザの Network タブで HTTPS を確認

---

## 15. セキュリティ整理

### 不要になったもの

- OCI セキュリティリストの TCP 8080
- Caddy 経由で不要
- 外部公開リスク削減

### 最終公開ポート

| Port | 状態 |
|------|------|
| 22 | SSH |
| 80 | ACME / リダイレクト |
| 443 | HTTPS |
| 8080 | 内部のみ |

---

## 16. iptables 永続化

```bash
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
```

---

## 17. 最終構成（完成）

### システム構成図

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ユーザー (Browser)                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AWS Amplify (Frontend)                            │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  https://www.brawl-stats.com                                           │ │
│  │  ├─ Next.js 15 (App Router)                                            │ │
│  │  ├─ React 19                                                           │ │
│  │  ├─ TypeScript                                                         │ │
│  │  └─ Tailwind CSS                                                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  環境変数: NEXT_PUBLIC_BRAWL_API_PROXY=https://api.brawl-stats.com           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS (API呼び出し)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Oracle Cloud Infrastructure (API)                      │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  VM.Standard.E2.1.Micro (Always Free)                                  │ │
│  │  Ubuntu 22.04 LTS                                                      │ │
│  │  IP: <my-instance-ip>                                                  │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Caddy (Reverse Proxy)                                           │  │ │
│  │  │  https://api.brawl-stats.com:443                                 │  │ │
│  │  │  ├─ 自動 HTTPS (Let's Encrypt)                                   │  │ │
│  │  │  └─ HTTP → HTTPS リダイレクト                                     │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │                              │                                         │ │
│  │                              │ HTTP (localhost)                        │ │
│  │                              ▼                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Go Proxy Server (brawl-proxy)                                   │  │ │
│  │  │  127.0.0.1:8080                                                  │  │ │
│  │  │  ├─ /api/player/{tag}   - プレイヤー情報                          │  │ │
│  │  │  ├─ /api/battlelog/{tag} - バトルログ                             │  │ │
│  │  │  ├─ /health             - ヘルスチェック                          │  │ │
│  │  │  ├─ CORS ヘッダー付与                                             │  │ │
│  │  │  └─ Rate Limit: 30 req/min/IP (Token Bucket)                     │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  Firewall:                                                                  │
│  ├─ VCN Security List: 22, 80, 443                                          │
│  └─ iptables: 22, 80, 443, 8080(内部)                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS + Bearer Token
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Brawl Stars Official API                            │
│  https://api.brawlstars.com/v1                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 開発・運用フロー

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              開発フロー (Git)                                │
│                                                                             │
│   feature/* ──PR──▶ develop ──/sync──▶ master                               │
│   fix/*                                                                     │
│   docs/*                                                                    │
│                                                                             │
│   GitHub Actions:                                                           │
│   └─ master push → AWS Amplify 自動デプロイ                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         プロキシデプロイフロー                                │
│                                                                             │
│   /deploy-proxy コマンド実行                                                 │
│   ├─ 1. proxy/main.go を SCP でアップロード                                  │
│   ├─ 2. SSH で go build 実行                                                │
│   └─ 3. systemctl restart brawl-proxy                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 簡易図

```
Browser (HTTPS)
   ↓
AWS Amplify (https://www.brawl-stats.com)
   ↓
Caddy (https://api.brawl-stats.com:443)
   ↓
Go Proxy Server (127.0.0.1:8080)
   ↓ (Authorization: Bearer <API_KEY>)
Brawl Stars API
```

---

## 18. Git ワークフロー整備（Claude Code）

### 18.1 CLAUDE.md の作成

プロジェクトルールを記載：
- PRは必ず `develop` ブランチをベースに
- Oracle Cloud サーバー情報
- 環境変数一覧

### 18.2 スキル（コマンド）の作成

| コマンド | 説明 |
|----------|------|
| `/deploy-proxy` | プロキシサーバーをOracle Cloudにデプロイ |
| `/pr` | developベースでPR作成 |
| `/sync` | develop → master 同期（リリース） |

### 18.3 GitHub CLI のセットアップ

```bash
# Linux (WSL) にインストール
sudo apt install gh

# 認証
gh auth login

# SSH known_hosts に GitHub を追加
ssh-keyscan github.com >> ~/.ssh/known_hosts
```

---

## 19. 学び・備忘

- OCI は VCN + OS の **二重防御**
- Caddy は自動化が強いが **80/443 は必須**
- Mixed Content は **HTTPS 化以外で解決不可**
- ログを読めば原因は必ず出る
- `NEXT_PUBLIC_*` 環境変数は **ビルド時に埋め込まれる** → 設定後に再デプロイ必須
- Claude Code / ChatGPT の併用は **設計と実装の分離** に向いている

---

## 20. 今後の改善案（インフラ・運用）

- [x] ~~CORS ヘッダの明示化~~ （実装済み）
- [x] ~~rate limit~~ （実装済み：30 req/min/IP）
- [ ] サーバーエラーログを通知する仕組み
- [ ] API Gateway 化
- [ ] Terraform 化
- [ ] Google AdSense で広告を有効化

---

## 21. 実装案リスト（機能）

### Brawlify API を活用した機能

Brawlify API（https://api.brawlify.com）は無料で以下のデータを提供：

| エンドポイント | 内容 |
|---------------|------|
| `/v1/events` | 現在のイベント（マップごとのブロウラー勝率・使用率を含む） |
| `/v1/maps` | 全マップ一覧（各マップでのブロウラー統計を含む） |
| `/v1/brawlers` | ブロウラー一覧（スター/ガジェット情報含む） |

#### 機能案

1. **現在のイベント表示**
   - 開催中のイベント/マップを表示
   - 各マップで強いブロウラーTOP5を表示

2. **マップ別ブロウラーランキング**
   - 各マップでの勝率・使用率Top10
   - ソート切り替え（勝率順/使用率順）

3. **おすすめブロウラー提案**
   - プレイヤーが所持しているブロウラーの中からマップに最適なものを提案
   - 「あなたの○○はこのマップで勝率XX%！」

4. **ブロウラー詳細ページ**
   - 各ブロウラーの詳細情報
   - マップ別の得意・不得意表示

### その他の機能案

5. **バトルログの詳細分析**
   - 勝率推移グラフ
   - 時間帯別の戦績
   - よく使うブロウラー統計

6. **クラブ機能**
   - クラブメンバー一覧
   - クラブ内ランキング

7. **比較機能**
   - 2人のプレイヤーを比較

---

## 参考：サーバー情報

| 項目 | 値 |
|------|-----|
| IP | <my-instance-ip> |
| SSH Key | <my-ssh-key-path> |
| User | ubuntu |
| サービス名 | brawl-proxy |
| API URL | https://api.brawl-stats.com |


