import { AUDIO_RECORDING_STATE } from "../constants/audio-recording.constants";

export type AudioRecordingState = keyof typeof AUDIO_RECORDING_STATE;

export interface AudioRecordingStore {
  recordingState: AudioRecordingState;
  setRecordingState: (state: AudioRecordingState) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  mediaRecorder: MediaRecorder | null;
  setMediaRecorder: (recorder: MediaRecorder | null) => void;
  audioChunks: Blob[];
  setAudioChunks: (chunks: Blob[]) => void;
}
