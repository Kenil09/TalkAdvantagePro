'use server'
import { WeaviateField } from 'weaviate-client'
import { getDocumentCollection } from './document.schema'
import { Document, DocumentQueryResult } from './document.types'

/*
 * Get documents by key and value
 * @param key - The key to filter by
 * @param value - The value to filter by
 * @returns The documents
 */
export const get = async (
  key: string,
  value: string,
): Promise<DocumentQueryResult[]> => {
  try {
    const collection = await getDocumentCollection()
    if (!collection) {
      throw new Error('Document collection not found')
    }
    const result = await collection.query.fetchObjects({
      filters: {
        target: {
          property: key,
        },
        operator: 'Equal',
        value: value,
      },
      limit: 20,
    })
    const documents = result.objects.map((obj) => ({
      metadata: obj.metadata,
      properties: obj.properties as unknown as Document,
      uuid: obj.uuid,
      vectors: obj.vectors,
    }))
    return documents
  } catch (error) {
    console.error('Error getting documents:', error)
    return []
  }
}

/*
 * Get documents by context pack id
 * @param contextPackId - The context pack id to filter by
 * @returns The documents
 */
export const getByContextPackId = async (
  contextPackId: string,
): Promise<DocumentQueryResult[]> => {
  return get('contextPackId', contextPackId)
}

/*
 * Create a new document
 * @param properties - The properties of the document
 * @returns The id of the created document
 */
export const create = async (
  properties: Partial<Document>,
): Promise<string | null> => {
  try {
    const collection = await getDocumentCollection()
    if (!collection) {
      throw new Error('Document collection not found')
    }
    const result = await collection.data.insert({
      properties: properties as unknown as Record<string, WeaviateField>,
    })
    return result
  } catch (error) {
    console.error('Error creating document:', error)
    return null
  }
}

export const queryDocument = async (query: string) => {
  try {
    const collection = await getDocumentCollection()
    if (!collection) {
      throw new Error('Document collection not found')
    }
    const result = await collection.query.nearText(query, {
      limit: 3,
      returnProperties: ['name', 'content'],
    })

    const documents = result.objects.map((obj) => ({
      metadata: obj.metadata,
      properties: obj.properties as unknown as Document,
      uuid: obj.uuid,
      vectors: obj.vectors,
    }))
    return documents
  } catch (error) {
    console.error('Error querying document:', error)
    return null
  }
}

/*
 * Delete a document by id
 * @param id - The id of the document to delete
 * @returns void
 */
export const deleteById = async (id: string): Promise<void> => {
  try {
    const collection = await getDocumentCollection()
    if (!collection) {
      throw new Error('Document collection not found')
    }
    const result = await collection.data.deleteById(id)
    if (!result) {
      throw new Error('Error deleting document')
    }
  } catch (error) {
    console.error('Error deleting document:', error)
  }
}
