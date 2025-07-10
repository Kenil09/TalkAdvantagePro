import { initSchema } from "@/lib/weaviate-v3/init-schema";

/**
 * Initializes the Weaviate schema for the knowledge graph
 * This is the v3 implementation using the collections API
 */
async function initializeKnowledgeGraphSchema() {
  console.log("Initializing knowledge graph schema...");

  try {
    await initSchema();
    console.log("Knowledge graph schema initialized successfully");
  } catch (error) {
    console.error("Error initializing knowledge graph schema:", error);
    throw error;
  }
}

initializeKnowledgeGraphSchema();