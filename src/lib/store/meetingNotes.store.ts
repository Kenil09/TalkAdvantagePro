import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { generateMeetingNotesService } from '../llm/services/meetingNotes.service'
import { Content } from '@tiptap/react'

interface RecordingStore {
  isLoading: boolean
  error: string | null
  meetingNotes: Content | null

  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setMeetingNotes: (notes: Content | null) => void
  fetchMeetingNotes: (context: Record<string, unknown>) => Promise<void>
}

export const useMeetingNotesStore = create<RecordingStore>()(
  persist(
    (set, get) => ({
      isLoading: false,
      error: null,
      meetingNotes: null,
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setMeetingNotes: (meetingNotes) => set({ meetingNotes }),
      fetchMeetingNotes: async (context) => {
        const { setError, setIsLoading, setMeetingNotes } = get()

        setIsLoading(true)
        setError(null)

        try {
          const response = await generateMeetingNotesService(
            context,
          )

          // Ensure the response matches the expected MeetingNotesContextPack type
          setMeetingNotes(response)
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to generate meeting notes'
          console.error('fetchMeetingNotes:', message)
          setError(message)
        } finally {
          setIsLoading(false)
        }
      },
    }),
    {
      name: 'meeting-notes-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ meetingNotes: state.meetingNotes }),
    },
  ),
)
