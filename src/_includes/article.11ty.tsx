import { renderToStaticMarkup } from "react-dom/server";

import type { TemplateData, TemplateHelpers } from "../../types/templates.ts";

import ArticleList from "./article-list.tsx";

export const data = { layout: "base.11ty.tsx" };

export default function (
    this: TemplateHelpers,
    { title, description, date, page, tags, heroImage, content, home, collections }: TemplateData,
) {
    const header = renderToStaticMarkup(
        <header>
            <h1>{title}</h1>
            {description && <p className="article-description">{description}</p>}
            {date && (
                <p className="article-meta">
                    <time dateTime={this.dateISO(page.date)}>{this.dateISO(page.date)}</time>
                </p>
            )}
            {!!tags?.length && (
                <ul className="tag-list">
                    {tags.map((tag) => (
                        <li key={tag}>
                            <a href={this.tagUrl(tag)}>{tag}</a>
                        </li>
                    ))}
                </ul>
            )}
            {heroImage && <img src={heroImage} alt="" />}
        </header>,
    );
    // Only rendered Markdown and our rendered header enter this trusted HTML boundary.
    return (
        <>
            <article dangerouslySetInnerHTML={{ __html: header + content }} />
            {home && (
                <section>
                    <h2>最新內容</h2>
                    <ArticleList
                        entries={collections.articles.slice(0, 5)}
                        dateISO={this.dateISO}
                    />
                </section>
            )}
        </>
    );
}
