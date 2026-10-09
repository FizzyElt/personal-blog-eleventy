import inventory from "../docs/markdown-inventory.json" with { type: "json" };
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createMarkdown } from "../lib/markdown.ts";

const md = await createMarkdown();
const fixture = fs.readFileSync("tests/fixtures/markdown/index.md", "utf8").replace(/^---\n[\s\S]*?\n---\n/, "");
const html = md.render(fixture);

assert.equal((html.match(/class="diagram"/g) ?? []).length, inventory.diagramCount);
assert.match(html, /class="katex-display"/);
assert.match(html, /class="katex"/);
assert.match(html, /class="shiki /);
assert.match(html, /<s>刪除線<\/s>/);
assert.match(html, /id="數學公式"/);
assert.match(html, /\{\{ title \}\}/);
assert.match(html, /\{% raw %\}/);
assert.match(html, /href="\.\/relative-target\/"/);
assert.match(html, /<h6[^>]*>/);
assert.match(html, /<table>/);
assert.match(html, /<blockquote>/);
assert.match(html, /<ol>/);
assert.match(html, /<ul>/);
assert.doesNotMatch(html, /class=["']katex-error/);
for (const language of Object.keys(inventory.languages)) {
  if (language === "mermaid") continue;
  assert.ok(html.includes(`<h3 id="${language === "(unlabelled)" ? "無語言標籤" : language}"`), `Missing sample for ${language}`);
}
const output = fs.readFileSync("_site/index.html", "utf8");
assert.match(output, /<html lang="zh-TW">/);
assert.match(output, /assets\/vendor\/katex\/katex.min.css/);
assert.ok(!fs.existsSync("_site/markdown"), "Test pages must not be published");
assert.ok(!fs.existsSync("_site/assets/markdown-sample.svg"), "Test image must not be published");
for (const asset of ["assets/styles.css", "assets/mermaid.js", "assets/vendor/katex/katex.min.css", "assets/vendor/mermaid/mermaid.esm.min.mjs"]) {
  assert.ok(fs.existsSync(path.join("_site", asset)), `Missing asset: ${asset}`);
}
console.log(`Markdown fixture verified: all ${Object.keys(inventory.languages).length} fence labels, math, ${inventory.diagramCount} Mermaid containers, headings, links, lists, escaping, and built assets.`);
console.log("Mermaid SVG rendering and responsive layout additionally require browser verification.");

const sourceDirectory = process.argv[2];
if (sourceDirectory) {
  function walk(directory: string): string[] {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(file) : entry.name.endsWith(".md") ? [file] : [];
    });
  }
  const files = walk(sourceDirectory);
  for (const file of files) {
    const body = fs.readFileSync(file, "utf8").replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
    const rendered = md.render(body);
    assert.doesNotMatch(rendered, /class=["']katex-error/, `Formula parse error in ${file}`);
  }
  console.log(`Additionally rendered all ${files.length} original Markdown files without parser errors. This does not validate formula meaning or migrated URLs.`);
}
