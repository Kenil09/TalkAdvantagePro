import { create } from "zustand";
import {
  AudioRecordingState,
  AudioRecordingStore,
} from "@/types/audio-recording.types";

export const useAudioRecordingStore = create<AudioRecordingStore>((set) => ({
  recordingState: "idle",
  setRecordingState: (state: AudioRecordingState) =>
    set({ recordingState: state }),
  isMuted: false,
  setIsMuted: (muted: boolean) => set({ isMuted: muted }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  mediaRecorder: null,
  setMediaRecorder: (recorder: MediaRecorder | null) =>
    set({ mediaRecorder: recorder }),
  audioChunks: [],
  setAudioChunks: (chunks: Blob[] | ((prev: Blob[]) => Blob[])) => 
    set((state) => ({ 
      audioChunks: typeof chunks === 'function' ? chunks(state.audioChunks) : chunks 
    })),
}));
