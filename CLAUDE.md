# Project Rules for Claude

## Git Workflow

- **IMPORTANT**: Always create PRs targeting `develop` branch, NOT `master`
- Use `gh pr create --base develop` when creating pull requests
- Branch naming: `feature/*`, `fix/*`, `docs/*`
- **NEVER commit directly to `develop` or `master`** - always create a feature branch first
- **NEVER run `/sync` automatically** - wait for user to manually execute it
- **プッシュ前のPR確認**: 追加の変更をプッシュする前に、対象PRがマージ済みか確認すること
  - マージ済みの場合: developから新しいブランチを作成し、新規PRを出す
  - 未マージの場合: 既存ブランチにプッシュしてPRを更新

## Project Structure

- Frontend: Next.js 14 (App Router) + TypeScript
- Proxy Server: Go (deployed on Oracle Cloud)
- Styling: Tailwind CSS with Brawl Stars theme

## MCP Servers (Claude Code)

| Server | Role |
|--------|------|
| memory | Knowledge graph for persistent memory across sessions |
| memory-bank | Project-specific documentation storage |
| filesystem | File operations with directory restrictions |
| github | GitHub API operations (issues, PRs, repos) |
| playwright | Browser automation for testing and screenshots |

## API

- Brawl Stars API: via proxy server (NEXT_PUBLIC_BRAWL_API_PROXY)
- Brawlify API: for map/brawler assets (https://api.brawlify.com)

## Environment Variables

- `BRAWL_STARS_API_KEY` - API key for local development
- `NEXT_PUBLIC_BRAWL_API_PROXY` - Proxy server URL
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` - Google AdSense client ID

## Oracle Cloud Proxy Server

- IP: <my-instance-ip>
- Port: 8080
- SSH Key: <my-ssh-key-path>
- User: ubuntu
- Service: systemctl (brawl-proxy)

## Local Development

- ローカル確認を依頼された場合は `localhost` ではなく `127.0.0.1` を使用すること
- 例: `http://127.0.0.1:3000`

## 修正確認ルール

修正を依頼されたときは必ず以下を行うこと：

1. **ブラウザで修正を確認** - Playwrightを使用してローカル環境で動作確認
2. **スクリーンショットを撮る** - 該当箇所のスクリーンショットを保存
3. **修正が反映されていない場合** - 再度修正を行い、再確認する
4. **確認完了まで繰り返す** - 修正が正しく反映されるまでこのサイクルを繰り返す

## Custom Commands

### /local-restart
ローカル開発サーバーをキャッシュクリアして再起動する。
```bash
cd /mnt/c/Users/toyin/brawl-stats-analyzer && rm -rf .next && npm run dev
```
