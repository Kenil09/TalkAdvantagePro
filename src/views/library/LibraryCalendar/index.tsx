import { Card } from '@/components/ui/card'
import { Clock, FileAudio, FileText, MoreHorizontal, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLibraryStore } from '@/lib/store/library.store'
import { Tag as TagType } from '@/types/library.types'
import {
  format,
  startOfMonth,
  endOfMonth,
  isToday,
  isSameDay,
  eachDayOfInterval,
} from 'date-fns'
import { cn } from '@/utils/tailwind'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDuration } from '@/utils/date'
import TranscriptTextModel from '@/views/library/LibraryCalendar/TranscriptTextModel'
import LibraryHeatmap from "@/views/library/LibraryHeatmap"
import { bytesToMB, getStatusColor, getStatusDot } from "@/constants/library.constants"

function LibraryCalendar() {
  const {
    searchQuery,
    filterStatus,
    recordings,
    viewMode,
    selectedRecording,
    setCurrentMonth,
    currentMonth,
    setSelectedRecording,
    transcriptSearchModel,
    setTranscriptSearchModel,
    selectedHeatmapDate,
    setExpandedTranscriptIds,
  } = useLibraryStore()

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev.getTime())
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const filteredRecordings = recordings.filter((recording) => {
    // Filter by search query
    const matchesSearch =
      recording.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording?.transcript?.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by status
    const matchesStatus =
      filterStatus === 'all' || recording.status === filterStatus

    // Filter by selected date if applicable
    const matchesDate = selectedHeatmapDate
      ? isSameDay(new Date(recording.recording_date), selectedHeatmapDate)
      : true

    return matchesSearch && matchesStatus && matchesDate
  })

  const getRecordingsForDate = (date: Date) => {
    return recordings.filter((recording) =>
      isSameDay(new Date(recording.recording_date), date),
    )
  }

  const toggleTranscript = (id: string) => {
    setExpandedTranscriptIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4">
        {viewMode === 'heatmap' ? (
          <LibraryHeatmap
            getRecordingsForDate={getRecordingsForDate}
            filteredRecordings={filteredRecordings}
            toggleTranscript={toggleTranscript}
          />
        ) : viewMode === 'calendar' ? (
          <div className="space-y-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  ←
                </Button>
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(2025, 6, 1))}
                >
                  Today
                </Button>
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  →
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Days of week header */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {eachDayOfInterval({
                  start: startOfMonth(currentMonth),
                  end: endOfMonth(currentMonth),
                }).map((date) => {
                  const dayRecordings = getRecordingsForDate(date)
                  const isCurrentDay = isToday(date)

                  return (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        'min-h-[120px] p-2 border-r border-b border-gray-100 hover:bg-gray-50 transition-colors',
                        isCurrentDay && 'bg-blue-50',
                      )}
                    >
                      <div
                        className={cn(
                          'text-sm font-medium mb-2',
                          isCurrentDay ? 'text-blue-600' : 'text-gray-900',
                        )}
                      >
                        {format(date, 'd')}
                      </div>

                      <div className="space-y-1">
                        {dayRecordings.slice(0, 3).map((recording) => (
                          <div
                            key={recording.id}
                            className={cn(
                              'p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-all',
                              selectedRecording?.id === recording.id
                                ? 'bg-blue-100 border border-blue-200'
                                : 'bg-white border border-gray-200',
                            )}
                            onClick={() => setSelectedRecording(recording)}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <div
                                className={cn(
                                  'w-2 h-2 rounded-full',
                                  getStatusDot(
                                    recording.status || 'processing',
                                  ),
                                )}
                              />
                              <span className="font-medium truncate">
                                {recording.filename}
                              </span>
                            </div>
                            <div className="text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{recording.recording_time}</span>
                            </div>
                          </div>
                        ))}

                        {dayRecordings.length > 3 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            +{dayRecordings.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Calendar Legend */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Processed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Failed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span>Holiday</span>
              </div>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRecordings.map((recording) => (
              <Card
                key={recording.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedRecording?.id === recording.id &&
                  'ring-2 ring-blue-500',
                )}
                onClick={() => setSelectedRecording(recording)}
              >
                <CardContent className="px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileAudio className="w-6 h-6 text-blue-600" />
                      </div>

                      <div className="flex-1 w-full">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {recording.filename}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="text-xs text-gray-500 font-medium">
                            {format(
                              new Date(recording.recording_date),
                              'MMM d, yyyy',
                            )}{' '}
                            at {recording.recording_time}
                          </span>
                          <span>•</span>
                          <span>{formatDuration(recording.duration)}</span>
                          <span>•</span>
                          <span className="text-xs text-gray-500 font-medium">
                            {recording.participants ?? 0} participants
                          </span>
                          <span>•</span>
                          <span className="text-xs text-gray-500 font-medium">{bytesToMB(recording.filesize ?? 0)} MB</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge
                            className={getStatusColor(
                              recording.status || 'processing',
                            )}
                          >
                            {recording.status || 'processing'}
                          </Badge>
                          {recording.transcript && (
                            <Badge
                              variant="outline"
                              className="gap-1 cursor-pointer"
                              onClick={() => {
                                setTranscriptSearchModel(true)
                                toggleTranscript(recording.id)
                              }}
                            >
                              <FileText className="w-3 h-3" />
                              Transcript
                            </Badge>
                          )}
                          {recording.tags &&
                            JSON.parse(recording.tags).map((tag: TagType) => (
                              <Badge
                                key={tag.id}
                                variant="secondary"
                                className="gap-1 flex flex-wrap"
                              >
                                <Tag className="w-3 h-3" />
                                {tag.name}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecordings.map((recording) => (
              <Card
                key={recording.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedRecording?.id === recording.id &&
                  'ring-2 ring-blue-500',
                )}
                onClick={() => setSelectedRecording(recording)}
              >
                <CardContent className="px-6">
                  <div className="flex justify-between items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileAudio className="w-5 h-5 text-blue-600" />
                      </div>
                      <Badge
                        className={getStatusColor(
                          recording.status || 'processing',
                        )}
                      >
                        {recording.status || 'processing'}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{bytesToMB(recording?.filesize ?? 0)} MB</span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {recording.filename}
                      </h3>
                      <div className="text-xs text-gray-500 font-medium">
                        {format(
                          new Date(recording.recording_date),
                          'MMM d, yyyy',
                        )}{' '}
                        at {recording.recording_time}
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500 font-medium">
                          Duration: {formatDuration(recording.duration)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">{recording?.participants ?? 0} participants</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      {JSON.parse(recording?.tags || '[]')
                        .slice(0, 3)
                        .map((tag: TagType) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                    </div>
                    {recording.transcript && (
                      <Badge
                        variant="outline"
                        className="gap-1 cursor-pointer"
                        onClick={() => {
                          setTranscriptSearchModel(true)
                          toggleTranscript(recording.id)
                        }}
                      >
                        <FileText className="w-3 h-3" />
                        Transcript
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <TranscriptTextModel
        isOpen={transcriptSearchModel}
        setTranscriptSearchModel={setTranscriptSearchModel}
        filteredRecordings={filteredRecordings}
      />
    </div>
  )
}

export default LibraryCalendar
