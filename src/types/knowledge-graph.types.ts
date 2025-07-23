// Define types for our knowledge graph
export interface Person {
  id: string
  name: string
  type: string
  metadata: {
    data: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface File {
  id: string
  name: string
  type: string
  personId: string
  metadata: {
    data: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface Relationship {
  id: string
  source: string
  target: string
  type: string
  properties: {
    data: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface ContextPack {
  id: string
  userId: string
  name: string
  userRole: string
  goal: string
  subGoals: string[]
  person: string
  personRelationship: string
  participants: Array<{
    name: string
    role: string
    relationship_to_user: string
    apex_profile?: {
      risk_tolerance?: string
      decision_speed?: string
      key_motivators?: string[]
      recent_behavior?: string
    }
  }>
  documents: Array<{
    name: string
    file: string
    tags?: string[]
  }>
  contextDescription: string
  keyTopics: string[]
  notes: string
  timeline?: string[]
  conflictMap?: string
  environmentalFactors?: string
  createdAt: Date
  updatedAt: Date
}

export interface DocumentChunk {
  contextPackId: string
  chunkIndex: number
  id: string
  userId: string
  content: string
  metadata: {
    name: string
    file: string
    tags?: string[]
    chunkIndex: number
    totalChunks: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface Participant {
  name: string
  role: string
  relationship_to_user: string
  apex_profile?: {
    risk_tolerance?: string
    decision_speed?: string
    key_motivators?: string[]
    recent_behavior?: string
  }
}

export interface WeaviateGetContextPackResponse {
  id: string
  properties: {
    userId: string
    name: string
    userRole: string
    goal: string
    subGoals: string[]
    person: string
    personRelationship: string
    participants: Array<Participant>
    documents: Array<{
      name: string
      file: string
      tags?: string[]
    }>
    contextDescription: string
    keyTopics: string[]
    notes: string
    timeline?: string[]
    conflictMap?: string
    environmentalFactors?: string
    createdAt: string
    updatedAt: string
  }
}

export interface WeaviateGenericObject {
  class?: string
  creationTimeUnix?: number
  id?: string
  lastUpdateTimeUnix?: number
  properties?: { [key: string]: unknown }
  vectorWeights?: { [key: string]: unknown }
}

export interface WeaviateResponse {
  objects?: WeaviateGenericObject[]
}

export interface ProcessedDocument {
  id: string
  content: string
  metadata: {
    name: string
    file: string
    tags?: string[]
    chunkIndex: number
    totalChunks: number
  }
}
