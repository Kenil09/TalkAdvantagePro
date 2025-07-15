import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ZodSchema } from 'zod'

class LLM {
  llmModel: ChatOpenAI
  constructor() {
    this.llmModel = new ChatOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      model: 'openai/gpt-4o-mini',
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
      },
      temperature: 0.7,
      maxTokens: 2000,
    })
  }

  invoke = async (
    systemTemplate: string,
    userTemplate: string,
    context?: Record<string, unknown>,
    outputSchema?: ZodSchema,
  ) => {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', systemTemplate],
      ['user', userTemplate],
    ])

    const promptValue = await promptTemplate.invoke(context)

    let response

    if (outputSchema) {
      const structuredOutput = this.llmModel.withStructuredOutput(outputSchema)
      response = await structuredOutput.invoke(promptValue)
    } else {
      response = await this.llmModel.invoke(promptValue)
    }
    return response
  }
}

const llmModel = new LLM()

export default llmModel
