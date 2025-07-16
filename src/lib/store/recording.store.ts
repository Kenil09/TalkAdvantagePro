import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { generateConversationCards, generateCardUpdate } from '../llm/services/conversationcard.service'
import { useContextPackStore } from "./context-pack.store"
import { useTranscriptionStore } from "./transcription.store"

export interface CardContent {
  paragraph: string
  bullets: string[]
  expansion: string
}

export interface ConversationCard {
  id: string
  topic: string
  hotlinks: string[]
  content: CardContent
  state: 'base' | 'growing' | 'elongated' | 'split'
  position: string
  visible: boolean
  triggerCount: number
}

export interface ContextPrompt extends Record<string, unknown> {
  user_name: string | null
  person: string | null
  person_relationship: string | null
  goal: string | null
  goal_secondary: string | null
  document_context?: string | null
  specificity_level: 'low' | 'medium' | 'high'
  date: string
}

export interface ResponseCard {
  cards: {
    topic: string
    hotlinks: string[]
    content: {
      paragraph: string
      bullets: string[]
      expansion: string
    }
    position: string
  }[]
}

export type ModelKey =
  | 'chatbotSelectedModel'
  | 'conversationCardsSelectedModel'
  | 'meetingNotesSelectedModel'

interface RecordingStore {
  isLoading: boolean
  error: string | null
  conversationCards: ConversationCard[]
  startWord: string
  endWord: string
  aiPersonalityName: string
  systemPrompt: string
  models: string[]
  chatbotSelectedModel: string
  conversationCardsSelectedModel: string
  meetingNotesSelectedModel: string

  // Actions
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setConversationCards: (cards: ConversationCard[]) => void
  setModels: (models: string[]) => void
  setSelectedModel: (key: ModelKey, model: string) => void
  setStartWord: (startWord: string) => void
  setEndWord: (endWord: string) => void
  setAiPersonalityName: (aiPersonalityName: string) => void
  setSystemPrompt: (systemPrompt: string) => void

  // Async actions
  fetchConversationCards: () => Promise<ConversationCard[] | undefined>
  updateConversationCards: (currentActiveCard: { id: string; state: string } | null) => void
  fetchModels: () => Promise<void>
}

export const useRecordingStore = create<RecordingStore>()(
  persist(
    (set, get) => ({
      isLoading: false,
      error: null,
      conversationCards: [],

      // chatbot
      startWord: 'Alexa',
      endWord: 'Done',
      aiPersonalityName: 'Nova',
      systemPrompt:
        "You are a helpful AI assistant. Provide clear, concise answers to the user's questions.",
      models: [],
      chatbotSelectedModel: '',
      conversationCardsSelectedModel: '',
      meetingNotesSelectedModel: '',

      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setConversationCards: (cards) => set({ conversationCards: cards }),

      setStartWord: (startWord: string) => set({ startWord }),

      setEndWord: (endWord: string) => set({ endWord }),

      setSelectedModel: (key: ModelKey, model: string) =>
        set((state) => ({
          ...state,
          [key]: model,
        })),

      updateConversationCards: async (currentActiveCard: { id: string; state: string } | null) => {
        const { currentContextPack } = useContextPackStore.getState()
        const { liveText } = useTranscriptionStore.getState()
        const cards = await generateCardUpdate({
          user_name: currentContextPack?.properties?.name ?? '',
          person: currentContextPack?.properties?.nonUserName ?? '',
          person_relationship: 'client',
          goal: currentContextPack?.properties?.goal ?? '',
          goal_secondary: currentContextPack?.properties?.subGoals?.[0] ?? '',
          document_context:
            currentContextPack?.properties?.contextFactors ?? '',
          specificity_level: 'medium',
          date: new Date().toISOString().split('T')[0],
          cards: get().conversationCards,
          liveTranscript: liveText,
          currentActiveCard: currentActiveCard?.id || '',
          currentActiveCardState: currentActiveCard?.state || '',
        })
        set({ conversationCards: cards.updated_cards })
      },

      setModels: (models: string[]) => set({ models }),

      setAiPersonalityName: (aiPersonalityName: string) =>
        set({ aiPersonalityName }),

      setSystemPrompt: (systemPrompt: string) => set({ systemPrompt }),

      fetchConversationCards: async () => {
        const { setError, setIsLoading } = get()
        const { currentContextPack } = useContextPackStore.getState()

        const context: ContextPrompt = {
          user_name: currentContextPack?.properties?.name ?? '',
          person: currentContextPack?.properties?.nonUserName ?? '',
          person_relationship:
            currentContextPack?.properties?.participants[0]
              .relationship_to_user ?? '',
          goal: currentContextPack?.properties?.goal ?? '',
          goal_secondary:
            currentContextPack?.properties?.subGoals.join(',') ?? '',
          specificity_level: 'medium',
          date: new Date().toISOString(),
          document_context: '',
        }

        setIsLoading(true)
        setError(null)

        try {
          const rawResponse = await generateConversationCards(context)
          const cards = rawResponse.cards.map(
            (card: ConversationCard, index: number) => ({
              ...card,
              id: index.toString(),
            }),
          )
          set({ conversationCards: cards })
          return cards
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to generate conversation cards'
          console.error('Error in fetchConversationCards:', error)
          setError(errorMessage)
          return undefined
        } finally {
          setIsLoading(false)
        }
      },

      fetchModels: async () => {
        try {
          const response = await fetch('/api/models')

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to fetch models')
          }

          const data = await response.json()

          const uniqueSlugs = Array.from(
            new Set(data.data.map((model: { slug: string }) => model.slug)),
          )

          set({ models: uniqueSlugs as string[] })
        } catch (error) {
          console.error('Failed to fetch models:', error)
        }
      },
    }),
    {
      name: 'recording-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversationCards: state.conversationCards,
        models: state.models,
        aiPersonalityName: state.aiPersonalityName,
        systemPrompt: state.systemPrompt,
        startWord: state.startWord,
        endWord: state.endWord,
        chatbotSelectedModel: state.chatbotSelectedModel,
        conversationCardsSelectedModel: state.conversationCardsSelectedModel,
        meetingNotesSelectedModel: state.meetingNotesSelectedModel,
      }),
    },
  ),
)
