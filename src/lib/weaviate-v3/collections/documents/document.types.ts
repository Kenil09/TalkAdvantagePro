import { Metadata, Vectors } from "weaviate-client";

export interface Document {
    contextPackId: string;
    name: string;
    content: string;
    tags: string[];
}

export type DocumentForm = Omit<Document, 'id'>;

export interface DocumentQueryResult {
    metadata: Partial<Metadata> | undefined;
    properties: Document;
    uuid: string;
    vectors: Vectors;
}