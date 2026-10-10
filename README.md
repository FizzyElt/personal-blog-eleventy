# personal-blog-eleventy

FizzyElt 的個人部落格，使用 Eleventy、Markdown 與 TSX（模板）建置，部署至 Cloudflare Workers Static Assets（靜態資源）。

## 快速開始

使用 Node.js 24 以上，版本設定見 `.node-version`。

```sh
npm ci
npm run dev
```

開發伺服器預設位於 http://localhost:8080。

```sh
npm run typecheck
npm run build
```

靜態網站輸出至 `_site/`。`npm run build:ci` 依序執行型別檢查與建置；`npm run deploy` 先建置再部署。

## 文件

- [寫作指南](docs/content.md)：文章分類、前置資料、草稿、網址、圖片與分享封面。
- [開發指南](docs/development.md)：專案結構、集中設定、TypeScript、Markdown 渲染、主題與自動分享預覽圖。
- [部署指南](docs/cloudflare.md)：Cloudflare 建置設定、正式網址、本機預覽與發布。

## 參考

- [Eleventy 入門](https://www.11ty.dev/docs/)
- [Eleventy 設定](https://www.11ty.dev/docs/config/)
- [Eleventy 模板](https://www.11ty.dev/docs/layouts/)
