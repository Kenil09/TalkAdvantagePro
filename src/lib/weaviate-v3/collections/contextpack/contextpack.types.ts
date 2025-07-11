import { Metadata, Vectors } from "weaviate-client";

export interface ContextPack {
    userId: string;
    contextPackDetails: ContextPackDetails;
    name: string;
    userRole: string;
    nonUserName: string;
    clientName: string;
    preInteraction: PreInteraction;
    participants: Participant[];
    goal: string;
    subGoals: string[];
    documents: Document[];
    timeline: string[];
    preInteractionNotes: string;
    contextFactors: string;
}

export type ContextPackForm = Omit<ContextPack, 'id'>
export interface ContextPackDetails {
    name: string;
    duration: string;
    description: string;
}

export interface PreInteraction {
    description: string;
    keyTopics: string[];
    notes: string;
}

export interface Participant {
  name: string;
  role: string;
  relationship_to_user: string;
  apex_profile?: ApexProfile;
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
  tags: string[];
}

export interface ContextPackQueryResult {
    metadata: Partial<Metadata> | undefined;
    properties: ContextPack;
    uuid: string;
    vectors: Vectors;
}