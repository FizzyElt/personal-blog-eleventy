# Cloudflare 部署與連結預覽

正式網址：https://personal-blog-eleventy.fizzyelt8786.workers.dev

使用 Cloudflare Workers Static Assets，沒有額外的伺服器程式碼。Wrangler 上傳 `_site/`，保留文章目錄網址，未知網址回傳 `404.html`，不將錯誤網址導向首頁。

## 首次部署

1. 使用 Node.js 24，執行 `npm ci`。
2. 執行 `npx wrangler login`，在瀏覽器完成 Cloudflare 登入與授權。
3. 確認要使用的帳戶與 Workers 子網域。預設網站名稱為 `personal-blog-eleventy`，正式網址為 `https://personal-blog-eleventy.<你的子網域>.workers.dev`。
4. 將正式網址填入 `src/_data/site.json` 的 `url`，或設定 `SITE_URL` 環境變數。
5. 執行 `npm run deploy`，會先檢查網址、建置及檢查分享資訊，再部署。

正式網址未設定時，部署指令會停止，避免把 localhost 寫入分享資訊。多帳戶時，以 `CLOUDFLARE_ACCOUNT_ID` 明確選擇帳戶。登入憑證不加入專案。

## GitHub push 自動部署

Repository：https://github.com/FizzyElt/personal-blog-eleventy

使用 Cloudflare Workers Builds，連接現有的 `personal-blog-eleventy` Worker。在 Cloudflare 控制台開啟 **Workers & Pages → personal-blog-eleventy → Settings → Builds → Connect**，選 GitHub 與此 repository。GitHub App 如需授權，僅選擇此 repository。

設定如下：

| 欄位 | 值 |
| --- | --- |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `npm run build:ci` |
| Deploy command | `npx wrangler deploy` |
| Build variable `NODE_VERSION` | `24` |
| Build variable `SITE_URL` | `https://personal-blog-eleventy.fizzyelt8786.workers.dev` |

正式網址已寫入 `src/_data/site.json`；`SITE_URL` 可明確指定建置使用的網域。Node.js 24 也已在 `.node-version` 指定。Cloudflare 自動安裝套件，使用 repository 的 `package-lock.json`。

只啟用 `main` 的正式部署；初次設定先關閉非正式分支的自動建置。未來如果需要 PR 預覽，再獨立設定。

`npm run build:ci` 會依序檢查正式網址、TypeScript、建置、Markdown 渲染與分享資訊；任一步失敗即停止，Cloudflare 不會進入部署階段。遷移基準檢查保留為手動工具，不限制日後正常修改文章標題或日期。

Cloudflare 控制台中的 GitHub 授權與連接設定不由 `wrangler.jsonc` 管理。連接成功後，push 至 `main` 才會觸發自動部署；可在 Worker 的 Builds 查看對應 commit 的執行結果。首次務必確認建置與部署皆成功，之後才算完成整合。

### 日常發布流程

修改文章或網站後，將變更 commit 並 push 至 `main`。Cloudflare Workers Builds 收到 push 後會執行上面的建置及部署指令。發布時查看 Builds 中對應的 commit SHA，確認整個流程成功；僅看到 GitHub push 成功不代表網站已更新。

本機手動部署仍可使用 `npm run deploy`。不要同時啟用第二套 GitHub Actions 部署，以免重複發布。

## 連結預覽

共用封面是 `src/assets/social-cover.png`，1200×630 PNG，沿用網站配色。每頁會輸出 Open Graph、Twitter Card 和 canonical URL；文章使用自己的 `title`、`description`，沒有摘要時使用網站摘要。

如單篇文章需要獨立封面，可在 front matter 加入：

```yaml
socialImage: /assets/my-cover.png
socialImageAlt: 封面的文字說明
```

圖片放在 `src/assets/`，建置時會一起發布。換正式網域後需更新 `site.url` 或 `SITE_URL` 並重新部署。社群平台可能快取既有預覽，更新後須等待平台重新抓取。

本機檢查：`npm run typecheck`、`npm run build`、`npm run check:sharing`。部署設定檢查：`npx wrangler deploy --dry-run`（不發布）。模擬 Cloudflare 路由：先建置後執行 `npm run preview:cloudflare`。

官方文件：

- https://developers.cloudflare.com/workers/static-assets/get-started/
- https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/
- https://developers.cloudflare.com/workers/ci-cd/builds/
- https://ogp.me/
