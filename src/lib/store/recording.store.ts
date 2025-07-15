import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateConversationCards } from "../llm/services/conversationcard.service";

export interface CardContent {
    paragraph: string;
    bullets: string[];
    expansion: string;
}

export interface ConversationCard {
    id: string;
    topic: string;
    hotlinks: string[];
    content: CardContent;
    state: 'base' | 'growing' | 'elongated' | 'split';
    position: string;
    visible: boolean;
}

export interface ContextPrompt extends Record<string, unknown> {
    user_name: string;
    person: string;
    person_relationship: string;
    goal: string;
    goal_secondary: string;
    document_context?: string;
    specificity_level: 'low' | 'medium' | 'high';
    date: string;
}

export interface ResponseCard {
    cards: {
        topic: string;
        hotlinks: string[];
        content: {
            paragraph: string;
            bullets: string[];
            expansion: string;
        };
        position: string;
    }[];
}
interface RecordingStore {
    isLoading: boolean;
    error: string | null;
    conversationCards: ConversationCard[];

    // Actions
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setConversationCards: (cards: ConversationCard[]) => void;

    // Async actions
    fetchConversationCards: (context: ContextPrompt) => Promise<ConversationCard[] | undefined>;
}

export const useRecordingStore = create<RecordingStore>()(
    persist(
        (set, get) => ({
            isLoading: false,
            error: null,
            conversationCards: [],

            setIsLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            setConversationCards: (cards) => set({ conversationCards: cards }),

            fetchConversationCards: async (context) => {
                const { setError, setIsLoading } = get();

                setIsLoading(true);
                setError(null);

                try {
                    const rawResponse = await generateConversationCards(context);
                    set({ conversationCards: rawResponse.cards || [] });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to generate conversation cards';
                    console.error('Error in fetchConversationCards:', error);
                    setError(errorMessage);
                    return undefined;
                } finally {
                    setIsLoading(false);
                }
            }
        }),
        {
            name: 'recording-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ conversationCards: state.conversationCards }),
        }
    )
);
