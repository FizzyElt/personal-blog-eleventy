import type { CollectionItem } from "../../types/content.ts";
import type { TemplateHelpers } from "../../types/templates.ts";

export default function ArticleList({
    entries,
    dateISO,
}: {
    entries: CollectionItem[];
    dateISO: TemplateHelpers["dateISO"];
}) {
    return (
        <ul className="article-list">
            {entries.map((entry) => (
                <li key={entry.inputPath}>
                    <h2>
                        <a href={entry.url || undefined}>{entry.data.title}</a>
                    </h2>
                    {entry.data.date && (
                        <time dateTime={dateISO(entry.date)}>{dateISO(entry.date)}</time>
                    )}
                    {entry.data.description && <p>{entry.data.description}</p>}
                </li>
            ))}
        </ul>
    );
}
