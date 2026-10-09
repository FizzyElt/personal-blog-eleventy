import { katex } from "@mdit/plugin-katex";
import { fromHighlighter } from "@shikijs/markdown-it";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import { createHighlighter } from "shiki";

export async function createMarkdown() {
    const md = new MarkdownIt({ html: true, linkify: true });
    md.use(katex, { throwOnError: false, trust: false });
    md.use(anchor, {
        slugify: (heading) => heading.trim().toLowerCase().replace(/\s+/g, "-"),
    });

    const themes = { light: "one-light", dark: "one-dark-pro" } as const;
    const highlighter = await createHighlighter({
        themes: Object.values(themes),
        langs: [
            "typescript",
            "tsx",
            "javascript",
            "jsx",
            "rust",
            "ocaml",
            "lisp",
            "svelte",
            "bash",
            "lua",
            "toml",
            "json",
            "diff",
            "html",
            "yaml",
        ],
    });

    md.use(fromHighlighter(highlighter, { themes }));

    const highlight = md.options.highlight;

    if (!highlight) {
        throw new Error("Shiki did not register a syntax highlighter");
    }

    md.options.highlight = (code, language, attributes) =>
        highlight(
            code,
            highlighter.getLoadedLanguages().includes(language) ? language : "text",
            attributes,
        );

    const renderFence = md.renderer.rules.fence;

    if (!renderFence) {
        throw new Error("Shiki did not register a Markdown fence renderer");
    }

    md.renderer.rules.fence = (tokens, index, options, env, renderer) => {
        const token = tokens[index];
        if (token.info.trim().split(/\s+/)[0] !== "mermaid") {
            return renderFence(tokens, index, options, env, renderer);
        }
        // The original source remains readable if JavaScript cannot run.
        return `<figure class="diagram"><pre class="mermaid">${md.utils.escapeHtml(token.content)}</pre></figure>\n`;
    };

    return md;
}
