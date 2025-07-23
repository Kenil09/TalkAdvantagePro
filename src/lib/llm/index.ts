import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ZodSchema } from 'zod'

class LLM {
  llmModel: ChatOpenAI
  constructor(model: string) {
    this.llmModel = new ChatOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      model: model || 'deepseek/deepseek-r1-0528:free',
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
    outputSchema?: ZodSchema | Record<string, unknown>,
  ) => {
    try {
      const promptTemplate = ChatPromptTemplate.fromMessages([
        ['system', systemTemplate],
        ['user', userTemplate],
      ])

      const promptValue = await promptTemplate.invoke(context)

      let response

      if (outputSchema) {
        const structuredOutput =
          this.llmModel.withStructuredOutput(outputSchema)
        response = await structuredOutput.invoke(promptValue)
      } else {
        response = await this.llmModel.invoke(promptValue)
      }
      return response
    } catch (error) {
      console.error('Error in LLM.invoke:', JSON.stringify(error, null, 2))
      return null
    }
  }
}

export default LLM
