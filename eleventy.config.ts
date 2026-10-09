import type UserConfig from "@11ty/eleventy/UserConfig";

import type { CollectionApi, CollectionItem, ContentData } from "./types/content.ts";

import { createMarkdown } from "./lib/markdown.ts";
import { buildClient } from "./scripts/build-client.ts";

export default async function config(eleventyConfig: UserConfig) {
    eleventyConfig.addFilter("absoluteUrl", (value: string, base: string) =>
        new URL(value, process.env.SITE_URL || base).href,
    );
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
    eleventyConfig.addWatchTarget("src/client/**/*.ts");
    eleventyConfig.addWatchTarget("lib/**/*.ts");
    eleventyConfig.addWatchTarget("scripts/build-client.ts");
    eleventyConfig.on("eleventy.before", buildClient);
    eleventyConfig.addPassthroughCopy({ ".generated/mermaid.js": "assets/mermaid.js", ".generated/theme.js": "assets/theme.js" });
    eleventyConfig.setLibrary("md", await createMarkdown());
    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy({
        "node_modules/katex/dist/katex.min.css": "assets/vendor/katex/katex.min.css",
        "node_modules/katex/dist/fonts": "assets/vendor/katex/fonts",
        "node_modules/mermaid/dist/mermaid.esm.min.mjs":
            "assets/vendor/mermaid/mermaid.esm.min.mjs",
        "node_modules/mermaid/dist/chunks/mermaid.esm.min/*.mjs":
            "assets/vendor/mermaid/chunks/mermaid.esm.min",
    });

    return {
        dir: { input: "src", includes: "_includes", output: "_site" },
        templateFormats: ["md", "njk", "html"],
        markdownTemplateEngine: false,
        htmlTemplateEngine: "njk",
    };
}
