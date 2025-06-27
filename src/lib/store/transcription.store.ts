import { create } from "zustand";

//TODO: add types
export const useTranscriptionStore = create((set) => ({
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
