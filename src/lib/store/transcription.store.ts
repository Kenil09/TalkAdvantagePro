import { create } from 'zustand'
import { format } from 'date-fns'
import {
  TranscriptionStore,
  TranscriptEntry,
  WordDetectionResult,
} from '@/types/transcription.types'
import { DATABASE_TABLE, TRANSCRIPTION_TIME_WINDOW } from '@/config'
import { createClient } from '../supabase/client'

export const useTranscriptionStore = create<TranscriptionStore>((set, get) => ({
  isConnecting: false,
  setIsConnecting: (connecting) => set({ isConnecting: connecting }),

  isTranscribing: false,
  setIsTranscribing: (transcribing) => set({ isTranscribing: transcribing }),

  liveText: '',
  setLiveText: (textOrFn) =>
    set((state) => ({
      liveText:
        typeof textOrFn === 'function' ? textOrFn(state.liveText) : textOrFn,
    })),

  transcriptHistory: [],

  addTranscriptEntry: (entry: TranscriptEntry) => {
    const updated = [...get().transcriptHistory, entry]
    set({ transcriptHistory: updated })
  },

  getLastFewMinTranscript: () => {
    const now = Date.now()
    return get()
      .transcriptHistory.filter(
        (e) => e.timestamp >= now - TRANSCRIPTION_TIME_WINDOW,
      )
      .map((e) => e.text)
      .join(' ')
  },

  detectWords: (
    wordsToDetect: string[],
    transcript?: string,
  ): WordDetectionResult => {
    // Use provided transcript if available, otherwise get from store
    let textToSearch = transcript

    if (typeof transcript !== 'string') {
      // Get the current transcript text (either live text or recent history)
      const liveText = get().liveText
      textToSearch = liveText
    }

    // Initialize result
    const result: WordDetectionResult = {
      matchCount: 0,
      matchedWords: [],
    }

    // Return early if no text to search or no words to detect
    if (!textToSearch || !wordsToDetect.length) {
      return result
    }

    // Check each word in the array
    wordsToDetect.forEach((word) => {
      // Create case-insensitive regex with word boundary
      const regex = new RegExp(`\\b${word}\\b`, 'gi')

      let match
      while ((match = regex.exec(textToSearch as string)) !== null) {
        result.matchCount++
        result.matchedWords.push({
          word,
          index: match.index,
        })
      }
    })

    return result
  },

  uploadRecording: async (
    uploadData: {
      user_id?: string
      transcript: string
      tags: string
      duration: number
    },
    blob: Blob,
  ) => {
    const supabase = createClient()
    try {
      // Step 1: Generate filename
      const now = new Date()
      const filename = format(now, 'yyMMdd__HHmm') + '.mp3'
      const path = 'recordings'
      const filepath = `${path}/${filename}`
      const contentType = blob.type || 'audio/mpeg'
      // Step 2: Get presigned URL from backend
      const response = await fetch('/api/upload-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, path, contentType }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get presigned URL')
      }
      // Step 3: Get presigned URL from backend
      const { url } = await response.json()

      // Step 4: Upload file to Cloudflare R2 using PUT
      const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: blob,
      })

      if (!uploadRes.ok) {
        throw new Error(`Upload failed with status ${uploadRes.status}`)
      }

      // Step 5: insert into supabase
      const { error } = await supabase.from(DATABASE_TABLE.RECORDINGS).insert({
        ...uploadData,
        filename: filename,
        filepath: filepath,
        recording_date: now,
        recording_time: format(now, 'HH:mm:ss'),
        duration: uploadData.duration,
      })

      if (error) {
        throw new Error(error.message)
      }

      return {
        success: true,
        filename: filename,
        path: filepath,
      }
    } catch (error) {
      console.error('Recording upload failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
}))
