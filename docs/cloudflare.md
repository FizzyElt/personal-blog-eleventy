# 部署指南

網站使用 Cloudflare Workers Static Assets（靜態資源），由 Wrangler 發布 `_site/`。

- 正式網址：[personal-blog-eleventy](https://personal-blog-eleventy.fizzyelt8786.workers.dev)
- Repository（程式碼儲存庫）：[FizzyElt/personal-blog-eleventy](https://github.com/FizzyElt/personal-blog-eleventy)
- Worker 名稱：`personal-blog-eleventy`
- 部署設定：`wrangler.jsonc`

`wrangler.jsonc` 設定 `auto-trailing-slash` 保留文章目錄網址，未知網址使用 `404-page` 處理。

## 自動部署

Cloudflare Workers Builds 使用以下設定；GitHub 授權與分支連接由 Cloudflare 控制台管理，不在 `wrangler.jsonc` 中。

| 欄位 | 值 |
| --- | --- |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `npm run build:ci` |
| Deploy command | `npx wrangler deploy` |
| Build variable `NODE_VERSION` | `24` |
| Build variable `SITE_URL` | `https://personal-blog-eleventy.fizzyelt8786.workers.dev` |

修改完成後 commit 並 push 至 `main`。`build:ci` 依序執行型別檢查與建置；發布後，在 Cloudflare Builds 確認對應 commit SHA 的建置及部署結果。

## 本機預覽與部署

安裝依賴後，可使用 Wrangler 模擬靜態資源路由：

```sh
npm run build
npm run preview:cloudflare
```

手動發布前，以 `npx wrangler login` 登入 Cloudflare，再執行：

```sh
npm run deploy
```

`predeploy` 會先執行建置。部署前可執行 `npx wrangler deploy --dry-run` 檢查設定而不發布。多帳戶時，以 `CLOUDFLARE_ACCOUNT_ID` 指定帳戶；登入憑證不加入版控。

本機建置不會自動清空 `_site/`；刪除文章、更改網址或草稿狀態後，先刪除 `_site/` 再重新建置與發布。

## 正式網址與分享資訊

網站名稱、摘要、正式網址與共用封面設定在 `src/_data/site.json`。`SITE_URL` 環境變數可覆寫建置使用的網址，影響 canonical URL（標準網址）與分享中繼資料。

換網域時更新 `site.url` 與 Cloudflare 的 `SITE_URL`，再重新建置部署。正式網址與分享資訊目前沒有自動檢查，發布前請確認網域及封面路徑。

單篇分享封面的設定見[寫作指南](content.md#圖片與分享封面)。社群平台可能快取既有預覽，修改後需要等待平台重新抓取。
