import weaviate, { WeaviateClient, vectorizer } from "weaviate-client";

const weaviateUrl = process.env.WEAVIATE_URL as string;
const weaviateApiKey = process.env.WEAVIATE_API_KEY as string;
const isCloud = process.env.WEAVIATE_CLOUD === "true";

/**
 * Connect to Weaviate cloud instance
 * @returns Promise resolving to a Weaviate client instance
 */

let client: WeaviateClient;

export const getWeaviateClient = async (): Promise<WeaviateClient> => {
  try {
    if (client) {
      const isReady = await client.isReady()
      if (isReady) {
        return client;
      }
    }
    if (isCloud) {
        client = await weaviate.connectToWeaviateCloud(
          weaviateUrl,
          {
            authCredentials: new weaviate.ApiKey(weaviateApiKey),
          }
        );
    } else {
        client = await weaviate.connectToLocal({
            host: 'localhost',
            port: 8080,
        })
    }
    return client;
  } catch (error) {
    console.error('Failed to connect to Weaviate:', error);
    throw error;
  }
};

export const vectorizedModule = isCloud ? vectorizer.text2VecWeaviate : vectorizer.text2VecTransformers;
