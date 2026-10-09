export interface ContentData {
    title?: string;
    date?: Date | string;
    draft?: boolean;
    tags?: string[];
    section?: "posts" | "notes" | "tech";
    isArticle?: boolean;
}

export interface CollectionItem {
    inputPath: string;
    url: string | false;
    date: Date;
    data: ContentData;
}

export interface CollectionApi {
    getAllSorted(): CollectionItem[];
}
