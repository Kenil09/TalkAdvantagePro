export interface TranscriptEntry {
  text: string
  timestamp: number
}

export interface WordDetectionResult {
  matchCount: number
  matchedWords: Array<{
    word: string
    index: number
  }>
}

export interface TranscriptionStore {
  isConnecting: boolean
  setIsConnecting: (connecting: boolean) => void

  isTranscribing: boolean
  setIsTranscribing: (transcribing: boolean) => void

  liveText: string
  setLiveText: (textOrFn: string | ((prevText: string) => string)) => void

  transcriptHistory: TranscriptEntry[]
  addTranscriptEntry: (entry: TranscriptEntry) => void

  getLastFewMinTranscript: () => string
  detectWords: (
    wordsToDetect: string[],
    transcript?: string,
  ) => WordDetectionResult
  uploadRecording: (
    uploadData: {
      user_id?: string
      tags: string
      transcript: string
      duration: number
    },
    blob: Blob,
  ) => Promise<
    | { success: true; filename: string; path: string }
    | { success: false; error: string }
  >
}
