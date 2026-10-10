import type { TaggedTemplateData, TemplateHelpers } from "../types/templates.ts";

import ArticleList from "./_includes/article-list.tsx";

export const data = {
    layout: "base.11ty.tsx",
    pagination: { data: "collections.tagGroups", size: 1, alias: "group" },
    permalink(this: TemplateHelpers, { group }: TaggedTemplateData) {
        return this.tagUrl(group.tag) + "index.html";
    },
    eleventyComputed: { title: ({ group }: TaggedTemplateData) => `Tag：${group.tag}` },
};

export default function (this: TemplateHelpers, { title, group }: TaggedTemplateData) {
    return (
        <>
            <h1>{title}</h1>
            <ArticleList entries={group.entries} dateISO={this.dateISO} />
        </>
    );
}
