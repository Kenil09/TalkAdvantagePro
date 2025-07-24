export interface Recording {
  id: string
  user_id: string
  title: string
  filename: string
  filepath: string
  transcript: string | null
  recording_date: string
  recording_time: string
  duration: number
  created_at: string
  is_processed: boolean
  tags: string | null
  updated_at: string
  status: string
  filesize: number
  participants: number
}

export interface RecordingTag {
  recordingId: string
  tags: Tag[]
}

// Define the shape of the IndexedDB recording
export interface IndexedDBRecording {
  id: string
  userId: string
  name: string
  description?: string | null
  durationSeconds: number
  audioBlob: Blob
  createdAt: string
  isProcessed: boolean
  isPublic: boolean
  transcript?: string | null
  summary?: string | null
  tags: string | null // JSON string of Tag[] - [{name: string, color: string}]
  type?: string
  mimeType?: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface TagColor {
  name: string
  value: string
  class: string
}

export interface SimplifiedRecording {
  id: string
  filename: string
  created_at: string
  duration: number
  is_processed: boolean
}

export interface RecordingHeatmapProps {
  recordings: Array<{
    id: string
    created_at: string
    duration: number
    filename: string
    filepath: string
    is_processed: boolean
  }>
  className?: string
  embedded?: boolean
  currentWeek: number
  onWeekChange: (weekNumber: number) => void
  onHourSelect: (
    dayIndex: number,
    hourIndex: number,
    recordings: Array<SimplifiedRecording>,
  ) => void
}
