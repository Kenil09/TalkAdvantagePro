import { AnalyticsProfileFormData } from '@/types/contextPack'

export const documentTypes = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'docx', label: 'Word Document' },
  { value: 'xlsx', label: 'Excel Spreadsheet' },
  { value: 'pptx', label: 'PowerPoint Presentation' },
  { value: 'txt', label: 'Text File' },
  { value: 'other', label: 'Other' },
] as const

export const existingProfile: AnalyticsProfileFormData = {
  profileName: 'New Analytics Profile',
  description: 'New Analytics Profile',
  aiModel: 'Mistral 7B Instruct (Free)',
  conversationMode: 'Tracking (Passive)',
  userPrompt: 'Analyze the transcript to provide insights.',
  systemPrompt: `You are an AI assistant specializing in conversation analysis. Your role is to:
1. Extract key information from transcripts
2. Identify important points, decisions, and action items
3. Provide clear, concise analysis
4. Organize information in a structured format
5. Maintain a professional communication style`,
  templatePrompt: 'Please analyze the following transcript:',
  curiosityEnginePrompt: `You are an expert active listener analyzing meeting transcripts.
Generate 2-3 insightful questions that would help understand the context better.

[QUESTION TYPES - DO NOT MODIFY THESE TYPES]
Question types:
- YES_NO: Simple yes/no questions
- MULTIPLE_CHOICE: Questions with predefined options (provide 3-4 choices)
- MULTIPLE_CHOICE_FILL: Multiple choice with an "other" option (provide 3-4 choices)
- SPEAKER_IDENTIFICATION: Questions about who said specific statements`,
  defaultLayout: 'radial',
  colorScheme: 'Default',
  maxTokens: 1000,
  temperature: 0.7,
}
