'use server'

import LLM from '@/lib/llm'
import { SYSTEM_PROMPT, USER_PROMPT } from '@/lib/llm/prompts/chatbot.prompt'

export const generateChatBotService = async (
  context: Record<string, unknown>,
  model: string,
): Promise<string> => {
  const llmModel = new LLM(model)
  const result = await llmModel.invoke(SYSTEM_PROMPT, USER_PROMPT, context)
  return result.content
}
