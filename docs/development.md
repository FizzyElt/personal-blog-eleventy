# 開發指南

## 專案結構

| 路徑 | 用途 |
| --- | --- |
| `eleventy.config.ts` | 目錄、集合、篩選器、草稿排除與靜態資源設定 |
| `src/content/` | 首頁、文章與寫作範本 |
| `src/_data/` | 網站共用資料 |
| `src/_includes/` | Nunjucks 共用版型 |
| `src/assets/` | CSS、圖片及直接複製的靜態資源 |
| `src/client/` | 主題切換與 Mermaid 瀏覽器程式 |
| `lib/markdown.ts` | Markdown 外掛與程式碼高亮整合 |
| `scripts/build-client.ts` | esbuild 瀏覽器程式編譯 |
| `types/content.ts` | 文章資料及集合的型別定義 |
| `tests/fixtures/markdown/` | 手動參考用語法範本，不發布至網站 |

## 指令與型別檢查

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 建置、監看與本機伺服器 |
| `npm run watch` | 建置與監看 |
| `npm run build` | 產出 `_site/` |
| `npm run typecheck` | 分別檢查 Node.js 與瀏覽器程式 |
| `npm run build:ci` | 型別檢查後建置 |

Node.js 24 以 Type Stripping（型別移除）執行設定檔與腳本，本地 import 明確使用 `.ts` 副檔名。執行與建置不會代替型別檢查。

`tsconfig.json` 使用 NodeNext，`tsconfig.browser.json` 使用 DOM 型別與 Bundler 模組解析；兩者皆啟用 `strict`、`noEmit` 與 `erasableSyntaxOnly`。`types/content.ts` 只提供編譯期型別，不驗證文章的 YAML 資料。

Node.js 設定中的 `allowJs` 與 `maxNodeModuleJsDepth: 1` 用來讀取 Eleventy 套件的 JavaScript 型別資訊；`checkJs: false` 避免檢查上游實作。

## 瀏覽器程式建置

`dev`、`watch` 與 `build` 共用 `eleventy.before` 事件，呼叫 `scripts/build-client.ts`：

- `src/client/theme.ts` 編譯為 `.generated/theme.js`，使用 IIFE（立即執行函式），在頁面內容載入前設定主題。
- `src/client/mermaid.ts` 編譯為 `.generated/mermaid.js`，使用 ESM（模組）；只有含圖表的頁面會動態載入 Mermaid。
- Eleventy 將生成程式複製至 `/assets/`，並從 npm 套件複製 Mermaid、KaTeX 樣式與字型。

修改 `src/client/`、`lib/` 或編譯腳本會觸發重新建置。生成內容未變時不重寫檔案，避免監看循環。`.generated/` 與 `_site/` 為忽略版控的建置產物。

## Markdown 渲染

`lib/markdown.ts` 集中設定渲染器：

- `markdown-it`：基本 Markdown、表格、刪除線、HTML 與自動連結。
- `markdown-it-anchor`：標題錨點，保留中文字、轉小寫並以連字號取代空白。
- Shiki：程式碼高亮，使用 One Light／One Dark Pro；未載入的語言回退為純文字。
- KaTeX：行內及區塊公式，設定 `throwOnError: false`、`trust: false`。
- Mermaid：將程式碼區塊交由瀏覽器渲染，使用 `securityLevel: "strict"`；失敗時保留原始內容與錯誤提示。

Eleventy 關閉 Markdown 的 Liquid 預處理，使文章中的 `{{ title }}`、`{% raw %}` 等模板語法保持原文。

調整渲染器或版型後，使用實際文章與 `tests/fixtures/markdown/` 的語法範例作為參考，在瀏覽器確認公式、圖表、程式碼與窄螢幕排版。現有範本沒有自動驗證或產生腳本。

## 主題與樣式

`src/assets/styles.css` 定義明暗配色與版面。`src/client/theme.ts` 首次依系統偏好設定主題，手動選擇以 `localStorage` 的 `blog-theme` 保存；儲存不可用時仍可切換當前頁面。

主題變更會發出 `themechange` 事件，Mermaid 依目前配色重新渲染，Shiki 則由樣式切換雙主題。

## 依賴維護

更新套件後執行 `npm run build:ci`，並以瀏覽器確認頁面。使用 `npm audit` 查看當下的依賴問題；先前曾有間接依賴漏洞，舊檢查數字不代表目前狀態，強制修復前應確認相容性。

## 頁尾連結

共用頁尾位於 `src/_includes/footer.njk`，所有使用 `base.njk` 的頁面都會顯示。編輯 `src/_data/site.json` 的 `footerLinks` 陣列即可新增、移除或排序個人連結：

```json
{ "label": "GitHub", "url": "https://github.com/FizzyElt" }
```

每個項目提供顯示名稱 `label` 與網址 `url`；空陣列會隱藏連結列表。頁尾配色與網站明暗主題同步。
