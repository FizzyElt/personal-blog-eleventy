import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import site from "../src/_data/site.json" with { type: "json" };

const origin = new URL(process.env.SITE_URL || site.url).origin;
function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : file.endsWith(".html") ? [file] : [];
  });
}
let pages = 0;
for (const file of walk("_site")) {
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes('property="og:title"')) continue; // Legacy redirect pages have no share card.
  const meta = (name: string): string => {
    const match = html.match(new RegExp(`(?:property|name)="${name}" content="([^"]*)"`));
    assert(match?.[1], `Missing ${name}: ${file}`);
    return match[1].replaceAll("&amp;", "&");
  };
  assert.equal(new URL(meta("og:url")).origin, origin, `Wrong canonical origin: ${file}`);
  assert.equal(meta("twitter:card"), "summary_large_image");
  assert.equal(meta("og:image"), meta("twitter:image"));
  meta("og:title");
  meta("og:description");
  meta("og:image:alt");
  const image = new URL(meta("og:image"));
  if (image.origin === origin) assert(fs.existsSync(path.join("_site", decodeURIComponent(image.pathname))), `Missing share image: ${file}`);
  pages++;
}
assert(pages >= 60, "Expected metadata on all public article pages");
const png = fs.readFileSync("_site/assets/social-cover.png");
assert.equal(png.toString("hex", 0, 8), "89504e470d0a1a0a");
assert.equal(png.readUInt32BE(16), 1200);
assert.equal(png.readUInt32BE(20), 630);
console.log(`Sharing verified: ${pages} pages, absolute URLs, descriptions, and 1200×630 PNG cover.`);
