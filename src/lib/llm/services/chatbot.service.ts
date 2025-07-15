'use server'

import llmModel from '@/lib/llm'
import { SYSTEM_PROMPT, USER_PROMPT } from '@/lib/llm/prompts/chatbot.prompt'

export const generateChatBotService = async (
    context: Record<string, unknown>
): Promise<string> => {
    const result = await llmModel.invoke(
        SYSTEM_PROMPT,
        USER_PROMPT,
        context,
    )
    return result.content;
}