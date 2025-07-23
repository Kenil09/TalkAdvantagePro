/*
@deprecated
Please use weaviate-v3/client.ts
*/
import weaviate from 'weaviate-ts-client'

const client = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
})

async function ensureSchemaInitialized() {
  try {
    // Check if schema exists
    const schema = await client.schema.getter().do()
    if (!schema?.classes?.length) {
      // Initialize schema if it doesn't exist
      await initializeKnowledgeGraphSchema()
    }
  } catch (error) {
    console.error('Error initializing schema:', error)
    throw new Error(
      'Failed to initialize database schema. Please ensure Weaviate is running at http://localhost:8080',
    )
  }
}

async function initializeKnowledgeGraphSchema() {
  try {
    const schema = await client.schema.getter().do()

    // Create Person class if it doesn't exist
    const personClassExists = schema.classes?.some((c) => c.class === 'Person')
    if (!personClassExists) {
      await client.schema
        .classCreator()
        .withClass({
          class: 'Person',
          vectorizer: 'text2vec-transformers',
          moduleConfig: {
            'text2vec-transformers': {
              vectorizeClassName: false,
              model: 'sentence-transformers-multi-qa-MiniLM-L6-cos-v1',
              poolingStrategy: 'masked_mean',
              inferenceUrl: 'http://t2v-transformers:8080',
            },
          },
          properties: [
            {
              name: 'name',
              dataType: ['string'],
            },
            {
              name: 'type',
              dataType: ['string'],
            },
            {
              name: 'description',
              dataType: ['text'],
            },
            {
              name: 'metadata',
              dataType: ['object'],
              nestedProperties: [
                {
                  name: 'data',
                  dataType: ['text'],
                },
              ],
            },
            {
              name: 'createdAt',
              dataType: ['date'],
            },
            {
              name: 'updatedAt',
              dataType: ['date'],
            },
          ],
        })
        .do()
    }

    // Create File class if it doesn't exist
    const fileClassExists = schema.classes?.some((c) => c.class === 'File')
    if (!fileClassExists) {
      await client.schema
        .classCreator()
        .withClass({
          class: 'File',
          vectorizer: 'text2vec-transformers',
          moduleConfig: {
            'text2vec-transformers': {
              vectorizeClassName: false, // Keep this if supported
            },
          },
          properties: [
            {
              name: 'name',
              dataType: ['text'],
            },
            {
              name: 'type',
              dataType: ['text'],
            },
            {
              name: 'personId',
              dataType: ['text'],
            },
            {
              name: 'metadata',
              dataType: ['object'],
              nestedProperties: [
                {
                  name: 'data',
                  dataType: ['text'],
                },
              ],
            },
            {
              name: 'createdAt',
              dataType: ['date'],
            },
            {
              name: 'updatedAt',
              dataType: ['date'],
            },
          ],
        })
        .do()
    }

    // Create Relationship class if it doesn't exist
    const relationshipClassExists = schema.classes?.some(
      (c) => c.class === 'Relationship',
    )
    if (!relationshipClassExists) {
      await client.schema
        .classCreator()
        .withClass({
          class: 'Relationship',
          vectorizer: 'none',
          properties: [
            {
              name: 'source',
              dataType: ['text'],
            },
            {
              name: 'target',
              dataType: ['text'],
            },
            {
              name: 'type',
              dataType: ['text'],
            },
            {
              name: 'properties',
              dataType: ['object'],
              nestedProperties: [
                {
                  name: 'key',
                  dataType: ['text'],
                },
                {
                  name: 'value',
                  dataType: ['text'],
                },
              ],
            },
            {
              name: 'createdAt',
              dataType: ['date'],
            },
            {
              name: 'updatedAt',
              dataType: ['date'],
            },
          ],
        })
        .do()
    }

    // Create ContextPack class if it doesn't exist
    const contextPackClassExists = schema.classes?.some(
      (c) => c.class === 'ContextPack',
    )
    if (!contextPackClassExists) {
      await client.schema
        .classCreator()
        .withClass({
          class: 'ContextPack',
          vectorizer: 'text2vec-transformers',
          moduleConfig: {
            'text2vec-transformers': {
              vectorizeClassName: false,
              model: 'sentence-transformers-multi-qa-MiniLM-L6-cos-v1',
              poolingStrategy: 'masked_mean',
              inferenceUrl: 'http://t2v-transformers:8080',
            },
          },
          properties: [
            {
              name: 'userId',
              dataType: ['string'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: true,
                },
              },
            },
            {
              name: 'name',
              dataType: ['string'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: true,
                },
              },
            },
            {
              name: 'userRole',
              dataType: ['string'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: true,
                },
              },
            },
            {
              name: 'goal',
              dataType: ['text'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: false,
                },
              },
            },
            {
              name: 'subGoals',
              dataType: ['string[]'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: true,
                },
              },
            },
            {
              name: 'person',
              dataType: ['string'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: true,
                },
              },
            },
            {
              name: 'personRelationship',
              dataType: ['string'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: true,
                },
              },
            },
            {
              name: 'participants',
              dataType: ['object[]'],
              nestedProperties: [
                { name: 'name', dataType: ['text'] },
                { name: 'role', dataType: ['text'] },
                { name: 'relationship_to_user', dataType: ['text'] },
              ],
              properties: [
                {
                  name: 'name',
                  dataType: ['string'],
                },
                {
                  name: 'role',
                  dataType: ['string'],
                },
                {
                  name: 'relationship_to_user',
                  dataType: ['string'],
                },
                {
                  name: 'apex_profile',
                  dataType: ['object'],
                  properties: [
                    {
                      name: 'risk_tolerance',
                      dataType: ['string'],
                    },
                    {
                      name: 'decision_speed',
                      dataType: ['string'],
                    },
                    {
                      name: 'key_motivators',
                      dataType: ['string[]'],
                    },
                    {
                      name: 'recent_behavior',
                      dataType: ['string'],
                    },
                  ],
                },
              ],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: true,
                },
              },
            },
            {
              name: 'documents',
              dataType: ['text[]'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: true,
                },
              },
            },
            {
              name: 'contextDescription',
              dataType: ['text'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: false,
                },
              },
            },
            {
              name: 'keyTopics',
              dataType: ['string[]'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: true,
                },
              },
            },
            {
              name: 'notes',
              dataType: ['text'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: false,
                },
              },
            },
            {
              name: 'timeline',
              dataType: ['string[]'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: true,
                },
              },
            },
            {
              name: 'conflictMap',
              dataType: ['text'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: false,
                },
              },
            },
            {
              name: 'environmentalFactors',
              dataType: ['text'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: false,
                },
              },
            },
            {
              name: 'createdAt',
              dataType: ['date'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: true,
                },
              },
            },
            {
              name: 'updatedAt',
              dataType: ['date'],
              moduleConfig: {
                'text2vec-transformers': {
                  skip: true,
                },
              },
            },
          ],
        })
        .do()
    }

    // Create DocumentChunk class if it doesn't exist
    const documentChunkClassExists = schema.classes?.some(
      (c) => c.class === 'DocumentChunk',
    )
    if (!documentChunkClassExists) {
      await client.schema
        .classCreator()
        .withClass({
          class: 'DocumentChunk',
          description: 'A chunk of a document with vector embeddings',
          vectorizer: 'text2vec-transformers', // <-- change from 'text2vec-openai'
          moduleConfig: {
            'text2vec-transformers': {
              vectorizeClassName: false,
            },
          },
          properties: [
            {
              name: 'content',
              dataType: ['text'],
              description: 'The content of the document chunk',
            },
            {
              name: 'contextPackId',
              dataType: ['string'],
            },
            {
              name: 'chunkIndex',
              dataType: ['number'],
            },
            {
              name: 'userId',
              dataType: ['string'],
            },
            {
              name: 'metadata',
              dataType: ['object'],
              nestedProperties: [
                { name: 'name', dataType: ['text'] },
                { name: 'file', dataType: ['text'] },
                { name: 'tags', dataType: ['text[]'] },
                { name: 'chunkIndex', dataType: ['number'] },
                { name: 'totalChunks', dataType: ['number'] },
                { name: 'type', dataType: ['text'] },
              ],
            },
            {
              name: 'createdAt',
              dataType: ['date'],
            },
            {
              name: 'updatedAt',
              dataType: ['date'],
            },
          ],
        })
        .do()
    }

    console.log('Knowledge graph schema initialized')
  } catch (error) {
    console.error('Error initializing knowledge graph schema:', error)
    throw error
  }
}

ensureSchemaInitialized()
