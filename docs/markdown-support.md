# Markdown 支援與待辦

盤點日期：2026-10-09。最初來源為原部落格的 `content/`，目前以新專案 `src/content/` 更新盤點，包含草稿與模板，共 63 個 Markdown 檔案。最初遷移保留原文，後續前置資料與兩個連結已依 [標準化規則](content-migration.md) 修改；範本節錄保留在新專案，可獨立建置，不需存取舊 repo。

## 檢查方式

- 測試範本：`tests/fixtures/markdown/index.md`，僅用於本機渲染檢查，不發布 `/markdown/` 頁面或範例圖片。
- `npm run build` 後執行 `npm run check:markdown`，檢查範本的語法、公式、程式碼區塊及輸出資源，並確認測試頁與範例圖片未被發布。
- `npm run check:markdown -- /path/to/blog/content`，額外用相同渲染器逐篇處理全部原文；只驗證渲染，沒有搬移文章或保證網址相容。
- `npm run fixtures:generate -- /path/to/blog/content`，重新盤點並覆寫範本與 `docs/markdown-inventory.json`。手動增添的範本內容請寫在產生器，以便保留。

## 已補足

| 項目 | 狀態與實作 |
| --- | --- |
| 標題、中文錨點 | markdown-it＋markdown-it-anchor，H1–H6 範例 |
| 粗體、斜體、刪除線、段落、換行、分隔線 | Markdown 原生渲染，補上基本樣式 |
| 有序／無序清單、巢狀清單、引用 | 原生渲染與基本樣式 |
| 站內、相對、外部、頁內、自動連結 | 範本與獨立相對連結目標頁 |
| 圖片 | 本機 SVG 範例；寬度、比例與 alt 文字 |
| 全部 21 種 fence 標籤 | 含 Mermaid、20 種一般程式碼／純文字標籤，每種保留原文節錄 |
| 程式碼高亮 | Shiki 的 markdown-it 官方整合；TypeScript、TSX、JS、JSX、Rust、OCaml、Lisp、Svelte、Bash、Lua、TOML、JSON、diff、HTML；別名由 Shiki 支援，未知語言回退純文字 |
| 行內／區塊數學 | @mdit/plugin-katex，包含 51 個不重複原文公式，以及單行與多行 `$$` 區塊 |
| Mermaid | 原文全部 6 個圖表區塊，瀏覽器中確認全部成功產生 SVG |
| 深色高亮與圖表 | Shiki 雙主題＋Mermaid 系統主題；圖表在系統主題改變時重新渲染 |
| CSS／字型／圖表資源 | 自 npm 套件複製到本機 assets，不依賴 CDN |
| 模板字元與 HTML 範例 | Markdown 關閉 Liquid；確認 `{{ title }}`、`{% raw %}` 及 HTML／Svelte 程式碼不被執行 |
| 表格 | 原文沒有使用，範本額外保留標準表格作未來檢查 |

截至本次驗證，瀏覽器中 6 個 Mermaid SVG、52 個 KaTeX 元素（51 個原文公式加一個多行例子）、20 個高亮／純文字程式碼區塊均存在，沒有 console error 或 katex-error；當前預覽寬度沒有整頁水平溢出。這不代表原文公式的數學意義皆正確。

## 原文內容需確認

`posts/2023/monoid-algebraic-structure.md` 第 15、31、35、39 行，在 `exists`、`in`、`forall`、`bullet`、`Longrightarrow` 等指令前有兩個反斜線。KaTeX 可能將它們當成換行加一般字母，因此解析成功仍呈現錯誤語意。

範本保留現況，詳細原文記於 `markdown-inventory.json`。沒有全域替換反斜線，因為合法 LaTeX 的換行也使用兩個反斜線。文章已搬入但這 4 處公式保留原文，後續修正仍應人工核對。

## 下一階段

這些屬於內容發布與遷移，不是 Markdown 渲染器缺少語法：

以上日期、路徑、相對連結、草稿／模板排除、分類與標籤頁已完成，見 [內容遷移紀錄](content-migration.md)。
- RSS 與 Pagefind 搜尋。

沒有新增未出現在原文的 Obsidian wikilink、callout、embed、footnote 或 task-list 外掛。

## 實作依據

- [Eleventy：設定 Markdown library](https://www.11ty.dev/docs/languages/markdown/)
- [Shiki：markdown-it 整合](https://shiki.style/packages/markdown-it)
- [Shiki：明暗雙主題](https://shiki.style/guide/dual-themes)
- [KaTeX plugin：公式語法與設定](https://mdit-plugins.github.io/katex.html)
- [Mermaid：初始化與 run API](https://mermaid.js.org/config/usage.html)

Eleventy 本身沒有內建 Shiki、KaTeX 或 Mermaid；本專案使用上述工具維護者提供的 API，經 Eleventy 官方 `setLibrary` 接入。本專案的 TypeScript 執行環境要求 Node.js 24 以上，版本見 `.node-version`。
