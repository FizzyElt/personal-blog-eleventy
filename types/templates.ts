import type site from "../src/_data/site.json";
import type { CollectionItem, ContentData } from "./content.ts";

export interface TagGroup {
    tag: string;
    entries: CollectionItem[];
}

export interface TemplateData extends ContentData {
    title: string;
    content: string;
    page: { url: string; date: Date };
    site: typeof site;
    collections: {
        articles: CollectionItem[];
        posts: CollectionItem[];
        notes: CollectionItem[];
        tech: CollectionItem[];
        tagGroups: TagGroup[];
    };
    home?: boolean;
    heroImage?: string;
    socialImage?: string;
    socialImageAlt?: string;
}

export interface TaggedTemplateData extends TemplateData {
    group: TagGroup;
}

export interface TemplateHelpers {
    absoluteUrl(value: string, base: string): string;
    dateISO(value: Date | string): string;
    tagUrl(tag: string): string;
    ogImage(template: string, data: object): Promise<string>;
}

export type SocialCardData = Pick<
    TemplateData,
    "title" | "description" | "date" | "section" | "site"
>;
