import { ContextPack, DocumentChunk } from "./knowledge-graph.types";

export interface AnalysisContext {
  contextPack: ContextPackServiceRes | null;
  relevantChunks: Array<RelevantChunk>;
}

export interface RelevantChunk {
  content: string;
  userId: string;
  createdAt: Date;
}

export type ContextPackServiceRes = Omit<
  ContextPack,
  "id" | "userId" | "createdAt" | "updatedAt"
> & {
  relevantDocuments?: Array<Partial<DocumentChunk>>;
};
