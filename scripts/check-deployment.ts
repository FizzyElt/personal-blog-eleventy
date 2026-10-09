import site from "../src/_data/site.json" with { type: "json" };
const url = new URL(process.env.SITE_URL || site.url);
if (url.protocol !== "https:" || ["localhost", "127.0.0.1"].includes(url.hostname)) {
  throw new Error("請先在 src/_data/site.json 設定正式 HTTPS 網址，或以 SITE_URL 提供網址，避免分享預覽指向 localhost。");
}
