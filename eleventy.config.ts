import type UserConfig from "@11ty/eleventy/UserConfig";
import type { EleventyPluginOgImageOptions } from "eleventy-plugin-og-image";
import type { ReactNode } from "react";

import "tsx/esm";
import EleventyPluginOgImage from "eleventy-plugin-og-image";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";

import type { CollectionApi, CollectionItem, ContentData } from "./types/content.ts";

import { createMarkdown } from "./lib/markdown.ts";
import { buildClient } from "./scripts/build-client.ts";

export default async function config(eleventyConfig: UserConfig) {
    // TSX 模板：只在建置時渲染為 HTML。
    eleventyConfig.addExtension("11ty.tsx", {
        key: "11ty.js",
        compile() {
            return async function (
                this: { defaultRenderer(data: unknown): Promise<ReactNode> },
                data: unknown,
            ) {
                const markup = renderToStaticMarkup(await this.defaultRenderer(data));
                return markup.startsWith("<html") ? `<!doctype html>${markup}` : markup;
            };
        },
    });
    // 分享預覽圖：字型、產圖外掛與圖片快取。
    const font = await readFile(new URL("./fonts/NotoSansCJKtc-Regular.otf", import.meta.url));
    const fontHash = createHash("sha256").update(font).digest("hex");
    eleventyConfig.addPlugin(EleventyPluginOgImage, {
        hashLength: 16,
        previewMode: false,
        satoriOptions: {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: "Noto Sans TC",
                    // ArrayBuffer avoids recursively serializing every font byte in the plugin's hash.
                    data: font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength),
                    weight: 400,
                    style: "normal",
                },
            ],
        },
        outputFileSlug: async (image) =>
            createHash("sha256")
                .update(await image.hash())
                .update(fontHash)
                .digest("hex")
                .slice(0, 16),
        shortcodeOutput: async (image) => image.outputUrl(),
    } satisfies EleventyPluginOgImageOptions);
    eleventyConfig.addWatchTarget("fonts/**");
    eleventyConfig.addWatchTarget("src/_includes/**/*.tsx");

    // 模板篩選器：絕對網址、日期與標籤網址。
    eleventyConfig.addFilter(
        "absoluteUrl",
        (value: string, base: string) => new URL(value, process.env.SITE_URL || base).href,
    );
    eleventyConfig.addFilter("dateISO", (value: Date | string) =>
        new Date(value).toISOString().slice(0, 10),
    );
    eleventyConfig.addFilter(
        "tagUrl",
        (tag: string) =>
            "/tags/" +
            tag
                .normalize("NFC")
                .replace(/\s+/g, "_")
                .replace(
                    /[^\p{L}\p{N}_.-]/gu,
                    (character) => "~" + character.codePointAt(0)!.toString(16),
                ) +
            "/",
    );

    // 內容：草稿排除、文章排序與分類／標籤集合。
    eleventyConfig.ignores.add("src/content/templates/**");
    eleventyConfig.addPreprocessor("drafts", "md", (data: ContentData) => {
        if (data.draft === true) {
            return false;
        }
    });
    // getAllSorted uses Eleventy's native date and filename ordering.
    // Undated reference notes remain last and never display filesystem dates.
    function publicArticles(collection: CollectionApi): CollectionItem[] {
        const items = collection
            .getAllSorted()
            .filter((item) => item.data.isArticle && !item.data.draft);
        return [
            ...items.filter((item) => item.data.date).reverse(),
            ...items
                .filter((item) => !item.data.date)
                .sort((a, b) => a.inputPath.localeCompare(b.inputPath)),
        ];
    }
    for (const section of ["articles", "posts", "notes", "tech"]) {
        eleventyConfig.addCollection(section, (collection: CollectionApi) =>
            publicArticles(collection).filter(
                (item) => section === "articles" || item.data.section === section,
            ),
        );
    }
    eleventyConfig.addCollection("tagGroups", (collection: CollectionApi) => {
        const groups = new Map<string, CollectionItem[]>();
        for (const item of publicArticles(collection)) {
            for (const tag of new Set(item.data.tags || [])) {
                if (!groups.has(tag)) {
                    groups.set(tag, []);
                }
                groups.get(tag)!.push(item);
            }
        }
        return [...groups]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([tag, entries]) => {
                return { tag, entries };
            });
    });

    // 資源：瀏覽器程式編譯、檔案監看與靜態檔案複製。
    eleventyConfig.addWatchTarget("src/client/**/*.ts");
    eleventyConfig.addWatchTarget("lib/**/*.ts");
    eleventyConfig.addWatchTarget("scripts/build-client.ts");
    eleventyConfig.on("eleventy.before", buildClient);
    eleventyConfig.addPassthroughCopy({
        ".generated/mermaid.js": "assets/mermaid.js",
        ".generated/theme.js": "assets/theme.js",
    });
    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy({
        "node_modules/katex/dist/katex.min.css": "assets/vendor/katex/katex.min.css",
        "node_modules/katex/dist/fonts": "assets/vendor/katex/fonts",
        "node_modules/mermaid/dist/mermaid.esm.min.mjs":
            "assets/vendor/mermaid/mermaid.esm.min.mjs",
        "node_modules/mermaid/dist/chunks/mermaid.esm.min/*.mjs":
            "assets/vendor/mermaid/chunks/mermaid.esm.min",
    });

    // Markdown 渲染與模板引擎。
    eleventyConfig.setLibrary("md", await createMarkdown());

    return {
        dir: { input: "src", includes: "_includes", output: "_site" },
        templateFormats: ["md", "11ty.tsx", "html"],
        markdownTemplateEngine: false,
        htmlTemplateEngine: false,
    };
}
