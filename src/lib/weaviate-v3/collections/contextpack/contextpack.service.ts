'use server'
import { WeaviateField } from 'weaviate-client'
import { getContextPackCollection } from './contextpack.schema'
import { ContextPack, ContextPackQueryResult } from './contextpack.types'

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
