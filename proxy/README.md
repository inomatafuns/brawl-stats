# Brawl Stars API Proxy Server

Brawl Stars公式APIへのプロキシサーバー。CORSヘッダーを付与し、フロントエンドから直接APIにアクセスできるようにします。

## 機能

- `/api/player/{tag}` - プレイヤー情報を取得
- `/api/battlelog/{tag}` - バトルログを取得
- `/health` - ヘルスチェック
- CORSヘッダー付与（クロスオリジンリクエスト対応）

## 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `BRAWL_STARS_API_KEY` | Brawl Stars API キー | Yes |
| `PORT` | サーバーポート（デフォルト: 8080） | No |

## ローカル開発

```bash
# 環境変数を設定
export BRAWL_STARS_API_KEY="your_api_key_here"

# ビルド
go build -o brawl-proxy main.go

# 実行
./brawl-proxy
```

## Oracle Cloud へのデプロイ手順

### 1. 前提条件

- Oracle Cloud インスタンス（Ubuntu推奨）
- SSHアクセス設定済み
- Brawl Stars API キー（Oracle CloudインスタンスのIPを許可リストに追加）

### 2. Goのインストール

```bash
ssh -i your-key.pem ubuntu@your-instance-ip

# Goをインストール
sudo apt update
sudo apt install -y golang-go

# バージョン確認
go version
```

### 3. プロジェクトのデプロイ

```bash
# ディレクトリ作成
mkdir -p /home/ubuntu/brawl-proxy
cd /home/ubuntu/brawl-proxy

# main.goをサーバーにアップロード（ローカルから実行）
scp -i your-key.pem main.go ubuntu@your-instance-ip:/home/ubuntu/brawl-proxy/

# サーバー上でビルド
ssh -i your-key.pem ubuntu@your-instance-ip "cd /home/ubuntu/brawl-proxy && go build -o brawl-proxy main.go"
```

### 4. 環境変数ファイルの作成

```bash
# .envファイルを作成
echo "BRAWL_STARS_API_KEY=your_api_key_here" > /home/ubuntu/brawl-proxy/.env
```

### 5. systemdサービスの設定

```bash
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

# サービスを有効化・起動
sudo systemctl daemon-reload
sudo systemctl enable brawl-proxy
sudo systemctl start brawl-proxy

# ステータス確認
sudo systemctl status brawl-proxy
```

### 6. ファイアウォール設定

```bash
# iptablesでポート8080を開放
sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT

# 永続化（Ubuntu）
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
```

### 7. Oracle Cloud Security List設定

Oracle Cloudコンソールで以下を設定：

1. **Networking** > **Virtual Cloud Networks** > 対象VCN
2. **Security Lists** > デフォルトSecurity List
3. **Add Ingress Rules**:
   - Source CIDR: `0.0.0.0/0`
   - Destination Port Range: `8080`
   - Protocol: TCP

### 8. 動作確認

```bash
# ヘルスチェック
curl http://your-instance-ip:8080/health

# プレイヤー情報取得（タグ例: 2QPYUY20V）
curl http://your-instance-ip:8080/api/player/2QPYUY20V

# バトルログ取得
curl http://your-instance-ip:8080/api/battlelog/2QPYUY20V
```

## 運用コマンド

```bash
# サービス再起動
sudo systemctl restart brawl-proxy

# ログ確認
sudo journalctl -u brawl-proxy -f

# サービス停止
sudo systemctl stop brawl-proxy
```

## アーキテクチャ

```
[ユーザーブラウザ]
      ↓
[Next.js フロントエンド (Vercel/Amplify)]
      ↓
[Go Proxy Server (Oracle Cloud)]
      ↓ (Authorization: Bearer <API_KEY>)
[Brawl Stars API]
```

## フロントエンドとの連携

Next.jsアプリで使用する場合、`.env.local`に以下を設定：

```bash
NEXT_PUBLIC_BRAWL_API_PROXY=http://your-instance-ip:8080
```

## セキュリティ考慮事項

- APIキーは環境変数で管理し、コードにハードコードしない
- 本番環境ではCORS設定を特定のオリジンに制限することを推奨
- 必要に応じてレート制限を実装

## ライセンス

MIT
