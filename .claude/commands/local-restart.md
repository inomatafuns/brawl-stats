# /local-restart コマンド

ローカル開発サーバーをキャッシュクリアして再起動します。

## 実行内容

1. `.next` キャッシュフォルダを削除
2. `npm run dev` で開発サーバーを起動

## コマンド

```bash
cd /mnt/c/Users/toyin/brawl-stats-analyzer && rm -rf .next && npm run dev
```

このコマンドをバックグラウンドで実行し、サーバーが起動したら http://127.0.0.1:3000 で確認できることをユーザーに伝えてください。
