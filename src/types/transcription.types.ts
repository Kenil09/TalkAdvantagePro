export interface TranscriptEntry {
  text: string;
  timestamp: number;
}

export interface WordDetectionResult {
  matchCount: number;
  matchedWords: string[];
}

export interface TranscriptionStore {
  isConnecting: boolean;
  setIsConnecting: (connecting: boolean) => void;

  isTranscribing: boolean;
  setIsTranscribing: (transcribing: boolean) => void;

  liveText: string;
  setLiveText: (textOrFn: string | ((prevText: string) => string)) => void;

  transcriptHistory: TranscriptEntry[];
  addTranscriptEntry: (entry: TranscriptEntry) => void;

  getLastFewMinTranscript: () => string;
  detectWords: (wordsToDetect: string[]) => WordDetectionResult;
}

