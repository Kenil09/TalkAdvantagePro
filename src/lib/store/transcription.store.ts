import { create } from "zustand";
import {
  TranscriptionStore,
  TranscriptEntry,
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
    const now = Date.now();
    const updated = [...get().transcriptHistory, entry].filter(
      (e) => e.timestamp >= now - TRANSCRIPTION_TIME_WINDOW
    );
    set({ transcriptHistory: updated });
  },

  getLastFewMinTranscript: () => {
    const now = Date.now();
    return get()
      .transcriptHistory.filter((e) => e.timestamp >= now - TRANSCRIPTION_TIME_WINDOW)
      .map((e) => e.text)
      .join(" ");
  },
}));
