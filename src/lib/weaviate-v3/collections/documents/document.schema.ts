import { configure } from 'weaviate-client'
import { getWeaviateClient, vectorizedModule } from '@/lib/weaviate-v3/client'
import { collectionExists } from '@/lib/weaviate-v3/utils'

export const initSchema = async () => {
  try {
    const client = await getWeaviateClient()
    const exists = await collectionExists(client, 'Document')
    if (exists) {
      console.log('Document collection already exists')
      return
    }
    await client.collections.create({
      name: 'Document',
      vectorizers: vectorizedModule({
        vectorizeCollectionName: false,
      }),
      properties: [
        {
          name: 'contextPackId',
          dataType: configure.dataType.TEXT,
          skipVectorization: true,
        },
        {
          name: 'documentId',
          dataType: configure.dataType.TEXT,
          skipVectorization: true,
        },
        {
          name: 'name',
          dataType: configure.dataType.TEXT,
        },
        {
          name: 'content',
          dataType: configure.dataType.TEXT,
        },
      ],
    })
  } catch (error) {
    console.error('Error initializing document schema:', error)
    throw error
  }
}

export const getDocumentCollection = async () => {
  const client = await getWeaviateClient()
  return client.collections.get('Document')
}
