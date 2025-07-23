import { z } from 'zod'

export const conversationCardsSchema = z.object({
  opening: z.string(),
  cards: z.array(
    z.object({
      topic: z.string(),
      hotlinks: z.array(z.string()),
      content: z.object({
        paragraph: z.string(),
        bullets: z.array(z.string()),
        expansion: z.string(),
      }),
      visible: z.boolean().default(true),
      triggerCount: z.number().default(0),
      state: z.enum(['base', 'growing', 'elongated', 'split']),
      position: z.enum(['start', 'middle', 'end']),
    }),
  ),
})

export type ConversationCardsSchema = z.infer<typeof conversationCardsSchema>
