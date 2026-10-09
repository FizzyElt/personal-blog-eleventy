# 內容遷移與標準化

來源為 `personal-blog-v5/content`，共 63 份 Markdown：首頁、61 篇內容與 1 份寫作範本。舊專案沒有修改。

## 發布規則

- 32 篇文章中 31 篇公開，`lifecycle-of-a-function.md` 為草稿。
- 25 篇短筆記、4 篇技術筆記全部公開。
- `templates/` 不產出頁面；`draft: true` 經 Eleventy Preprocessor（預處理器）排除，且集合另行過濾草稿。
- `src/content/content.11tydata.json` 提供共用版型；posts、notes、tech 各自的 Directory Data（目錄資料）提供 `section` 與 `isArticle`。
- Collections（內容集合）使用 `getAllSorted()`，有日期的內容反轉為新到舊；沒有日期的參考筆記放在最後且不顯示檔案時間。
- Markdown 外掛整合留在 `lib/markdown.ts`。`lib/content.js` 已移除，建置時不再自行掃描或重複解析 Markdown 來適配文章資料。

## 本次明確修改

1. 所有 57 份已填日期的內容將 `published` 改成 Eleventy 原生 `date`，日期值不變。
2. 61 篇內容及首頁明確填寫 `permalink: /原網址/index.html`。原來公開網址不變；沒有 permalink 的筆記使用既有內容路徑。
3. `tech/ts_js/linter.md` 補上 `title: "Oxlint, Oxfmt"`，沿用原文第一個標題。
4. 首頁加上 `home: true` 以顯示最新內容。
5. `posts/2023/2023-summary.md` 的 `](./metamorphosis)` 改為 `](/posts/metamorphosis/)`。
6. `posts/2023/smart-uses-of-containers.md` 的 `](gcanti.github.io)` 改為 `](https://gcanti.github.io)`。
7. 寫作範本改成原生 date 與明確 permalink，預設為草稿；Markdown 展示頁與產生器也改用 date。

除上述兩個連結外，61 篇內容的正文保留。其餘既有前置資料（tags、description、heroImage、id 等）保留。4 份技術筆記沒有日期，不杜撰發表日期。4 處既有公式雙反斜線問題仍保留，見 `markdown-inventory.json`。

## 舊網址

`src/_data/migration.json` 保存 126 個固定轉址，包含舊年份資料夾、大小寫路徑與 `.html` 網址，透過 `src/redirects.njk` 與 Eleventy Pagination（分頁）產出。新增文章不需要再自動推算歷史網址；日後更改公開網址時，手動在此表加入舊址。

原站沒有本地圖片素材，圖片維持外部網址。未複製 `.obsidian` 設定。

## 新增內容

放入 `src/content/posts/`、`notes/` 或 `tech/`，共用版型和分類會由目錄資料繼承；每篇自行填寫標題、原生日期與網址。網址不必跟檔名或年份資料夾一致。

```yaml
---
title: 我的文章
description: 文章摘要
date: 2026-10-09
tags: [Dev]
permalink: /posts/my-article/index.html
draft: false
---
```

沒有日期的技術筆記可省略 `date`。站內文章連結直接使用公開網址，例如 `[蛻變](/posts/metamorphosis/)`。寫作範本在 `src/content/templates/note.md`。標籤頁保留大小寫，空白轉成底線，中文字維持可讀；日期格式與標籤網址仍使用設定檔內的小型自訂 filter（篩選器）。

## 驗證

```sh
npm run build
npm run check:markdown
npm run check:migration -- ../personal-blog-v5/content
```

`docs/content-baseline.json` 保存標準化前的 61 篇內容資料，用來確認公開網址、標題、日期與草稿狀態。檢查另涵蓋日期排序、列表數量、草稿輸出、公式解析錯誤、轉址與生成頁面的站內連結。有提供舊內容路徑時，比對正文僅允許上述兩個連結修改，並比對其餘既有前置資料；舊 repo 已移除則執行 `npm run check:migration`。

搜尋與 RSS 尚待下一階段加入。

## 官方依據

- [Content Dates](https://www.11ty.dev/docs/dates/)
- [Front Matter Data](https://www.11ty.dev/docs/data-frontmatter/)
- [Template and Directory Data Files](https://www.11ty.dev/docs/data-template-dir/)
- [Collections API](https://www.11ty.dev/docs/collections-api/)
- [Permalinks](https://www.11ty.dev/docs/permalinks/)
