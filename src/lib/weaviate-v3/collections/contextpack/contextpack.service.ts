'use server'
import { WeaviateField } from 'weaviate-client'
import { getContextPackCollection } from './contextpack.schema'
import { ContextPack, ContextPackQueryResult } from './contextpack.types'

/*
* Get context packs by key and value
* @param key - The key to filter by
* @param value - The value to filter by
* @returns The context packs
*/
export const get = async (
    key: string,
    value: string,
): Promise<ContextPackQueryResult[]> => {
    try {
        const collection = await getContextPackCollection()
        if (!collection) {
            throw new Error('ContextPack collection not found')
        }
        const result = await collection.query.fetchObjects({
            filters: {
                target: {
                    property: key,
                },
                operator: 'Equal',
                value: value,
            },
        })
        const contextPacks = result.objects.map((obj) => ({
            metadata: obj.metadata,
            properties: obj.properties as unknown as ContextPack,
            uuid: obj.uuid,
            vectors: obj.vectors,
        }))
        return contextPacks
    } catch (error) {
        console.error('Error getting context packs:', error)
        return []
    }
}

/*
* Get a context pack by id
* @param id - The id of the context pack
* @returns The context pack
*/
export const getById = async (
    id: string,
): Promise<ContextPackQueryResult | null> => {
    try {
        const collection = await getContextPackCollection()
        if (!collection) {
            throw new Error('ContextPack collection not found')
        }
        const result = await collection.query.fetchObjectById(id)
        if (!result) {
            return null
        }
        const contextPack = {
            metadata: result.metadata,
            properties: result.properties as unknown as ContextPack,
            uuid: result.uuid,
            vectors: result.vectors,
        }
        return contextPack
    } catch (error) {
        console.error('Error getting context pack:', error)
        return null
    }
}

/*
* Create a new context pack
* @param properties - The properties of the context pack
* @returns The id of the created context pack
*/
export const create = async (
    properties: Partial<ContextPack>,
): Promise<string | null> => {
    try {
        const collection = await getContextPackCollection()
        if (!collection) {
            throw new Error('ContextPack collection not found')
        }
        const result = await collection.data.insert({
            properties: properties as unknown as Record<string, WeaviateField>,
        })
        return result
    } catch (error) {
        console.error('Error creating context pack:', error)
        return null
    }
}

/*
* Update an existing context pack
* @param id - The id of the context pack to update
* @param properties - The properties to update
* @returns void
*/
export const update = async (
    id: string,
    properties: Partial<ContextPack>,
): Promise<void> => {
    try {
        const collection = await getContextPackCollection()
        if (!collection) {
            throw new Error('ContextPack collection not found')
        }
        await collection.data.update({
            id,
            properties: properties as unknown as Record<string, WeaviateField>,
        })
    } catch (error) {
        console.error('Error updating context pack:', error)
    }
}
