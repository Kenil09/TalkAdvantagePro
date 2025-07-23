import weaviate from 'weaviate-ts-client'

export const weaviateClient = weaviate.client({
  scheme: process.env.NEXT_PUBLIC_WEAVIATE_SCHEME!,
  host: process.env.NEXT_PUBLIC_WEAVIATE_HOST!,
})
