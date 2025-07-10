import { configure } from "weaviate-client";
import { getWeaviateClient, vectorizedModule } from "@/lib/weaviate-v3/client";
import { collectionExists } from "@/lib/weaviate-v3/utils";

export const initSchema = async () => {
  try {
    const client = await getWeaviateClient();
    const exists = await collectionExists(client, "ContextPack");
    if (exists) {
      console.log("ContextPack collection already exists");
      return;
    }
    await client.collections.create({
      name: "ContextPack",
      vectorizers: vectorizedModule({
        vectorizeCollectionName: false,
      }),
      properties: [
        {
          name: "userId",
          dataType: configure.dataType.TEXT,
          skipVectorization: true,
        },
        {
          name: "name",
          dataType: configure.dataType.TEXT,
        },
        {
          name: "userRole",
          dataType: configure.dataType.TEXT,
          skipVectorization: true,
        },
        {
          name: "goal",
          dataType: configure.dataType.TEXT,
        },
        {
          name: "subGoals",
          dataType: configure.dataType.TEXT_ARRAY,
        },
        {
          name: "person",
          dataType: configure.dataType.TEXT,
        },
        {
          name: "personRelationship",
          dataType: configure.dataType.TEXT,
        },
        {
          name: "participants",
          dataType: configure.dataType.OBJECT_ARRAY,
          nestedProperties: [
            {
              name: "name",
              dataType: configure.dataType.TEXT,
            },
            {
              name: "role",
              dataType: configure.dataType.TEXT,
            },
            {
              name: "relationship_to_user",
              dataType: configure.dataType.TEXT,
            },
            {
              name: "apex_profile",
              dataType: configure.dataType.OBJECT,
              nestedProperties: [
                {
                  name: "risk_tolerance",
                  dataType: configure.dataType.TEXT,
                },
                {
                  name: "decision_speed",
                  dataType: configure.dataType.TEXT,
                },
                {
                  name: "key_motivators",
                  dataType: configure.dataType.TEXT_ARRAY,
                },
                {
                  name: "recent_behavior",
                  dataType: configure.dataType.TEXT,
                },
              ],
            },
          ],
        },
        {
          name: "documents",
          dataType: configure.dataType.OBJECT_ARRAY,
          nestedProperties: [
            {
              name: "name",
              dataType: configure.dataType.TEXT,
            },
            {
              name: "file",
              dataType: configure.dataType.TEXT,
            },
            {
              name: "type",
              dataType: configure.dataType.TEXT,
            },
            {
              name: "tags",
              dataType: configure.dataType.TEXT_ARRAY,
            },
          ],
        },
        {
          name: "contextDescription",
          dataType: configure.dataType.TEXT,
        },
        {
          name: "keyTopics",
          dataType: configure.dataType.TEXT_ARRAY,
        },
        {
          name: "notes",
          dataType: configure.dataType.TEXT,
        },
        {
          name: "timeline",
          dataType: configure.dataType.TEXT_ARRAY,
        },
        {
          name: "conflictMap",
          dataType: configure.dataType.TEXT,
        },
        {
          name: "environmentalFactors",
          dataType: configure.dataType.TEXT,
        },
        {
          name: "createdAt",
          dataType: configure.dataType.DATE,
        },
        {
          name: "updatedAt",
          dataType: configure.dataType.DATE,
        },
      ],
    });
  } catch (error) {
    console.error("Error initializing context pack schema:", error);
    throw error;
  }
};

export const getContextPackCollection = async () => {
    const client = await getWeaviateClient();
    return client.collections.get("ContextPack");
};