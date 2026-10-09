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

## 之後更新

執行 `npm run deploy`。如要從 Git 自動部署，可在 Cloudflare Workers Builds 連接存放此專案的 repository，設定：

- Node.js：24（專案的 `.node-version` 已設定）
- Build command：`npm run typecheck && npm run build && npm run check:sharing`
- Deploy command：`npx wrangler deploy`
- `SITE_URL`：正式 HTTPS 網址

此專案目前是獨立資料夾；需要先建立並推送 Git repository 才能使用 Git 自動部署。

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
