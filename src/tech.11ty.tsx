import type { TemplateData, TemplateHelpers } from "../types/templates.ts";

import ArticleList from "./_includes/article-list.tsx";

export const data = { layout: "base.11ty.tsx", title: "技術筆記", permalink: "/tech/index.html" };

export default function (this: TemplateHelpers, { title, collections }: TemplateData) {
    return (
        <>
            <h1>{title}</h1>
            <ArticleList entries={collections.tech} dateISO={this.dateISO} />
        </>
    );
}
