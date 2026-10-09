import baseline from "../docs/content-baseline.json" with { type: "json" };
import migration from "../src/_data/migration.json" with { type: "json" };
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

function walk(directory: string, extension: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file, extension) : entry.name.endsWith(extension) ? [file] : [];
  }).sort();
}
const iso = (value: unknown): string | null => {
  if (value == null || value === "") return null;
  assert(value instanceof Date || typeof value === "string", "Invalid date type");
  return new Date(value).toISOString().slice(0,10);
};
const entries = walk("src/content", ".md").filter(file => /^src\/content\/(posts|notes|tech)\//.test(file)).map(file => {
  const data: Record<string, unknown> = matter.read(file).data;
  assert(typeof data.title === "string", `Missing title: ${file}`);
  assert(data.title.trim(), `Empty title: ${file}`);
  assert(!("published" in data), `Use native date: ${file}`);
  assert(typeof data.permalink === "string", `Missing explicit permalink: ${file}`);
  assert(data.permalink.startsWith("/") && data.permalink.endsWith("/index.html"), `Nonstandard permalink: ${file}`);
  return { source: path.relative("src/content",file), file, data, title: data.title,
    url: data.permalink.replace(/index\.html$/, ""), published: iso(data.date),
    kind: path.relative("src/content",file).split("/")[0], draft: data.draft === true };
});

for (const before of baseline) {
  const after = entries.find(item => item.source === before.source);
  assert(after, `Article removed: ${before.source}`);
  for (const key of ["url", "title", "published", "draft"] as const) assert.equal(after[key], before[key], `Migration regression: ${before.source} (${key})`);
}
const original = process.argv[2];
if (original) {
  const changes: Record<string, [string, string]> = {
    "posts/2023/2023-summary.md": ["](./metamorphosis)", "](/posts/metamorphosis/)"],
    "posts/2023/smart-uses-of-containers.md": ["](gcanti.github.io)", "](https://gcanti.github.io)"],
  };
  for (const before of baseline) {
    const old = matter.read(path.join(original,before.source));
    const current = matter.read(path.join("src/content",before.source));
    let body = old.content;
    if (changes[before.source]) body = body.replace(...changes[before.source]);
    assert.equal(current.content, body, `Unexpected body change: ${before.source}`);
    for (const [key,value] of Object.entries(old.data)) {
      if (["published", "permalink"].includes(key)) continue;
      assert.deepEqual(current.data[key],value, `Unexpected front matter change: ${before.source} (${key})`);
    }
  }
  assert.equal(matter.read("src/content/index.md").content, matter.read(path.join(original,"index.md")).content, "Homepage body changed");
}
const publicEntries = entries.filter(item => !item.draft);
assert.equal(new Set(publicEntries.map(item => item.url)).size, publicEntries.length, "Duplicate article URL");
for (const item of entries) {
  const output = path.join("_site", item.url, "index.html");
  assert.equal(fs.existsSync(output), !item.draft, `Draft/public output: ${item.source}`);
  if (item.draft) continue;
  const html = fs.readFileSync(output,"utf8");
  assert(!html.includes('class="katex-error"'), `Math rendering error: ${item.source}`);
  assert(html.includes("<h1>"), `Missing article heading: ${item.source}`);
  if (item.published) assert(html.includes(`datetime="${item.published}"`), `Wrong published date: ${item.source}`);
  else assert(!html.includes("<time"), `Fabricated date: ${item.source}`);
}
for (const kind of ["posts", "notes", "tech"]) {
  const html = fs.readFileSync(`_site/${kind}/index.html`,"utf8");
  const expected = publicEntries.filter(item => item.kind === kind).length;
  assert.equal((html.match(/<li>\s*<h2>/g) || []).length, expected, `List count: ${kind}`);
  const dates = [...html.matchAll(/<time datetime="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(dates, [...dates].sort().reverse(), `Date order: ${kind}`);
  for (const item of entries.filter(item => item.draft)) assert(!html.includes(item.url), `Draft in list: ${kind}`);
}
const { redirects } = migration;
for (const redirect of redirects) {
  const html = fs.readFileSync(path.join("_site",redirect.output),"utf8");
  assert(html.includes(`url=${redirect.url}`), `Broken redirect: ${redirect.output}`);
}
let checkedLinks = 0;
for (const file of walk("_site", ".html")) {
  const html = fs.readFileSync(file,"utf8");
  const route = "/" + path.relative("_site",file).replace(/index\.html$/,"");
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)) {
    const href = match[1].replace(/&amp;/g,"&");
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(href)) continue;
    const target = new URL(href,"https://migration.invalid" + route);
    const destination = path.join("_site",decodeURIComponent(target.pathname));
    assert(fs.existsSync(destination) || fs.existsSync(path.join(destination,"index.html")), `Missing internal link: ${file} → ${href}`);
    checkedLinks++;
  }
}
assert(!fs.existsSync("lib/content.js"),"Content compatibility layer returned");
const summary = Object.fromEntries(["posts","notes","tech"].map(kind => [kind,publicEntries.filter(item => item.kind === kind).length]));
console.log(JSON.stringify({public:publicEntries.length,drafts:entries.length-publicEntries.length,...summary,redirects:redirects.length,checkedLinks,baselineVerified:true,originalBodiesVerified:Boolean(original)},null,2));
