# Brawl Stats Analyzer

Brawl Starsのプレイヤー統計を分析するWebアプリケーション

## 機能

- 🔍 プレイヤー検索（タグ入力）
- 📊 プレイヤープロフィール表示
- 🎮 ブロウラー一覧と詳細統計
- 📈 トロフィー分布グラフ
- ⚔️ 最近のバトルログ表示
- 📉 詳細なバトル分析（勝率、モード別統計）
- ⚖️ プレイヤー比較機能（最大3人）

## セットアップ

### 1. API キーの取得

1. [Brawl Stars Developer Portal](https://developer.brawlstars.com/) にアクセス
2. アカウントを作成してログイン
3. APIキーを作成（IPアドレスの登録が必要）

### 2. 環境変数の設定

`.env.local` ファイルを作成:

```bash
cp .env.local.example .env.local
```

`.env.local` を編集してAPIキーを設定:

```
BRAWL_STARS_API_KEY=your_actual_api_key_here
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 広告設定（Google AdSense）

サイトに広告を表示して収益化する場合：

### 1. Google AdSenseアカウントの作成

1. [Google AdSense](https://www.google.com/adsense/) にアクセス
2. アカウントを作成し、サイトを登録
3. 審査に合格後、パブリッシャーIDを取得

### 2. 環境変数の設定

`.env.local` に追加:

```
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

### 3. 広告スロットの設定

`app/page.tsx` 内の `AdBanner` コンポーネントの `slot` 属性を、AdSenseで作成した広告ユニットのIDに変更:

```tsx
<AdBanner slot="あなたの広告スロットID" format="horizontal" />
```

### 4. 広告の配置場所

現在の広告配置：
- 検索バーの下（横長バナー）
- プロフィールの下（レクタングル）
- ブロウラー一覧の下（横長バナー）
- バトル分析の下（横長バナー）
- 比較結果の下（横長バナー）

### 注意事項

- 開発環境（localhost）ではプレースホルダーが表示されます
- 本番環境にデプロイ後、実際の広告が表示されます
- Supercellの[Fan Content Policy](https://supercell.com/en/fan-content-policy/)に準拠しています

## 使い方

1. プレイヤータグを入力（例: `#2PP`, `#8CG8LUJ`）
2. 検索ボタンをクリック
3. プレイヤーの統計情報が表示されます
4. タブで「プロフィール」「バトル分析」「比較」を切り替え
5. 複数プレイヤーを検索して「比較に追加」で比較可能

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **グラフ**: Recharts
- **API**: Brawl Stars Official API
- **広告**: Google AdSense

## プロジェクト構造

```
brawl-stats-analyzer/
├── app/
│   ├── api/              # API Routes
│   │   ├── player/       # プレイヤー情報取得
│   │   └── battlelog/    # バトルログ取得
│   ├── layout.tsx        # レイアウト
│   ├── page.tsx          # メインページ
│   └── globals.css       # グローバルスタイル
├── components/           # Reactコンポーネント
│   ├── PlayerSearch.tsx
│   ├── PlayerProfile.tsx
│   ├── BrawlerList.tsx
│   ├── TrophyDistribution.tsx
│   ├── BattleLog.tsx
│   ├── BattleAnalysis.tsx
│   ├── PlayerCompare.tsx
│   └── AdBanner.tsx      # 広告コンポーネント
├── lib/
│   └── types.ts          # TypeScript型定義
└── public/               # 静的ファイル
```

## API エンドポイント

### プレイヤー情報取得
```
GET /api/player/[tag]
```

### バトルログ取得
```
GET /api/battlelog/[tag]
```

## 注意事項

- APIキーは必ずサーバーサイド（API Routes）で管理してください
- レート制限があるため、キャッシングを活用しています
  - プレイヤー情報: 5分間キャッシュ
  - バトルログ: 1分間キャッシュ

## デプロイ（AWS Amplify）

### 1. AWS Amplifyでのセットアップ

1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/) にアクセス
2. 「Host web app」→「GitHub」を選択
3. リポジトリ `brawl-stats-analyzer` を選択
4. ブランチを選択：
   - **本番環境**: `main` ブランチ
   - **開発環境**: `develop` ブランチ
5. ビルド設定は自動検出（`amplify.yml`を使用）

### 2. 環境変数の設定

Amplify Console → アプリ → 環境変数で以下を設定：

| 変数名 | 値 |
|--------|-----|
| `BRAWL_STARS_API_KEY` | APIキー |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense ID（任意） |

### 3. ブランチ運用

```
main (本番環境 - production)
  └── develop (開発環境 - staging)
        └── feature/* (機能開発ブランチ)
```

- `feature/*` → `develop` へPR → 開発環境で確認
- `develop` → `main` へPR → 本番環境にデプロイ

### 4. カスタムドメイン（任意）

Amplify Console → ドメイン管理で独自ドメインを設定可能

### 無料枠

- ビルド: 1000分/月
- 配信: 15GB/月
- ストレージ: 5GB

## ライセンス

MIT

## 謝辞

- [Brawl Stars API](https://developer.brawlstars.com/) - Supercell

## 免責事項

This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it.
