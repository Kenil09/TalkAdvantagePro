import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ContextPackQueryResult } from "@/lib/weaviate-v3/collections/contextpack";
import * as ContextPackService from "@/lib/weaviate-v3/collections/contextpack/contextpack.service";

interface ContextPackStore {
  // State
  contextPacks: ContextPackQueryResult[];
  currentContextPack: ContextPackQueryResult | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setContextPacks: (contextPacks: ContextPackQueryResult[]) => void;
  setCurrentContextPack: (contextPack: ContextPackQueryResult | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  fetchContextPacks: (userId: string) => Promise<void>;
  fetchContextPackById: (id: string) => Promise<void>;
}

export const useContextPackStore = create<ContextPackStore>()(persist(
  (set, get) => ({
  // Initial state
  contextPacks: [],
  currentContextPack: null,
  isLoading: false,
  error: null,

  // Actions
  setContextPacks: (contextPacks: ContextPackQueryResult[]) => 
    set({ contextPacks }),
  
  setCurrentContextPack: (contextPack: ContextPackQueryResult | null) => 
    set({ currentContextPack: contextPack }),
    
  
  setIsLoading: (isLoading: boolean) => 
    set({ isLoading }),
  
  setError: (error: string | null) => 
    set({ error }),

  // Async actions
  fetchContextPacks: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const contextPacks = await ContextPackService.get('userId', userId);
      
      set({ 
        contextPacks,
        isLoading: false,
      });
      
      // If there's at least one context pack
      if (contextPacks.length > 0) {
        const state = get();
        // If no current selection, set the first one as current by default
        if (!state.currentContextPack) {
          set({ currentContextPack: contextPacks[0] });
        } else {
          // Check if the current context pack exists in the fetched list
          const currentPackExists = contextPacks.some(
            pack => pack.uuid === state.currentContextPack?.uuid
          );
          
          // If not, default to the first context pack
          if (!currentPackExists) {
            set({ currentContextPack: contextPacks[0] });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching context packs:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch context packs",
        isLoading: false 
      });
    }
  },

  fetchContextPackById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const contextPack = await ContextPackService.getById(id);
      if (contextPack) {
        set({ currentContextPack: contextPack, isLoading: false });
      } else {
        set({ 
          error: `Context pack with id ${id} not found`,
          isLoading: false 
        });
      }
    } catch (error) {
      console.error("Error fetching context pack by id:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch context pack",
        isLoading: false 
      });
    }
  },
  }),
  {
    name: "context-pack-storage",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ currentContextPack: state.currentContextPack }),
  }
));
