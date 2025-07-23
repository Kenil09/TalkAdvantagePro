export interface Participant {
  id: string
  name: string
  role: string
  relationship: string
}

export interface StrategicObjectives {
  mainGoal: string
  subGoals: string[]
}

export interface Document {
  id: string
  name: string
  file: string
  type: string
  tags: string
}

export interface PreInteractionNotes {
  description: string
  keyTopics: KeyTopic[]
  additionalNotes: string
}

export interface TimelineContext {
  timelineItems: TimelineItem[]
  alliancesRivalries: string
  contextFactors: string
}

interface KeyTopic {
  id: string
  topic: string
}

interface TimelineItem {
  id: string
  item: string
}

export interface FormValues {
  name: string
  description: string
  userInfo: {
    name: string
    role: string
    nonUser: string
    prospect: string
  }
  participants: Participant[]
  strategicObjectives: StrategicObjectives
  documents: Document[]
  timeline: string
  context: string
  preInteractionNotes: PreInteractionNotes
  timelineContext: TimelineContext
}

export interface ContextPackProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  existingPack?: Partial<FormValues>
  onSave?: (data: FormValues) => void
  isEditContextPack: { status: boolean; uuid: string }
  setIsEditContextPack: (value: { status: boolean; uuid: string }) => void
}

export interface ContextPack {
  id: string
  name: string
  participants: { name: string; role: string }[]
  documents: unknown[]
  mainGoal: string
  timeline: string
  lastUsed: string
}

export interface AnalyticsProfileFormData {
  profileName: string
  description: string
  aiModel: string
  conversationMode: string
  userPrompt: string
  systemPrompt: string
  templatePrompt: string
  curiosityEnginePrompt: string
  defaultLayout: string
  colorScheme: string
  maxTokens?: number
  temperature?: number
}
