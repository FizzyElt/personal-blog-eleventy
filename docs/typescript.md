# TypeScript 工作流程

## 檔案與環境

- `eleventy.config.ts`：Eleventy 設定；啟動指令明確指定 `--config=eleventy.config.ts`。
- `lib/markdown.ts`：Markdown、Shiki、KaTeX 與 Mermaid 區塊整合。
- `scripts/*.ts`：清理、範本產生、驗證與瀏覽器編譯工具。
- `src/client/mermaid.ts`：瀏覽器端圖表程式。
- `types/content.ts`：本專案用到的文章資料及集合介面，僅供編譯期檢查，不會驗證 YAML 資料；內容驗證由 `check:migration` 負責。
- `tsconfig.json`：Node.js 環境，NodeNext、strict、erasableSyntaxOnly、noEmit。
- `tsconfig.browser.json`：瀏覽器環境，DOM 型別、Bundler 模組解析、strict、noEmit，不引入 Node.js 型別。

Node.js 24 原生執行 `.ts`，本地 import 明確使用 `.ts` 副檔名；使用 `import type` 匯入型別。型別移除不做型別檢查，也不支援需要產生 JavaScript 的 enum 或 parameter property 等語法，本專案透過 erasableSyntaxOnly 限制這些用法。

Eleventy 設定使用 `@11ty/eleventy/UserConfig` 提供的官方 JSDoc 介面。`allowJs` 與 `maxNodeModuleJsDepth: 1` 用於讀取此套件 JavaScript 中的型別資訊，`checkJs: false` 避免檢查上游實作；不是讓本專案以 JavaScript 略過檢查。Markdown-it 15 已內建型別，不需要額外安裝舊版 `@types/markdown-it`。

## 開發與建置

```sh
npm ci
npm run dev
```

`dev`、`watch` 和 `build` 共用 `eleventy.before` 事件，在頁面建置前執行 `scripts/build-client.ts`：

1. esbuild 將 `src/client/mermaid.ts` 編譯成 `.generated/mermaid.js`。
2. Mermaid 套件保留為指向本機 `/assets/vendor/mermaid/mermaid.esm.min.mjs` 的動態匯入，僅有圖表的頁面會載入它。
3. Eleventy 將生成的 JavaScript 複製到 `_site/assets/mermaid.js`，版型沿用這個網址。
4. 修改 `src/client/**/*.ts` 會觸發重新編譯與瀏覽器重新載入。生成內容沒有變更時不重寫檔案，避免監看循環。

`.generated/` 和 `_site/` 都是忽略版控的產物；不手動修改它們。TypeScript 原始檔不會作為靜態資源發布。文章、版型、純資料與 CSS 不受此編譯流程影響。

從舊的 JavaScript 設定切換後，已在執行的舊開發伺服器需停止一次，再使用 `npm run dev` 啟動新指令。

## 檢查

```sh
npm run typecheck
npm run build
npm run check:markdown
npm run check:migration -- ../personal-blog-v5/content
```

`typecheck` 分別檢查兩種環境；建置本身只執行或編譯程式，不取代型別檢查。遷移檢查確認文章、日期、草稿、轉址與站內連結。

## 官方參考

- [Eleventy TypeScript](https://www.11ty.dev/docs/languages/typescript/)
- [Eleventy Configuration Events](https://www.11ty.dev/docs/events/)
- [Node.js TypeScript](https://nodejs.org/api/typescript.html)
- [esbuild Build API](https://esbuild.github.io/api/#build)
