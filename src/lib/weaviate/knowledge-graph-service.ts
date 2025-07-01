import { safeParseDate } from "@/utils/dateFormats";
import { weaviateClient } from "./client";
import {
  ContextPack,
  DocumentChunk,
  File,
  Person,
  Relationship,
  WeaviateGetContextPackResponse,
  WeaviateResponse,
} from "@/types/knowledge-graph.types";
import { WhereFilter } from "weaviate-ts-client";

export const knowledgeGraphService = {
  // Person operations
  async createPerson(person: Omit<Person, "id" | "createdAt" | "updatedAt">) {
    try {
      const now = new Date().toISOString();
      const result = await weaviateClient.data
        .creator()
        .withClassName("Person")
        .withProperties({
          ...person,
          createdAt: now,
          updatedAt: now,
        })
        .do();

      return {
        ...person,
        id: result.id,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      };
    } catch (error) {
      console.error("Error creating person:", error);
      throw error;
    }
  },

  async updatePerson(id: string, updates: Partial<Person>) {
    try {
      const now = new Date();
      await weaviateClient.data
        .updater()
        .withClassName("Person")
        .withId(id)
        .withProperties({
          ...updates,
          updatedAt: now,
        })
        .do();

      return { id, ...updates, updatedAt: now };
    } catch (error) {
      console.error("Error updating person:", error);
      throw error;
    }
  },

  async deletePerson(id: string): Promise<boolean> {
    console.log("Deleting person with ID:", id);
    try {
      // First delete all relationships
      console.log("Deleting relationships for person:", id);
      await this.deletePersonRelationships(id);

      // Then delete all files
      console.log("Deleting files for person:", id);
      const files = await this.getPersonFiles(id);
      for (const file of files) {
        await this.deleteFile(file.id);
      }

      // Finally delete the person
      console.log("Deleting person:", id);
      await weaviateClient.data
        .deleter()
        .withClassName("Person")
        .withId(id)
        .do();

      console.log("Delete person completed successfully");
      return true;
    } catch (error) {
      console.error("Error in deletePerson:", error);
      throw error;
    }
  },

  async getPerson(id: string) {
    try {
      const result = await weaviateClient.data
        .getterById()
        .withClassName("Person")
        .withId(id)
        .do();

      if (!result) return null;

      const now = new Date().toISOString();
      const metadata = result.properties?.metadata || { data: "" };
      const createdAt = safeParseDate(result?.properties?.createdAt, now);
      const updatedAt = safeParseDate(result?.properties?.updatedAt, now);

      return {
        id: result.id || id,
        name: result.properties?.name || "",
        type: result.properties?.type || "",
        metadata: typeof metadata === "object" ? metadata : { data: "" },
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      } as Person;
    } catch (error) {
      console.error("Error getting person:", error);
      throw error;
    }
  },

  // File operations
  async createFile(file: Omit<File, "id" | "createdAt" | "updatedAt">) {
    try {
      const now = new Date();
      const result = await weaviateClient.data
        .creator()
        .withClassName("File")
        .withProperties({
          ...file,
          createdAt: now,
          updatedAt: now,
        })
        .do();

      return { ...file, id: result.id, createdAt: now, updatedAt: now };
    } catch (error) {
      console.error("Error creating file:", error);
      throw error;
    }
  },

  async updateFile(id: string, updates: Partial<File>) {
    try {
      const now = new Date();
      await weaviateClient.data
        .updater()
        .withClassName("File")
        .withId(id)
        .withProperties({
          ...updates,
          updatedAt: now,
        })
        .do();

      return { id, ...updates, updatedAt: now };
    } catch (error) {
      console.error("Error updating file:", error);
      throw error;
    }
  },

  async deleteFile(id: string) {
    try {
      await weaviateClient.data.deleter().withClassName("File").withId(id).do();

      return { success: true };
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  },

  async getPersonFiles(personId: string) {
    try {
      const result = await weaviateClient.graphql
        .get()
        .withClassName("File")
        .withFields(
          "name type metadata { data } personId createdAt updatedAt _additional { id }"
        )
        .withWhere({
          path: ["personId"],
          operator: "Equal",
          valueString: personId,
        })
        .do();

      if (!result.data?.Get?.File) {
        return [];
      }

      const now = new Date().toISOString();
      return result.data.Get.File.map(
        (file: File & { _additional: { id: string } }) => {
          const metadata = file.metadata || { data: "" };
          const createdAt = file.createdAt || now;
          const updatedAt = file.updatedAt || now;

          return {
            id: file._additional?.id || "",
            name: file.name || "",
            type: file.type || "",
            metadata: typeof metadata === "object" ? metadata : { data: "" },
            personId: file.personId || "",
            createdAt: new Date(createdAt),
            updatedAt: new Date(updatedAt),
          };
        }
      );
    } catch (error: unknown) {
      console.error("Error getting person files:", error);
      return []; // Return empty array for any error
    }
  },

  async deletePersonFiles(personId: string) {
    try {
      const files = await this.getPersonFiles(personId);
      for (const file of files) {
        await this.deleteFile(file.id);
      }
      return { success: true, deletedCount: files.length };
    } catch (error) {
      console.error("Error deleting person files:", error);
      throw error;
    }
  },

  // Relationship operations
  async createRelationship(
    relationship: Omit<Relationship, "id" | "createdAt" | "updatedAt">
  ) {
    try {
      const now = new Date();
      const result = await weaviateClient.data
        .creator()
        .withClassName("Relationship")
        .withProperties({
          ...relationship,
          createdAt: now,
          updatedAt: now,
        })
        .do();

      return { ...relationship, id: result.id, createdAt: now, updatedAt: now };
    } catch (error: unknown) {
      console.error("Error creating relationship:", error);
      throw error;
    }
  },

  async updateRelationship(id: string, updates: Partial<Relationship>) {
    try {
      const now = new Date();
      await weaviateClient.data
        .updater()
        .withClassName("Relationship")
        .withId(id)
        .withProperties({
          ...updates,
          updatedAt: now,
        })
        .do();

      return { id, ...updates, updatedAt: now };
    } catch (error: unknown) {
      console.error("Error updating relationship:", error);
      throw error;
    }
  },

  async deleteRelationship(id: string) {
    try {
      await weaviateClient.data
        .deleter()
        .withClassName("Relationship")
        .withId(id)
        .do();

      return { success: true };
    } catch (error: unknown) {
      console.error("Error deleting relationship:", error);
      throw error;
    }
  },

  async deletePersonRelationships(personId: string) {
    try {
      const result = await weaviateClient.graphql
        .get()
        .withClassName("Relationship")
        .withFields("_additional { id }")
        .withWhere({
          operator: "Or",
          operands: [
            {
              operator: "Equal",
              path: ["source"],
              valueString: personId,
            },
            {
              operator: "Equal",
              path: ["target"],
              valueString: personId,
            },
          ],
        })
        .do();

      if (!result.data?.Get?.Relationship) {
        return { success: true, deletedCount: 0 };
      }

      for (const rel of result.data.Get.Relationship) {
        await this.deleteRelationship(rel._additional.id);
      }

      return {
        success: true,
        deletedCount: result.data.Get.Relationship.length,
      };
    } catch (error: unknown) {
      console.error("Error deleting person relationships:", error);
      throw error;
    }
  },

  async getPersonRelationships(personId: string) {
    try {
      const result = await weaviateClient.graphql
        .get()
        .withClassName("Relationship")
        .withFields(
          "source target type properties createdAt updatedAt _additional { id }"
        )
        .withWhere({
          operator: "Or",
          operands: [
            {
              operator: "Equal",
              path: ["source"],
              valueString: personId,
            },
            {
              operator: "Equal",
              path: ["target"],
              valueString: personId,
            },
          ],
        })
        .do();

      if (!result.data?.Get?.Relationship) {
        return [];
      }

      return result.data.Get.Relationship.map(
        (rel: Relationship & { _additional: { id: string } }) => ({
          id: rel._additional?.id || "",
          source: rel.source || "",
          target: rel.target || "",
          type: rel.type || "",
          properties: rel.properties || {},
          createdAt: new Date(rel.createdAt || Date.now().toString()),
          updatedAt: new Date(rel.updatedAt || Date.now().toString()),
        })
      );
    } catch (error: unknown) {
      console.error("Error getting person relationships:", error);
      return [];
    }
  },

  // Graph exploration
  async exploreGraph(startPersonId: string, depth: number = 2) {
    try {
      const visited = new Set<string>();
      const graph: { nodes: Person[]; edges: Relationship[] } = {
        nodes: [],
        edges: [],
      };

      const exploreNode = async (personId: string, currentDepth: number) => {
        if (currentDepth > depth || visited.has(personId)) return;
        visited.add(personId);

        // Get person details
        const person = await this.getPerson(personId);
        if (person) {
          graph.nodes.push(person);
        }

        // Get relationships
        const relationships = await this.getPersonRelationships(personId);
        for (const rel of relationships) {
          graph.edges.push(rel);

          // Explore connected nodes
          const nextPersonId =
            rel.source === personId ? rel.target : rel.source;
          await exploreNode(nextPersonId, currentDepth + 1);
        }
      };

      await exploreNode(startPersonId, 0);
      return graph;
    } catch (error) {
      console.error("Error exploring graph:", error);
      throw error;
    }
  },

  async searchPeople(query: string, limit: number = 10) {
    try {
      if (!query.trim()) {
        return this.getAllPeople(limit);
      }

      const result = await weaviateClient.graphql
        .get()
        .withClassName("Person")
        .withFields(
          "name type metadata { data } createdAt updatedAt _additional { id }"
        )
        .withNearText({ concepts: [query] })
        .withLimit(limit)
        .do();

      if (!result.data.Get || !result.data.Get.Person) {
        return [];
      }

      const now = new Date().toISOString();
      return result.data.Get.Person.map(
        (person: Person & { _additional: { id: string } }) => {
          const metadata = person.metadata || { data: "" };
          const createdAt = person.createdAt || now;
          const updatedAt = person.updatedAt || now;

          return {
            id: person._additional?.id || "",
            name: person.name || "",
            type: person.type || "",
            metadata: typeof metadata === "object" ? metadata : { data: "" },
            createdAt: new Date(createdAt),
            updatedAt: new Date(updatedAt),
          };
        }
      );
    } catch (error: unknown) {
      console.error("Error searching people:", error);
      throw error;
    }
  },

  async getAllPeople(limit: number = 100) {
    try {
      const result: WeaviateResponse = await weaviateClient.data
        .getter()
        .withClassName("Person")
        .withLimit(limit)
        .do();

      if (!result || !result.objects) {
        return [];
      }

      const now = new Date().toISOString();
      return result.objects.map((person) => {
        const metadata = person.properties?.metadata || { data: "" };
        const createdAt = safeParseDate(person.properties?.createdAt, now);
        const updatedAt = safeParseDate(person.properties?.updatedAt, now);

        return {
          id: person.id || "",
          name: person.properties?.name || "",
          type: person.properties?.type || "",
          metadata: typeof metadata === "object" ? metadata : { data: "" },
          createdAt: new Date(createdAt),
          updatedAt: new Date(updatedAt),
        };
      });
    } catch (error: unknown) {
      console.error("Error getting all people:", error);
      throw error;
    }
  },

  async getAllRelationships() {
    try {
      const result: WeaviateResponse = await weaviateClient.data
        .getter()
        .withClassName("Relationship")
        .withLimit(1000)
        .do();

      if (!result || !result.objects) {
        return [];
      }

      const now = new Date().toISOString();
      return result.objects.map((rel) => ({
        id: rel.id || "",
        source: rel.properties?.source || "",
        target: rel.properties?.target || "",
        type: rel.properties?.type || "",
        properties: rel.properties?.properties || { data: "" },
        createdAt: new Date(safeParseDate(rel.properties?.createdAt, now)),
        updatedAt: new Date(safeParseDate(rel.properties?.updatedAt, now)),
      }));
    } catch (error: unknown) {
      console.error("Error getting all relationships:", error);
      throw error;
    }
  },

  // Add new query methods to match curl commands
  async queryPersons(where?: WhereFilter) {
    try {
      const result = await weaviateClient.graphql
        .get()
        .withClassName("Person")
        .withFields("name type metadata { data } _additional { id }")
        .withWhere(where || {})
        .do();

      const now = new Date().toISOString();
      return result.data.Get.Person.map(
        (person: Person & { _additional: { id: string } }) => ({
          id: person._additional.id,
          name: person.name,
          type: person.type,
          metadata: person.metadata || { data: "" },
          createdAt: new Date(now),
          updatedAt: new Date(now),
        })
      );
    } catch (error) {
      console.error("Error querying persons:", error);
      throw error;
    }
  },

  async queryFiles(where?: WhereFilter) {
    try {
      const result = await weaviateClient.graphql
        .get()
        .withClassName("File")
        .withFields("name type metadata { data } personId _additional { id }")
        .withWhere(where || {})
        .do();

      const now = new Date().toISOString();
      return result.data.Get.File.map(
        (file: File & { _additional: { id: string } }) => ({
          id: file._additional.id,
          name: file.name,
          type: file.type,
          metadata: file.metadata || { data: "" },
          personId: file.personId,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        })
      );
    } catch (error: unknown) {
      console.error("Error querying files:", error);
      throw error;
    }
  },

  async queryRelationships(where?: WhereFilter) {
    try {
      const result = await weaviateClient.graphql
        .get()
        .withClassName("Relationship")
        .withFields("source target type properties { data } _additional { id }")
        .withWhere(where || {})
        .do();

      const now = new Date().toISOString();
      return result.data.Get.Relationship.map(
        (rel: Relationship & { _additional: { id: string } }) => ({
          id: rel._additional.id,
          source: rel.source,
          target: rel.target,
          type: rel.type,
          properties: rel.properties || { data: "" },
          createdAt: new Date(now),
          updatedAt: new Date(now),
        })
      );
    } catch (error: unknown) {
      console.error("Error querying relationships:", error);
      throw error;
    }
  },

  // Context Pack specific methods
  async createContextPack(
    contextPack: Omit<ContextPack, "id" | "createdAt" | "updatedAt">
  ): Promise<ContextPack> {
    try {
      // Delete all previous context packs for this user
      // await this.deleteAllUserContextPacks(contextPack.userId);

      // Format the documents array to match Weaviate's expected structure
      const formattedDocuments = contextPack.documents.map((doc) =>
        JSON.stringify({
          name: doc.name,
          file: doc.file,
          tags: doc.tags || [],
        })
      );

      const result = await weaviateClient.data
        .creator()
        .withClassName("ContextPack")
        .withProperties({
          ...contextPack,
          documents: formattedDocuments,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .do();

      if (!result.properties) {
        throw new Error("No properties returned from Weaviate");
      }

      const now = new Date().toISOString();

      return {
        ...contextPack,
        id: result.id!,
        createdAt: new Date(safeParseDate(result.properties.createdAt, now)),
        updatedAt: new Date(safeParseDate(result.properties.updatedAt, now)),
      };
    } catch (error) {
      console.error("Error creating context pack:", error);
      throw error;
    }
  },

  async updateContextPack(
    id: string,
    updates: Partial<ContextPack>
  ): Promise<ContextPack> {
    try {
      const result = await weaviateClient.data
        .updater()
        .withClassName("ContextPack")
        .withId(id)
        .withProperties({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .do();

      if (!result.properties) {
        throw new Error("No properties returned from Weaviate");
      }

      return {
        ...result.properties,
        id: result.id,
        createdAt: new Date(result.properties.createdAt),
        updatedAt: new Date(result.properties.updatedAt),
      };
    } catch (error: unknown) {
      console.error("Error updating context pack:", error);
      throw error;
    }
  },

  async deleteContextPack(id: string): Promise<boolean> {
    try {
      await weaviateClient.data
        .deleter()
        .withClassName("ContextPack")
        .withId(id)
        .do();
      return true;
    } catch (error: unknown) {
      console.error("Error deleting context pack:", error);
      throw error;
    }
  },

  async getContextPack(id: string): Promise<ContextPack | null> {
    try {
      const result = (await weaviateClient.data
        .getterById()
        .withClassName("ContextPack")
        .withId(id)
        .do()) as WeaviateGetContextPackResponse;

      if (!result) return null;
      if (!result.properties) {
        throw new Error("No properties returned from Weaviate");
      }

      const now = new Date().toISOString();

      return {
        ...result.properties,
        id: result.id!,
        createdAt: new Date(safeParseDate(result.properties.createdAt, now)),
        updatedAt: new Date(safeParseDate(result.properties.updatedAt, now)),
      };
    } catch (error: unknown) {
      console.error("Error getting context pack:", error);
      throw error;
    }
  },

  async getUserContextPacks(userId: string): Promise<ContextPack[]> {
    try {
      const result = await weaviateClient.graphql
        .get()
        .withClassName("ContextPack")
        .withFields(
          "_additional { id } userId name userRole goal subGoals person personRelationship participants { name role relationship_to_user } documents contextDescription keyTopics notes timeline conflictMap environmentalFactors createdAt updatedAt"
        )
        .withWhere({
          operator: "Equal",
          path: ["userId"],
          valueString: userId,
        })
        .do();

      return result.data.Get.ContextPack.map((pack: ContextPack) => ({
        ...pack,
        createdAt: new Date(
          safeParseDate(pack.createdAt, new Date().toISOString())
        ),
        updatedAt: new Date(
          safeParseDate(pack.updatedAt, new Date().toISOString())
        ),
      }));
    } catch (error: unknown) {
      console.error("Error getting user context packs:", error);
      throw error;
    }
  },

  async searchContextPacks(
    query: string,
    userId?: string,
    limit: number = 10
  ): Promise<ContextPack[]> {
    try {
      let graphqlQuery = weaviateClient.graphql
        .get()
        .withClassName("ContextPack")
        .withFields(
          "id userId name userRole goal subGoals person personRelationship participants documents contextDescription keyTopics notes timeline conflictMap environmentalFactors createdAt updatedAt"
        )
        .withNearText({ concepts: [query] })
        .withLimit(limit);

      if (userId) {
        graphqlQuery = graphqlQuery.withWhere({
          operator: "Equal",
          path: ["userId"],
          valueString: userId,
        });
      }

      const result = await graphqlQuery.do();

      return result.data.Get.ContextPack.map((pack: ContextPack) => ({
        ...pack,
        createdAt: new Date(pack.createdAt),
        updatedAt: new Date(pack.updatedAt),
      }));
    } catch (error: unknown) {
      console.error("Error searching context packs:", error);
      throw error;
    }
  },

  // Add new method to delete all context packs for a user
  async deleteAllUserContextPacks(userId: string): Promise<boolean> {
    try {
      const result = await weaviateClient.graphql
        .get()
        .withClassName("ContextPack")
        .withFields("_additional { id }")
        .withWhere({
          operator: "Equal",
          path: ["userId"],
          valueString: userId,
        })
        .do();

      if (result.data?.Get?.ContextPack) {
        for (const pack of result.data.Get.ContextPack) {
          await this.deleteContextPack(pack._additional.id);
        }
      }
      return true;
    } catch (error) {
      console.error("Error deleting all user context packs:", error);
      throw error;
    }
  },

  // Add new method to get all context packs
  async getAllContextPacks(limit: number = 100): Promise<ContextPack[]> {
    try {
      const result = await weaviateClient.graphql
        .get()
        .withClassName("ContextPack")
        .withFields(
          `
          _additional { id }
          userId
          name
          userRole
          goal
          subGoals
          person
          personRelationship
          participants {
            name
            role
            relationship_to_user
          }
          documents
          contextDescription
          keyTopics
          notes
          timeline
          conflictMap
          environmentalFactors
          createdAt
          updatedAt
        `
        )
        .withLimit(limit)
        .do();

      if (!result.data?.Get?.ContextPack) {
        return [];
      }

      return result.data.Get.ContextPack.map(
        (pack: ContextPack & { _additional: { id: string } }) => ({
          id: pack._additional?.id || "",
          userId: pack.userId || "",
          name: pack.name || "",
          userRole: pack.userRole || "",
          goal: pack.goal || "",
          subGoals: pack.subGoals || [],
          person: pack.person || "",
          personRelationship: pack.personRelationship || "",
          participants: (pack.participants || []).map((p) => ({
            name: p.name || "",
            role: p.role || "",
            relationship_to_user: p.relationship_to_user || "",
            apex_profile: p.apex_profile || {},
          })),
          documents: pack.documents,
          contextDescription: pack.contextDescription || "",
          keyTopics: pack.keyTopics || [],
          notes: pack.notes || "",
          timeline: pack.timeline || [],
          conflictMap: pack.conflictMap || "",
          environmentalFactors: pack.environmentalFactors || "",
          createdAt: new Date(pack.createdAt || new Date().toISOString()),
          updatedAt: new Date(pack.updatedAt || new Date().toISOString()),
        })
      );
    } catch (error: unknown) {
      console.error("Error getting all context packs:", error);
      throw error;
    }
  },

  // Document Chunk methods
  async createDocumentChunk(
    chunk: Omit<DocumentChunk, "id" | "createdAt" | "updatedAt">
  ): Promise<DocumentChunk> {
    try {
      const result = await weaviateClient.data
        .creator()
        .withClassName("DocumentChunk")
        .withProperties({
          ...chunk,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .do();

      if (!result.properties) {
        throw new Error("No properties returned from Weaviate");
      }

      const now = new Date().toISOString();

      return {
        ...chunk,
        id: result.id!,
        createdAt: new Date(safeParseDate(result.properties.createdAt, now)),
        updatedAt: new Date(safeParseDate(result.properties.updatedAt, now)),
      };
    } catch (error) {
      console.error("Error creating document chunk:", error);
      throw error;
    }
  },

  async searchDocumentChunks(
    query: string,
    userId: string,
    limit: number = 5
  ): Promise<Array<DocumentChunk & { id: string; similarity: number }>> {
    try {
      const result = await weaviateClient.graphql
        .get()
        .withClassName("DocumentChunk")
        .withFields(
          "content, userId, createdAt, _additional { id, certainty  }, metadata { name file tags chunkIndex totalChunks }"
        )
        .withNearText({ concepts: [query] })
        .withWhere({
          operator: "Equal",
          path: ["userId"],
          valueString: userId,
        })
        .withLimit(limit)
        .do();

      return result.data.Get.DocumentChunk.map(
        (
          chunk: DocumentChunk & {
            _additional: { id: string; certainty: number };
          }
        ) => ({
          id: chunk._additional?.id,
          content: chunk.content,
          userId: chunk.userId,
          similarity: chunk._additional?.certainty,
          createdAt: new Date(chunk.createdAt),
          metadata: chunk.metadata,
        })
      );
    } catch (error: unknown) {
      console.error("Error searching document chunks:", error);
      throw error;
    }
  },

  async deleteDocumentChunks(userId: string, file: string): Promise<boolean> {
    try {
      const result = await weaviateClient.graphql
        .get()
        .withClassName("DocumentChunk")
        .withFields("_additional { id }")
        .withWhere({
          operator: "And",
          operands: [
            {
              operator: "Equal",
              path: ["userId"],
              valueString: userId,
            },
            {
              operator: "Equal",
              path: ["metadata", "file"],
              valueString: file,
            },
          ],
        })
        .do();

      if (result.data?.Get?.DocumentChunk) {
        for (const chunk of result.data.Get.DocumentChunk) {
          await weaviateClient.data
            .deleter()
            .withClassName("DocumentChunk")
            .withId(chunk._additional.id)
            .do();
        }
      }
      return true;
    } catch (error) {
      console.error("Error deleting document chunks:", error);
      throw error;
    }
  },

  async getDocumentChunks(
    userId: string,
    contextPackId?: string
  ): Promise<DocumentChunk[]> {
    try {
      const whereFilter: WhereFilter = {
        operator: "And",
        operands: [
          {
            path: ["userId"],
            operator: "Equal",
            valueString: userId,
          },
        ],
      };

      if (contextPackId) {
        whereFilter.operands?.push({
          path: ["contextPackId"],
          operator: "Equal",
          valueString: contextPackId,
        });
      }

      const result = await weaviateClient.graphql
        .get()
        .withClassName("DocumentChunk")
        .withFields("content userId createdAt _additional { id }")
        .withWhere(whereFilter)
        .do();

      return result.data.Get.DocumentChunk.map((chunk: DocumentChunk) => ({
        content: chunk.content,
        userId: chunk.userId,
        createdAt: new Date(chunk.createdAt),
      }));
    } catch (error: unknown) {
      console.error("Error getting document chunks:", error);
      throw error;
    }
  },

  async getSimilarDocumentChunks(
    userId: string,
    text: string,
    limit: number = 3
  ): Promise<DocumentChunk[]> {
    try {
      const result = await weaviateClient.graphql
        .get()
        .withClassName("DocumentChunk")
        .withFields("content userId createdAt _additional { id }")
        .withWhere({
          operator: "Equal",
          valueString: userId,
          path: ["userId"],
        })
        .withNearText({
          concepts: [text],
        })
        .withLimit(limit)
        .do();

      return result.data.Get.DocumentChunk.map((chunk: DocumentChunk) => ({
        content: chunk.content,
        userId: chunk.userId,
        createdAt: new Date(chunk.createdAt),
      }));
    } catch (error: unknown) {
      console.error("Error getting similar document chunks:", error);
      throw error;
    }
  },

  // Cleanup methods
  async deleteAllDocumentChunks(): Promise<boolean> {
    try {
      await weaviateClient.batch
        .objectsBatchDeleter()
        .withClassName("DocumentChunk")
        .withWhere({
          operator: "NotEqual",
          path: ["id"],
          valueString: "",
        })
        .do();
      return true;
    } catch (error: unknown) {
      console.error("Error deleting all document chunks:", error);
      throw error;
    }
  },

  async deleteAllContextPacks(): Promise<boolean> {
    try {
      await weaviateClient.batch
        .objectsBatchDeleter()
        .withClassName("ContextPack")
        .withWhere({
          operator: "NotEqual",
          path: ["id"],
          valueString: "",
        })
        .do();
      return true;
    } catch (error: unknown) {
      console.error("Error deleting all context packs:", error);
      throw error;
    }
  },

  async deleteAllFiles(): Promise<boolean> {
    try {
      await weaviateClient.batch
        .objectsBatchDeleter()
        .withClassName("File")
        .withWhere({
          operator: "NotEqual",
          path: ["id"],
          valueString: "",
        })
        .do();
      return true;
    } catch (error: unknown) {
      console.error("Error deleting all files:", error);
      throw error;
    }
  },

  async deleteAllRelationships(): Promise<boolean> {
    try {
      await weaviateClient.batch
        .objectsBatchDeleter()
        .withClassName("Relationship")
        .withWhere({
          operator: "NotEqual",
          path: ["id"],
          valueString: "",
        })
        .do();
      return true;
    } catch (error: unknown) {
      console.error("Error deleting all relationships:", error);
      throw error;
    }
  },

  async deleteAllPeople(): Promise<boolean> {
    try {
      await weaviateClient.batch
        .objectsBatchDeleter()
        .withClassName("Person")
        .withWhere({
          operator: "NotEqual",
          path: ["id"],
          valueString: "",
        })
        .do();
      return true;
    } catch (error: unknown) {
      console.error("Error deleting all people:", error);
      throw error;
    }
  },
};
