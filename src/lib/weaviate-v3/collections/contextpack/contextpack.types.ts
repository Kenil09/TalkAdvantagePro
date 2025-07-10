import { Metadata, Vectors } from "weaviate-client";

export interface ContextPack {
    userId: string;
    name: string;
    userRole: string;
    goal: string;
    subGoals: string[];
    person: string;
    personRelationship: string;
    participants: Participant[];
    documents: Document[];
    contextDescription: string;
    keyTopics: string[];
    notes: string;
    timeline: string;
    conflictMap: string;
    environmentalFactors: string;
    createdAt: string;
    updatedAt: string;
}

export interface Participant {
  name: string;
  role: string;
  relationship_to_user: string;
  apex_profile: ApexProfile;
}

export interface ApexProfile {
    risk_tolerance: string;
    decision_speed: string;
    key_motivators: string[];
    recent_behavior: string;
}

export interface Document {
  name: string;
  file: string;
  type: string;
  tags: string;
}

export interface ContextPackQueryResult {
    metadata: Partial<Metadata> | undefined;
    properties: ContextPack;
    uuid: string;
    vectors: Vectors;
}