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
