export interface TranscriptionStore {
  isConnecting: boolean;
  setIsConnecting: (connecting: boolean) => void;
  isTranscribing: boolean;
  setIsTranscribing: (transcribing: boolean) => void;
  liveText: string;
  setLiveText: (textOrFn: string | ((prevText: string) => string)) => void;
}
