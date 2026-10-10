import type { TemplateData, TemplateHelpers } from "../types/templates.ts";

import ArticleList from "./_includes/article-list.tsx";

export const data = { layout: "base.11ty.tsx", title: "Notes", permalink: "/notes/index.html" };

export default function (this: TemplateHelpers, { title, collections }: TemplateData) {
    return (
        <>
            <h1>{title}</h1>
            <ArticleList entries={collections.notes} dateISO={this.dateISO} />
        </>
    );
}
