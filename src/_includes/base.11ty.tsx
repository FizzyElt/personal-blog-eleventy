import type { TemplateData, TemplateHelpers } from "../../types/templates.ts";

import Footer from "./footer.tsx";

export default async function (this: TemplateHelpers, data: TemplateData) {
    const {
        title,
        description,
        date,
        section,
        site,
        page,
        content,
        isArticle,
        socialImage,
        socialImageAlt,
    } = data;
    const generatedImage =
        isArticle && !socialImage
            ? await this.ogImage("./_includes/social-card.og.11ty.tsx", {
                  title,
                  description,
                  date,
                  section,
                  site,
              })
            : undefined;
    const image = this.absoluteUrl(socialImage || generatedImage || site.image, site.url);
    const imageAlt =
        isArticle && !socialImage ? `${title} — ${site.name}` : socialImageAlt || site.imageAlt;
    const metaDescription = description || site.description;
    const url = this.absoluteUrl(page.url, site.url);
    return (
        <html lang="zh-TW">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{title}</title>
                <meta name="description" content={metaDescription} />
                <link rel="canonical" href={url} />
                <link rel="icon" type="image/png" href="/assets/favicon.png" />
                <meta property="og:site_name" content={site.name} />
                <meta property="og:locale" content="zh_TW" />
                <meta property="og:type" content={isArticle ? "article" : "website"} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:url" content={url} />
                <meta property="og:image" content={image} />
                <meta property="og:image:alt" content={imageAlt} />
                {!socialImage && (
                    <>
                        <meta property="og:image:type" content="image/png" />
                        <meta property="og:image:width" content="1200" />
                        <meta property="og:image:height" content="630" />
                    </>
                )}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content={image} />
                <meta name="twitter:image:alt" content={imageAlt} />
                <script src="/assets/theme.js"></script>
                <link rel="stylesheet" href="/assets/vendor/katex/katex.min.css" />
                <link rel="stylesheet" href="/assets/styles.css" />
                <script type="module" src="/assets/mermaid.js"></script>
            </head>
            <body>
                <nav aria-label="主要導覽">
                    <a
                        className="site-brand"
                        href="/"
                        aria-current={page.url === "/" ? "page" : undefined}
                    >
                        FizzyElt
                    </a>
                    {[
                        ["posts", "Posts"],
                        ["notes", "Notes"],
                        ["tech", "Techs"],
                        ["tags", "Tags"],
                    ].map(([path, label]) => (
                        <a
                            key={path}
                            href={`/${path}/`}
                            aria-current={page.url.startsWith(`/${path}/`) ? "page" : undefined}
                        >
                            {label}
                        </a>
                    ))}
                    <button className="theme-toggle" type="button" hidden>
                        <svg
                            className="theme-sun"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                        </svg>
                        <svg
                            className="theme-moon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" />
                        </svg>
                    </button>
                </nav>
                <main dangerouslySetInnerHTML={{ __html: content }} />
                <Footer site={site} />
            </body>
        </html>
    );
}
