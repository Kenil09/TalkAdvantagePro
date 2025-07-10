import { WeaviateClient } from "weaviate-client";

/**
 * Helper function to check if a collection exists
 */
export async function collectionExists(client: WeaviateClient, collectionName: string): Promise<boolean> {
  try {
    const collection = await client.collections.get(collectionName).exists();
    return collection;
  } catch (error) {
    console.error(`Error checking if collection ${collectionName} exists:`, error);
    return false;
  }
}