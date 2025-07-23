'use client'
import React, { useEffect } from 'react'
import LibrarySearchBar from '@/views/library/LibrarySearchBar'
import { useLibraryStore } from '@/lib/store/library.store'

import LibraryRecordingStats from '@/views/library/LibraryRecordingStats'
import LibraryCalendar from '@/views/library/LibraryCalendar'
import MediaPlayer from './LibraryCalendar/MediaPlayer'

const Library = () => {
  const {
    recordings,
    dateRange,
    setSelectedDate,
    selectedRecordings,
    setSelectedRecordings,
    selectedRecording,
    setShowDeleteDialog,
    loadAudioUrl,
  } = useLibraryStore()
  useEffect(() => {
    loadAudioUrl()
  }, [selectedRecording, loadAudioUrl])

  // Add effect to update selected date when date range changes
  useEffect(() => {
    if (dateRange?.from) {
      setSelectedDate(dateRange.from)
    }
  }, [dateRange, setSelectedDate])

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected recordings with Delete key
      if (e.key === 'Delete' && selectedRecordings.size > 0) {
        setShowDeleteDialog(true)
      }

      // Select all with Ctrl/Cmd + A
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        const allIds = new Set(recordings.map((r) => r.id))
        setSelectedRecordings((prev) =>
          prev.size === allIds.size ? new Set() : allIds,
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedRecordings,
    recordings,
    setShowDeleteDialog,
    setSelectedRecordings,
  ])

  return (
    <div>
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Recording Statistics */}
          <LibraryRecordingStats />
          {/* Search Bar - Full Width */}
          <LibrarySearchBar />
          <LibraryCalendar />
          <MediaPlayer />
          {/* Delete Dialog  TODO:: REMOVE */}
          {/* <DeleteDialog /> */}
          {/* Calendar TODO:: REMOVE*/}
          {/* Transcript Dialog TODO:: REMOVE */}
          {/* <TranscriptDialog /> */}
          {/* Add RenameDialog TODO:: REMOVE*/}
          {/* <RenameDialog  TODO:: REMOVE/> */}
        </div>
      </div>
    </div>
  )
}

export default Library
