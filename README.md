# personal-blog-eleventy

依照 [Eleventy 官方入門文件](https://www.11ty.dev/docs/)建立的個人部落格基礎專案，使用 ESM（模組）、Markdown 與 Nunjucks（模板）。

## 執行

使用 Node.js 24 以上；設定檔與工具腳本透過 Node.js 原生 Type Stripping（型別移除）執行。

```sh
npm ci
npm run dev
```

開發伺服器預設位於 http://localhost:8080，可自動重新載入修改。

```sh
npm run build
```

靜態網站輸出至 `_site/`；部署時發布此目錄。

## 結構

- `eleventy.config.ts`：輸入／輸出目錄、模板引擎與靜態資源設定。
- `src/content/index.md`：原部落格首頁。
- `src/content/posts/`、`notes/`、`tech/`：文章、短筆記與技術筆記。
- `src/content/content.11tydata.json`：文章共用版型；各分類目錄的資料檔提供分類資訊。
- `src/_data/migration.json`：固定的舊網址轉址表。
- `lib/markdown.ts`：Markdown 外掛整合。
- `src/_includes/base.njk`：共用 HTML 版型。
- `src/assets/`：直接複製到輸出的靜態資源。

文章使用 YAML front matter（前置資料）指定 `title`、`date`、`permalink`、`tags`、`description` 等資料；`src/content/` 透過 Directory Data File（目錄資料檔）自動套用文章版型。Markdown 已關閉 Liquid 預處理，避免技術文章中的模板語法被執行。

目前已加入程式碼高亮、KaTeX 公式、Mermaid 與標題錨點。測試範本保留在 `tests/fixtures/markdown/`，不會發布到網站。完整盤點及待辦見 [Markdown 支援紀錄](docs/markdown-support.md)。既有內容已搬入，包含日期排序、網址適配、草稿排除、分類與標籤列表；RSS 與搜尋尚待加入。

```sh
npm run build
npm run check:markdown
```

## TypeScript

設定檔、`lib/`、`scripts/` 與 `src/client/` 使用 TypeScript；Markdown、Nunjucks、JSON 與 CSS 維持原格式。詳見 [TypeScript 工作流程](docs/typescript.md)。

```sh
npm run typecheck
```

這個指令分別檢查 Node.js 與瀏覽器程式。`npm run build`、`dev`、`watch` 都會在 Eleventy 建置前自動以 esbuild 編譯瀏覽器程式。型別檢查需另外執行，Node.js 型別移除不會代替它。

## 官方參考

- [Getting Started](https://www.11ty.dev/docs/)
- [Configuration](https://www.11ty.dev/docs/config/)
- [Layouts](https://www.11ty.dev/docs/layouts/)
- [Markdown](https://www.11ty.dev/docs/languages/markdown/)
- [Passthrough File Copy](https://www.11ty.dev/docs/copy/)

## 相依套件檢查紀錄

2026-10-09：安裝官方穩定版 `@11ty/eleventy@3.1.6` 後，`npm audit` 回報 9 項開發依賴問題（4 moderate、5 high），根源包含間接依賴 `braces` 與 `sprintf-js`。目前 audit 的自動修復建議會將 Eleventy 降至 `0.6.0`，因此未套用 `npm audit fix --force`。需要追蹤上游相容修復；此紀錄不代表漏洞已解決。

- [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- [sprintf-js advisory](https://github.com/advisories/GHSA-hp3w-g68c-fv3c)

新增 Markdown 依賴後，audit 共 11 項（2 low、4 moderate、5 high）；新增 2 項 low 來自 Mermaid 間接使用的 KaTeX。未套用會將 Mermaid 降版至 10.8.0 的強制修復。公式 plugin 使用的直接 KaTeX 為 0.19.0；Mermaid 設定為 strict。這些設定不代表間接漏洞已修復。

## 文章與遷移規則

文章位於 `src/content/`。日期使用 Eleventy 原生 `date`，網址直接由 `permalink` 指定，站內文章連結使用 `/posts/slug/` 形式。完整遷移規則與驗證方式見 [docs/content-migration.md](docs/content-migration.md)。

## 配色與版面

`src/assets/styles.css` 的 `:root` 集中定義原部落格的明暗配色，隨系統主題切換。頁面背景、文字、連結、引用、標籤與選取色使用這組變數；程式碼使用 Shiki 的 One Light／One Dark Pro。

### 明亮與深色模式

導覽列的主題按鈕可切換明亮／深色模式，沿用原部落格配色。首次瀏覽依系統偏好顯示；手動選擇後以 `localStorage` 的 `blog-theme` 記住偏好，跨頁面與重新整理皆保留。瀏覽器禁止儲存時仍可切換目前頁面。程式碼與 Mermaid 圖表會同步切換。

`src/client/theme.ts` 在頁面內容載入前設定主題，避免配色閃爍；由 `scripts/build-client.ts` 編譯成 `/assets/theme.js`。

### Cloudflare 與分享預覽

已設定 Cloudflare Workers Static Assets 與共用分享封面。GitHub 自動部署採用 Workers Builds，建置指令為 `npm run build:ci`；需要先在 Cloudflare 控制台連接 repository 的 `main` 分支。本機仍可用 `npm run deploy` 手動發布。詳細設定見 [部署與預覽文件](docs/cloudflare.md)。
