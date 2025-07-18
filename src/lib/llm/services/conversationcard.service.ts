'use server'

import LLM from "@/lib/llm"
import {
  CARD_UPDATE_PROMPT,
  INITIAL_CARD_GEN_PROMPT,
  SYSTEM_PROMPT,
  updatePromptSchema,
  systemPromptSchema,
} from '@/lib/llm/prompts/conversationcard.prompt'
import { ContextPrompt, ConversationCard } from '@/lib/store/recording.store'

// generate cards
export const generateConversationCards = async (contextPack: ContextPrompt, model: string) => {
  const llmModel = new LLM(model)
  const result = await llmModel.invoke(
    SYSTEM_PROMPT,
    INITIAL_CARD_GEN_PROMPT,
    contextPack,
    systemPromptSchema,
  )

  return result
}

// update cards
export const generateCardUpdate = async (
  context: ContextPrompt & {
    cards: ConversationCard[]
    liveTranscript: string
    currentActiveCard: string
    currentActiveCardState: string
  },
  model: string,
) => {
  const llmModel = new LLM(model)
  const result = await llmModel.invoke(
    SYSTEM_PROMPT,
    CARD_UPDATE_PROMPT,
    context,
    updatePromptSchema,
  )

  return result
}
