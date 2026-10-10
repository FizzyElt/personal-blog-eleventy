# 開發指南

## 專案結構

| 路徑                      | 用途                                     |
| ------------------------- | ---------------------------------------- |
| `eleventy.config.ts`      | 集中管理 Eleventy 設定，依功能區塊分類   |
| `src/content/`            | 首頁、文章與寫作範本                     |
| `src/_data/site.json`     | 網站名稱、摘要、網址、共用封面與頁尾連結 |
| `src/_includes/`          | Nunjucks 共用版型與分享圖片模板          |
| `src/assets/`             | CSS、圖片及直接複製的靜態資源            |
| `src/client/`             | 主題切換與 Mermaid 瀏覽器程式            |
| `lib/markdown.ts`         | Markdown 外掛與程式碼高亮整合            |
| `scripts/build-client.ts` | esbuild 瀏覽器程式編譯                   |
| `types/content.ts`        | 文章資料及集合的型別定義                 |
| `fonts/`                  | 分享圖片的建置用字型與授權               |

## Eleventy 設定

設定集中在 `eleventy.config.ts`，依序分成五個區塊：

1. 分享預覽圖：外掛、字型、圖片雜湊與監看設定。
2. 模板篩選器：`absoluteUrl`、`dateISO`、`tagUrl`。
3. 內容：寫作範本與草稿排除、文章排序、分類及標籤集合。
4. 資源：瀏覽器程式建置、檔案監看與靜態資源複製。
5. Markdown 與模板引擎：渲染器、輸入／輸出目錄與支援格式。

首頁「最新內容」在 `src/_includes/article.njk` 取前五筆公開內容；分類與標籤頁使用完整集合。

## 指令與 TypeScript

| 指令                | 用途                          |
| ------------------- | ----------------------------- |
| `npm run dev`       | 建置、監看與本機伺服器        |
| `npm run watch`     | 建置與監看                    |
| `npm run build`     | 產出 `_site/`                 |
| `npm run typecheck` | 分別檢查 Node.js 與瀏覽器程式 |
| `npm run build:ci`  | 型別檢查後建置                |

Node.js 24 以 Type Stripping（型別移除）執行設定檔與腳本，本地 import 使用 `.ts` 副檔名。執行與建置不會代替型別檢查。

`tsconfig.json` 使用 NodeNext，`tsconfig.browser.json` 使用 DOM 型別與 Bundler 模組解析；兩者皆啟用 `strict`、`noEmit` 與 `erasableSyntaxOnly`。`types/content.ts` 只提供編譯期型別，不驗證文章的 YAML 資料。

Node.js 設定的 `allowJs` 與 `maxNodeModuleJsDepth: 1` 用來讀取 Eleventy 的 JavaScript 型別資訊，`checkJs: false` 避免檢查上游實作。

## 建置產物

`_site/` 是完整網站輸出；`.generated/` 存放編譯後的瀏覽器程式。兩者都忽略版控，不直接編輯。

建置不會自動清空 `_site/`。刪除文章、更改網址或將已公開文章改成草稿後，先移除 `_site/` 再建置，避免舊頁面殘留；清空輸出也會移除分享圖片快取。

## 瀏覽器程式與靜態資源

`dev`、`watch` 與 `build` 共用 `eleventy.before` 事件，呼叫 `scripts/build-client.ts`：

- `src/client/theme.ts` 編譯為 `.generated/theme.js`，使用 IIFE（立即執行函式），在頁面內容載入前設定主題。
- `src/client/mermaid.ts` 編譯為 `.generated/mermaid.js`，使用 ESM（模組）；只有含圖表的頁面會動態載入 Mermaid。
- Eleventy 將生成程式複製至 `/assets/`，並從 npm 套件複製 Mermaid、KaTeX 樣式與字型。

修改 `src/client/`、`lib/` 或編譯腳本會觸發重新建置。生成內容未變時不重寫檔案，避免監看循環。

## Markdown 渲染

`lib/markdown.ts` 集中設定渲染器：

- `markdown-it`：基本 Markdown、表格、刪除線、HTML 與自動連結。
- `markdown-it-anchor`：標題錨點，保留中文字、轉小寫並以連字號取代空白。
- Shiki：程式碼高亮，使用 One Light／One Dark Pro；未載入的語言回退為純文字。
- KaTeX：行內及區塊公式，設定 `throwOnError: false`、`trust: false`。
- Mermaid：交由瀏覽器渲染，使用 `securityLevel: "strict"`；失敗時保留原始內容與錯誤提示。

Eleventy 關閉 Markdown 的 Liquid 預處理，使 `{{ title }}`、`{% raw %}` 等模板語法保持原文。調整渲染器或版型後，以實際文章確認公式、圖表、程式碼與窄螢幕排版。

## 主題與頁尾

`src/assets/styles.css` 定義明暗配色與版面。`src/client/theme.ts` 首次依系統偏好設定主題，手動選擇以 `localStorage` 的 `blog-theme` 保存；儲存不可用時仍可切換當前頁面。

主題變更會發出 `themechange` 事件，Mermaid 依目前配色重新渲染，Shiki 則由樣式切換雙主題。

頁尾位於 `src/_includes/footer.njk`。編輯 `src/_data/site.json` 的 `footerLinks` 陣列即可新增、移除或排序連結：

```json
{ "label": "GitHub", "url": "https://github.com/fizzyelt" }
```

每個項目提供顯示名稱 `label` 與網址 `url`；空陣列會隱藏連結列表。

## 文章分享預覽圖

使用 `eleventy-plugin-og-image` 在建置時生成 PNG，隨網站一起部署。文章使用規則與手動封面設定見[寫作指南](content.md#圖片與分享封面)。

| 項目                 | 位置或設定                                                                     |
| -------------------- | ------------------------------------------------------------------------------ |
| 外掛、字型與快取設定 | `eleventy.config.ts` 的分享預覽圖區塊                                          |
| 卡片版型             | `src/_includes/social-card.og.njk`                                             |
| 分享中繼資料         | `src/_includes/base.njk`                                                       |
| 圖片輸出             | `_site/og-images/`，1200×630 PNG                                               |
| 字型                 | `fonts/NotoSansCJKtc-Regular.otf`，來源及授權見 [字型說明](../fonts/README.md) |

`base.njk` 透過 `ogImage` 短碼取得圖片路徑，再以 `absoluteUrl` 轉成絕對網址，同時提供給 `og:image` 與 `twitter:image`。

執行 `npm run dev` 後，檢視文章 HTML 的 `og:image`，取出 `/og-images/圖片雜湊.png` 路徑並在本機伺服器開啟。額外的 HTML/SVG 預覽頁已關閉，只輸出最終 PNG。

卡片使用固定明亮配色。標題依長度調整字級，摘要過長時截短；沒有摘要或日期時省略對應區域。字型只在建置時讀取，不會發布至網站，更換後需重新啟動開發伺服器。

圖片檔名由模板內容、輸出設定與字型內容雜湊決定，檔案已存在時會跳過轉換。清空 `_site/` 或全新建置環境會重新產圖。

版型受 Satori 的 HTML/CSS 子集限制，調整時需檢查長標題與中英混排；目前未配置 emoji（表情符號）圖片資產。外掛及排版能力參考 [eleventy-plugin-og-image](https://github.com/KiwiKilian/eleventy-plugin-og-image) 與 [Satori](https://github.com/vercel/satori)。

## 依賴維護

更新套件後執行 `npm run build:ci`，並以瀏覽器確認頁面與分享圖片。使用 `npm audit` 查看當下的依賴問題；強制修復前先確認相容性。
