import { create } from "zustand";
import { TranscriptionStore } from "@/types/transcription.types";

export const useTranscriptionStore = create<TranscriptionStore>((set) => ({
  isConnecting: false,
  setIsConnecting: (connecting: boolean) => set({ isConnecting: connecting }),
  isTranscribing: false,
  setIsTranscribing: (transcribing: boolean) =>
    set({ isTranscribing: transcribing }),
  liveText: "",
  setLiveText: (textOrFn: string | ((prevText: string) => string)) =>
    set((state) => ({
      liveText:
        typeof textOrFn === "function" ? textOrFn(state.liveText) : textOrFn,
    })),
}));
