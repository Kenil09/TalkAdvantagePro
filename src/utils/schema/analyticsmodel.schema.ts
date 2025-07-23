import { z } from 'zod'

export const analyticsProfileSchema = z.object({
  profileName: z.string().min(1, 'Profile name is required'),
  description: z.string().min(1, 'Description is required'),
  aiModel: z.string().min(1, 'AI model is required'),
  conversationMode: z.string().min(1, 'Conversation mode is required'),
  userPrompt: z.string().min(1, 'User prompt is required'),
  systemPrompt: z.string().min(1, 'System prompt is required'),
  templatePrompt: z.string().min(1, 'Template prompt is required'),
  curiosityEnginePrompt: z
    .string()
    .min(1, 'Curiosity engine prompt is required'),
  defaultLayout: z.string().optional(),
  colorScheme: z.string().optional(),
  maxTokens: z.number().min(1).max(4000),
  temperature: z.number().min(0).max(1),
})

export type AnalyticsProfileFormDataSchema = z.infer<
  typeof analyticsProfileSchema
>
