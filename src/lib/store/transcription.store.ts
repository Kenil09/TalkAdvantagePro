import { create } from "zustand";
import {
  TranscriptionStore,
  TranscriptEntry,
  WordDetectionResult,
} from "@/types/transcription.types";
import { TRANSCRIPTION_TIME_WINDOW } from "@/config";

export const useTranscriptionStore = create<TranscriptionStore>((set, get) => ({
  isConnecting: false,
  setIsConnecting: (connecting) => set({ isConnecting: connecting }),

  isTranscribing: false,
  setIsTranscribing: (transcribing) => set({ isTranscribing: transcribing }),

  liveText: "",
  setLiveText: (textOrFn) =>
    set((state) => ({
      liveText:
        typeof textOrFn === "function" ? textOrFn(state.liveText) : textOrFn,
    })),

  transcriptHistory: [],

  addTranscriptEntry: (entry: TranscriptEntry) => {
    const updated = [...get().transcriptHistory, entry]
    set({ transcriptHistory: updated });
  },

  getLastFewMinTranscript: () => {
    const now = Date.now();
    return get()
      .transcriptHistory.filter((e) => e.timestamp >= now - TRANSCRIPTION_TIME_WINDOW)
      .map((e) => e.text)
      .join(" ");
  },

  detectWords: (wordsToDetect: string[], transcript?: string): WordDetectionResult => {
    // Use provided transcript if available, otherwise get from store
    let textToSearch = transcript;
    
    if (typeof transcript !== 'string') {
      // Get the current transcript text (either live text or recent history)
      const liveText = get().liveText;
      textToSearch = liveText;
    }
    
    // Initialize result
    const result: WordDetectionResult = {
      matchCount: 0,
      matchedWords: [],
    };
    
    // Return early if no text to search or no words to detect
    if (!textToSearch || !wordsToDetect.length) {
      return result;
    }
    
    // Check each word in the array
    wordsToDetect.forEach(word => {
      // Create a regex to match whole words case-insensitively
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      
      if (regex.test(textToSearch)) {
        result.matchCount++;
        result.matchedWords.push(word);
      }
    });
    
    return result;
  },
}));
