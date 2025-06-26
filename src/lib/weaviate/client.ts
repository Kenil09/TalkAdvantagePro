import weaviate from "weaviate-ts-client";

export const weaviateClient = weaviate.client({
  scheme: process.env.WEAVIATE_SCHEME!,
  host: process.env.WEAVIATE_HOST!,
});
