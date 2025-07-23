'use server'

import LLM from '@/lib/llm'
import {
  SYSTEM_PROMPT,
  USER_PROMPT,
  tiptapSchema,
} from '@/lib/llm/prompts/meetingnotes.prompt'
import { Content } from '@tiptap/react'

export const generateMeetingNotesService = async (
  contextPack: Record<string, unknown>,
  model: string,
): Promise<Content> => {
  const llmModel = new LLM(model)
  const result = await llmModel.invoke(
    SYSTEM_PROMPT,
    USER_PROMPT,
    contextPack,
    tiptapSchema,
  )
  return result
}
