import type { TemplateData, TemplateHelpers } from "../types/templates.ts";

export const data = { layout: "base.11ty.tsx", title: "Tags", permalink: "/tags/index.html" };

export default function (this: TemplateHelpers, { collections }: TemplateData) {
    return (
        <>
            <h1>Tags</h1>
            <ul>
                {collections.tagGroups.map((group) => (
                    <li key={group.tag}>
                        <a href={this.tagUrl(group.tag)}>{group.tag}</a>（{group.entries.length}）
                    </li>
                ))}
            </ul>
        </>
    );
}
