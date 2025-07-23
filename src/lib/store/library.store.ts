import { create } from 'zustand'
import { type DateRange } from "react-day-picker"
import { persist, createJSONStorage } from 'zustand/middleware'
import { Recording, Tag } from '@/types/library.types'
import { getCurrentWeek } from "@/utils/date"

type SearchType = 'transcript' | 'tags'
export type RecordingStatus = 'all' | 'processed' | 'processing' | 'failed' | 'holiday'

interface LibraryStore {
  // State
  filterStatus: RecordingStatus
  isLoading: boolean
  error: string | null
  searchQuery: string
  searchType: SearchType
  transcriptPreviews: Record<string, string>
  transcriptSearchResults: Record<string, boolean>
  recordings: Recording[]
  showDeleteDialog: boolean
  activeTagFilters: Tag[]
  selectedRecording: Recording | null
  selectedRecordings: Set<string>
  viewMode: 'calendar' | 'heatmap' | 'list' | 'grid'
  dateRange: DateRange | undefined
  selectedDate: Date | null
  durationUnit: 'minutes' | 'hours' | 'seconds'
  durationRange: { min: string; max: string }
  audioUrl: string | null
  recordingToRename: Recording | null
  showRenameDialog: boolean
  isFetchingSummary: Record<string, boolean>
  transcriptSummaries: Record<string, string>
  transcriptMetadata: Record<
    string,
    {
      duration?: string
      speakers?: number
      sentiment?: string
      meta?: string
    }
  >
  expandedAnalysis: Record<string, boolean>
  currentWeek: number
  isWeekView: boolean
  selectedHourRecordings: Recording[]
  selectedHourInfo: { day: string; hour: number } | null
  currentMonth: Date
  showTranscriptDialog: boolean
  currentTranscript: string | null
  isLoadingTranscript: boolean
  currentTranscriptTitle: string
  sortBy: 'date' | 'filename' | 'duration'
  sortOrder: 'asc' | 'desc'
  expandedRecordings: Record<string, boolean>
  transcriptSearchModel: boolean

  // Actions
  setTranscriptSearchModel: (transcriptSearchModel: boolean) => void
  setShowRenameDialog: (showRenameDialog: boolean) => void
  setRecordingToRename: (recordingToRename: Recording | null) => void
  setAudioUrl: (audioUrl: string | null) => void
  setSelectedRecording: (selectedRecording: Recording | null) => void
  setFilterStatus: (filterStatus: RecordingStatus) => void
  setDurationRange: (
    updater:
      | { min: string; max: string }
      | ((prev: { min: string; max: string }) => { min: string; max: string }),
  ) => void
  setDurationUnit: (durationUnit: 'minutes' | 'hours' | 'seconds') => void
  setSelectedDate: (selectedDate: Date | null) => void
  setDateRange: (dateRange: DateRange | undefined) => void
  setViewMode: (viewMode: 'calendar' | 'heatmap' | 'list' | 'grid') => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (searchQuery: string) => void
  setSearchType: (searchType: SearchType) => void
  setTranscriptPreviews: (transcriptPreviews: Record<string, string>) => void
  setTranscriptSearchResults: (
    transcriptSearchResults: Record<string, boolean>,
  ) => void
  setShowDeleteDialog: (showDeleteDialog: boolean) => void
  setRecordings: (
    updater: Recording[] | ((prev: Recording[]) => Recording[]),
  ) => void
  setActiveTagFilters: (updater: Tag[] | ((prev: Tag[]) => Tag[])) => void
  setSelectedRecordings: (
    updater: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => void

  setIsFetchingSummary: (isFetchingSummary: Record<string, boolean>) => void
  setTranscriptSummaries: (transcriptSummaries: Record<string, string>) => void
  setTranscriptMetadata: (
    transcriptMetadata: Record<
      string,
      {
        duration?: string
        speakers?: number
        sentiment?: string
        meta?: string
      }
    >,
  ) => void

  setExpandedAnalysis: (expandedAnalysis: Record<string, boolean>) => void
  setCurrentWeek: (currentWeek: number) => void
  setIsWeekView: (isWeekView: boolean) => void
  setSelectedHourRecordings: (selectedHourRecordings: Recording[]) => void
  setSelectedHourInfo: (
    selectedHourInfo: { day: string; hour: number } | null,
  ) => void
  setCurrentMonth: (updater: Date | ((prev: Date) => Date)) => void
  setShowTranscriptDialog: (showTranscriptDialog: boolean) => void
  setCurrentTranscript: (currentTranscript: string | null) => void
  setIsLoadingTranscript: (isLoadingTranscript: boolean) => void
  setCurrentTranscriptTitle: (currentTranscriptTitle: string) => void
  setSortBy: (sortBy: 'filename' | 'date' | 'duration') => void
  setSortOrder: (sortOrder: 'asc' | 'desc') => void
  setExpandedRecordings: (expandedRecordings: Record<string, boolean>) => void

  // Audio actions
  loadAudioUrl: () => Promise<void>
  // Helpers
  getLongestRecording: () => { duration: number; date: Date | null }
  getShortestRecording: () => { duration: number; date: Date | null }

}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      // Initial state
      filterStatus: 'all',
      isLoading: false,
      error: null,
      searchQuery: '',
      searchType: 'transcript',
      transcriptPreviews: {},
      transcriptSearchResults: {},
      recordings: [],
      showDeleteDialog: false,
      activeTagFilters: [],
      selectedRecordings: new Set(),
      viewMode: 'calendar',
      dateRange: undefined,
      selectedDate: null,
      durationUnit: 'minutes',
      durationRange: { min: '', max: '' },
      selectedRecording: null,
      audioUrl: null,
      recordingToRename: null,
      showRenameDialog: false,
      isFetchingSummary: {},
      transcriptSummaries: {},
      transcriptMetadata: {},
      expandedAnalysis: {},
      currentWeek: getCurrentWeek(),
      isWeekView: false,
      selectedHourRecordings: [],
      selectedHourInfo: null,
      currentMonth: new Date(),
      showTranscriptDialog: false,
      currentTranscript: null,
      isLoadingTranscript: false,
      currentTranscriptTitle: '',
      sortBy: 'date',
      sortOrder: 'desc',
      expandedRecordings: {},
      transcriptSearchModel: false,
      // Actions
      setTranscriptSearchModel: (transcriptSearchModel: boolean) =>
        set({ transcriptSearchModel }),
      setShowRenameDialog: (showRenameDialog: boolean) =>
        set({ showRenameDialog }),
      setRecordingToRename: (recordingToRename: Recording | null) =>
        set({ recordingToRename }),
      setAudioUrl: (audioUrl: string | null) => set({ audioUrl }),
      setSelectedRecording: (selectedRecording: Recording | null) =>
        set({ selectedRecording }),
      setDurationRange: (updater) =>
        set((state) => ({
          durationRange:
            typeof updater === 'function'
              ? updater(state.durationRange)
              : updater,
        })),
      setExpandedRecordings: (expandedRecordings: Record<string, boolean>) =>
        set({ expandedRecordings }),
      setDurationUnit: (durationUnit: 'minutes' | 'hours' | 'seconds') =>
        set({ durationUnit }),
      setSelectedDate: (selectedDate: Date | null) => set({ selectedDate }),
      setDateRange: (dateRange: DateRange | undefined) => set({ dateRange }),
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      setSearchQuery: (searchQuery: string) => set({ searchQuery }),
      setSearchType: (searchType: SearchType) => set({ searchType }),
      setTranscriptPreviews: (transcriptPreviews: Record<string, string>) =>
        set({ transcriptPreviews }),
      setTranscriptSearchResults: (
        transcriptSearchResults: Record<string, boolean>,
      ) => set({ transcriptSearchResults }),
      setRecordings: (
        updater: Recording[] | ((prev: Recording[]) => Recording[]),
      ) =>
        set((state) => ({
          recordings:
            typeof updater === 'function' ? updater(state.recordings) : updater,
        })),
      setShowDeleteDialog: (showDeleteDialog: boolean) =>
        set({ showDeleteDialog }),
      setActiveTagFilters: (updater) =>
        set((state) => ({
          activeTagFilters:
            typeof updater === 'function'
              ? updater(state.activeTagFilters)
              : updater,
        })),
      setSelectedRecordings: (updater) =>
        set((state) => ({
          selectedRecordings:
            typeof updater === 'function'
              ? updater(state.selectedRecordings)
              : updater,
        })),
      setViewMode: (viewMode: 'calendar' | 'heatmap' | 'list' | 'grid') => set({ viewMode }),
      setFilterStatus: (filterStatus: RecordingStatus) => set({ filterStatus }),
      setIsFetchingSummary: (isFetchingSummary: Record<string, boolean>) =>
        set({ isFetchingSummary }),
      setTranscriptSummaries: (transcriptSummaries: Record<string, string>) =>
        set({ transcriptSummaries }),
      setTranscriptMetadata: (
        transcriptMetadata: Record<
          string,
          {
            duration?: string
            speakers?: number
            sentiment?: string
            meta?: string
          }
        >,
      ) => set({ transcriptMetadata }),
      setExpandedAnalysis: (expandedAnalysis: Record<string, boolean>) =>
        set({ expandedAnalysis }),
      setCurrentWeek: (currentWeek: number) => set({ currentWeek }),
      setIsWeekView: (isWeekView: boolean) => set({ isWeekView }),
      setSelectedHourRecordings: (selectedHourRecordings: Recording[]) =>
        set({ selectedHourRecordings }),
      setSelectedHourInfo: (
        selectedHourInfo: { day: string; hour: number } | null,
      ) => set({ selectedHourInfo }),
      setCurrentMonth: (
        updater: Date | ((prev: Date) => Date)
      ) =>
        set((state) => ({
          currentMonth:
            typeof updater === 'function' ? updater(state.currentMonth) : updater,
        })),
      setShowTranscriptDialog: (showTranscriptDialog: boolean) =>
        set({ showTranscriptDialog }),
      setCurrentTranscript: (currentTranscript: string | null) =>
        set({ currentTranscript }),
      setIsLoadingTranscript: (isLoadingTranscript: boolean) =>
        set({ isLoadingTranscript }),
      setCurrentTranscriptTitle: (currentTranscriptTitle: string) =>
        set({ currentTranscriptTitle }),
      setSortBy: (sortBy: 'date' | 'filename' | 'duration') => set({ sortBy }),
      setSortOrder: (sortOrder: 'asc' | 'desc') => set({ sortOrder }),

      // helper function
      getLongestRecording: () => {
        const { recordings } = get()
        if (recordings.length === 0) return { duration: 0, date: null }

        const longest = recordings.reduce(
          (max, recording) =>
            recording.duration > max.duration ? recording : max,
          recordings[0],
        )

        return {
          duration: longest.duration,
          date: new Date(longest.created_at),
        }
      },

      getShortestRecording: () => {
        const { recordings } = get()
        if (recordings.length === 0) return { duration: 0, date: null }

        const validRecordings = recordings.filter((r) => r.duration > 0)
        if (validRecordings.length === 0) return { duration: 0, date: null }

        const shortest = validRecordings.reduce(
          (min, recording) =>
            recording.duration < min.duration ? recording : min,
          validRecordings[0],
        )

        return {
          duration: shortest.duration,
          date: new Date(shortest.created_at),
        }
      },

      // Audio actions
      loadAudioUrl: async () => {
        const { selectedRecording } = get()
        if (!selectedRecording) {
          set({ audioUrl: null })
          return
        }

        try {
          set({ audioUrl: selectedRecording.filepath })
        } catch (error) {
          console.error('Error getting audio URL:', error)
          set({ audioUrl: null })
        }
      },
    }),
    {
      name: 'library-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state: LibraryStore) => ({
        state: {
          currentWeek: state.currentWeek,
          isWeekView: state.isWeekView,
          currentMonth: state.currentMonth,
          dateRange: state.dateRange,
          viewMode: state.viewMode,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          durationUnit: state.durationUnit,
          durationRange: state.durationRange,
          activeTagFilters: state.activeTagFilters,
          selectedDate: state.selectedDate,
          selectedHourInfo: state.selectedHourInfo,
        },
      }
      ),
    },
  ),
)
