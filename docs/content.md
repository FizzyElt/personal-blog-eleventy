# 寫作指南

## 文章與分類

文章放在 `src/content/`，分類由所在目錄決定：

| 目錄     | 用途     | 列表網址  |
| -------- | -------- | --------- |
| `posts/` | 文章     | `/posts/` |
| `notes/` | 短筆記   | `/notes/` |
| `tech/`  | 技術筆記 | `/tech/`  |

`src/content/index.md` 是首頁。`content.11tydata.json` 提供共用文章版型，各分類的目錄資料提供 `section` 與 `isArticle`，新增文章會自動繼承。

可複製 `src/content/templates/note.md` 作為起點；`templates/` 本身不產出網站頁面。

## Front matter（前置資料）

```yaml
---
title: 我的文章
description: 文章摘要
date: 2026-10-10
tags: [Dev]
permalink: /posts/my-article/index.html
draft: true
---
```

- `title`：文章標題。
- `description`：文章摘要；分享中繼資料在省略時使用網站摘要，自動預覽圖則省略摘要區域。
- `date`：發表日期，使用 Eleventy 原生欄位。沒有日期的參考筆記可省略，不顯示檔案時間。
- `tags`：標籤陣列，會產生對應的標籤列表。
- `permalink`：公開網址，使用 `/分類/slug/index.html` 形式，可與檔名及年份資料夾不同。
- `draft`：設為 `true` 時不產出頁面，也不進入文章或標籤列表；發布前改為 `false`。

列表依日期由新到舊排列；沒有日期的內容置於最後，依來源路徑排序。

## 連結與網址

站內連結使用公開網址，例如 `[蛻變](/posts/metamorphosis/)`，不要使用來源 Markdown 的檔案路徑。

標籤網址保留大小寫及中文字，空白轉為底線；其他不支援的字元由設定檔的 `tagUrl` 篩選器編碼。

## 圖片與分享封面

本地圖片放在 `src/assets/`，文章使用 `/assets/檔名` 引用。`heroImage` 前置資料可設定文章標題下方的圖片。共用分享封面為 `src/assets/social-cover.png`，尺寸為 1200×630。

公開文章（含筆記與技術筆記）會在建置時自動產生 1200×630 PNG，顯示標題與分類，摘要及日期有填寫才顯示。首頁及列表頁沿用共用封面，草稿不產圖。

單篇文章可在前置資料指定自己的分享封面，優先於自動生成的圖片：

```yaml
socialImage: /assets/my-cover.png
socialImageAlt: 封面內容說明
```

共用標題、摘要、網址與封面設定在 `src/_data/site.json`。版型會產生 Open Graph（分享中繼資料）、Twitter Card（分享卡片）與 canonical URL（標準網址）。

## 預覽與發布

執行 `npm run dev`，確認文章、日期、連結、公式、圖表和明暗主題，再依[部署指南](cloudflare.md)發布。Markdown 支援及相關程式位置見[開發指南](development.md)。

刪除文章、更改網址或將已公開文章改成草稿後，依[建置產物說明](development.md#建置產物)清理舊輸出再建置。
