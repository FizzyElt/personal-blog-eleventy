import fs from "node:fs";
import path from "node:path";
import type { Token } from "markdown-it";
import MarkdownIt from "markdown-it";
import { katex } from "@mdit/plugin-katex";

const sourceDirectory = process.argv[2];
if (!sourceDirectory) throw new Error("Usage: npm run fixtures:generate -- /path/to/blog/content");
const parser = new MarkdownIt({ html: true, linkify: true }).use(katex);
interface Sample { file: string; line: number | null; content: string }
const samples = new Map<string, Sample>();
const languages: Record<string, number> = {};
const tokenTypes: Record<string, number> = {};
const diagrams: Sample[] = [];
const formulas = new Map<string, Sample & { display: boolean }>();
const findings: (Sample & { type: string; note: string })[] = [];
let fileCount = 0;
function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))
    .flatMap((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) :
      entry.name.endsWith(".md") ? [path.join(directory, entry.name)] : []);
}
for (const file of walk(sourceDirectory)) {
  fileCount++;
  const original = fs.readFileSync(file, "utf8");
  const frontmatter = original.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
  const body = frontmatter ? original.slice(frontmatter[0].length) : original;
  const offset = frontmatter ? frontmatter[0].split("\n").length - 1 : 0;
  const relativePath = path.relative(sourceDirectory, file).split(path.sep).join("/");
  function visit(tokens: Token[]): void {
    for (const token of tokens) {
      tokenTypes[token.type] = (tokenTypes[token.type] ?? 0) + 1;
      const line = token.map ? token.map[0] + offset + 1 : null;
      const source = { file: relativePath, line, content: token.content };
      if (token.type === "fence") {
        const language = token.info.trim().split(/\s+/)[0];
        languages[language || "(unlabelled)"] = (languages[language || "(unlabelled)"] ?? 0) + 1;
        if (language === "mermaid") diagrams.push(source);
        else if (token.content.trim() && (!samples.has(language) || token.content.length < samples.get(language)!.content.length)) {
          samples.set(language, source);
        }
      }
      if (token.type === "math_inline" || token.type === "math_block") {
        const display = token.type === "math_block";
        const key = `${display}:${token.content.trim()}`;
        if (!formulas.has(key)) formulas.set(key, { ...source, display });
        if (/\\\\[a-zA-Z]/.test(token.content)) {
          findings.push({ ...source, type: "double-backslash-before-command", note: "需要人工確認：重複反斜線可能使 LaTeX 指令變為換行加一般字母，不自動更動。" });
        }
      }
      if (token.children) visit(token.children);
    }
  }
  visit(parser.parse(body, {}));
}
const sections = [String.raw`---
layout: base.njk
title: Markdown 範本與渲染測試
description: 依現有部落格內容建立的 Markdown 語法檢查頁。
id: markdown-fixture
date: 2026-10-09
permalink: /markdown/index.html
tags: [Markdown, 渲染測試]
heroImage: ./markdown-sample.svg
draft: false
---
# Markdown 範本與渲染測試

這頁依現有部落格的 Markdown 盤點產生，可作為往後調整版型與渲染器時的比較基準。程式碼、公式與圖表節錄自文章正文；前置資料與站內連結已依遷移規則統一。

- [文字與標題](#文字與標題)
- [清單與引用](#清單與引用)
- [連結與圖片](#連結與圖片)
- [程式碼語言](#程式碼語言)
- [數學公式](#數學公式)
- [Mermaid 圖表](#mermaid-圖表)
- [額外補充：表格](#額外補充：表格)

## 文字與標題

一般段落包含繁體中文、English、**粗體**、*斜體*、***粗斜體***、~~刪除線~~ 與 ` + "`inline code`" + String.raw`。

### 第三級標題

#### 第四級標題

##### 第五級標題

###### 第六級標題

這是第一行，接續原始 Markdown 的一般換行。
這一行應延續同一段落。

這一行結尾有兩個空白，應強制換行。  
這一行應顯示在下一行。

跳脫字元：\*不是斜體\*、\<Component\>、\$100。

模板字元應原樣顯示：` + "`{{ title }}`、`{% raw %}`、`$countStore`。" + String.raw`

---

## 清單與引用

- 第一層項目
  - 第二層項目
    - 第三層項目
- 含 **粗體** 和 ` + "`code`" + String.raw` 的項目

1. 第一個步驟
2. 第二個步驟
   1. 巢狀步驟
   2. 另一個巢狀步驟

> 引用段落，包含 **粗體**、*斜體* 與 [連結](https://www.11ty.dev/)。
>
> - 引用內的清單
> - 另一個項目
>
> > 巢狀引用

## 連結與圖片

[外部連結](https://www.11ty.dev/)、[站內首頁](/)、[相對路徑](./relative-target/)、[頁內錨點](#數學公式)。

自動連結：<https://www.11ty.dev/>。

以下為本機圖片，可檢查寬度與替代文字，無須外部網路。

![Markdown 圖片測試：圓形與三條線](./markdown-sample.svg)

## 程式碼語言

每種實際使用的 fence 語言都保留一份原文節錄。無語言、plain、plaintext 與 txt 應以純文字顯示；HTML、JSX 與 Svelte 的標記應保持在程式碼區塊內，不可執行。
`];
for (const [language, sample] of [...samples].sort(([a],[b]) => a.localeCompare(b))) {
  sections.push(`### ${language || "無語言標籤"}\n\n來源：\`${sample.file}:${sample.line}\`\n\n\`\`\`${language}\n${sample.content.trimEnd()}\n\`\`\`\n`);
}
sections.push("## 數學公式\n\n包含原文所有不重複的行內與區塊公式。KaTeX 會保留解析錯誤；若公式本身有問題，應修正原文或訂出明確遷移規則。\n");
let formulaIndex = 0;
for (const formula of formulas.values()) {
  sections.push(`### 公式 ${++formulaIndex}\n\n來源：\`${formula.file}\`\n\n${formula.display ? `$$${formula.content.trim()}$$` : `行內公式：$${formula.content.trim()}$。`}\n`);
}
// Explicitly exercise the multiline delimiter form as well as one-line blocks.
sections.push(String.raw`### 多行區塊公式

$$
\begin{aligned}
(a \bullet b) \bullet c &= a \bullet (b \bullet c) \\
0 + a &= a
\end{aligned}
$$
`);
sections.push("## Mermaid 圖表\n\n以下為原文章的全部 6 個區塊，包含中文節點、subgraph、classDef 與雙向箭頭。\n");
diagrams.forEach((diagram, index) => {
  sections.push(`### 圖表 ${index + 1}\n\n來源：\`${diagram.file}:${diagram.line}\`\n\n\`\`\`mermaid\n${diagram.content.trimEnd()}\n\`\`\`\n`);
});
sections.push(String.raw`## 額外補充：表格

目前原文沒有使用表格；保留這段作為未來寫作的基本檢查。

| 功能 | 呈現方式 |
| --- | --- |
| 行內程式碼 | ` + "`map`" + String.raw` |
| 強調 | **重要內容** |
| 中文與 English | 正常換行 |
`);
fs.mkdirSync("tests/fixtures/markdown", { recursive: true });
fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("tests/fixtures/markdown/index.md", sections.join("\n"));
fs.writeFileSync("docs/markdown-inventory.json", JSON.stringify({ fileCount, languages, tokenTypes,
  formulaCount: formulas.size, diagramCount: diagrams.length, findings }, null, 2) + "\n");
console.log(`Generated fixture from ${fileCount} Markdown files: ${Object.keys(languages).length} fence labels, ${formulas.size} unique formulas, ${diagrams.length} Mermaid blocks.`);
console.log(`${findings.length} formula occurrence(s) need review; see docs/markdown-inventory.json.`);
