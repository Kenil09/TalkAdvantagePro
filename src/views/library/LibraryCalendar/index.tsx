import { Card } from '@/components/ui/card'
import {
  Clock,
  FileAudio,
  FileText,
  MoreHorizontal,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLibraryStore } from '@/lib/store/library.store'
import { Tag as TagType } from '@/types/library.types'
import {
  format, subMonths, eachWeekOfInterval, eachDayOfInterval, endOfWeek, startOfMonth,
  endOfMonth,
  isToday,
  isSameDay,
} from "date-fns"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/utils/tailwind"
import { CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { formatDuration } from "@/utils/date"
import TranscriptTextModel from "./TranscriptTextModel"

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
  } = useLibraryStore()
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<Date | null>(null)
  const [expandedTranscriptIds, setExpandedTranscriptIds] = useState<string[]>([])
  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed":
        return "bg-green-100 text-green-800 border-green-200"
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "holiday":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }
  const getStatusDot = (status: string) => {
    switch (status) {
      case "processed":
        return "bg-green-500"
      case "processing":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      case "holiday":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getHeatmapIntensity = (date: Date) => {
    const dayRecordings = getRecordingsForDate(date)
    const count = dayRecordings.length

    if (count === 0) return "bg-gray-100"
    if (count === 1) return "bg-green-200"
    if (count === 2) return "bg-green-400"
    if (count >= 3) return "bg-green-600"
    return "bg-gray-100"
  }

  const getHeatmapTooltip = (date: Date) => {
    const dayRecordings = getRecordingsForDate(date)
    const count = dayRecordings.length
    const dateStr = format(date, "MMM d, yyyy")

    if (count === 0) return `${dateStr}: No meetings`
    if (count === 1) return `${dateStr}: 1 meeting`
    return `${dateStr}: ${count} meetings`
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev.getTime())
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const filteredRecordings = recordings.filter((recording) => {
    const matchesSearch =
      recording.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording?.transcript?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || recording.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Generate heatmap data for the last 12 months
  const generateHeatmapData = () => {
    const endDate = new Date(2025, 6, 31) // End of July 2025
    const startDate = subMonths(endDate, 11) // 12 months back
    const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 0 })

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
      return days
    })
  }

  const heatmapData = generateHeatmapData()

  const getRecordingsForDate = (date: Date) => {
    return recordings.filter((recording) => isSameDay(new Date(recording.recording_date), date))
  }

  const toggleTranscript = (id: string) => {
    setExpandedTranscriptIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4">
        {viewMode === "heatmap" ? (
          <div className="space-y-6">
            {/* Heatmap Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Meeting Activity</h2>
                <p className="text-gray-500 mt-1">Last 12 months of meeting patterns</p>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 w-full">
              <div className="space-y-3">
                {/* Month labels */}
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  {Array.from(
                    new Set(
                      heatmapData
                        .flat()
                        .map((date) => format(date, "MMM yyyy"))
                    )
                  ).map((monthLabel, idx) => (
                    <span key={idx}>{monthLabel}</span>
                  ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex gap-1">
                  {/* Day labels */}
                  <div className="flex flex-col gap-5 text-xs text-gray-500 mr-2">
                    <div className="h-3 flex items-center">Sun</div>
                    <div className="h-3 flex items-center">Mon</div>
                    <div className="h-3 flex items-center">Tue</div>
                    <div className="h-3 flex items-center">Wed</div>
                    <div className="h-3 flex items-center">Thu</div>
                    <div className="h-3 flex items-center">Fri</div>
                    <div className="h-3 flex items-center">Sat</div>
                  </div>

                  {/* Heatmap squares */}
                  <div className="flex gap-4.5">
                    {heatmapData.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-5">
                        {week.map((day, dayIndex) => {
                          const dayRecordings = getRecordingsForDate(day)
                          return (
                            <Tooltip key={dayIndex}>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all",
                                    getHeatmapIntensity(day),
                                  )}
                                  onClick={() => {
                                    setSelectedHeatmapDate(day)
                                    if (dayRecordings.length > 0) {
                                      setSelectedRecording(dayRecordings[0])
                                    }
                                  }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p className="font-medium">{getHeatmapTooltip(day)}</p>
                                  {dayRecordings.length > 0 && (
                                    <div className="mt-1 space-y-1">
                                      {dayRecordings.slice(0, 3).map((recording) => (
                                        <p key={recording.id} className="text-xs text-gray-600">
                                          • {recording.filename}
                                        </p>
                                      ))}
                                      {dayRecordings.length > 3 && (
                                        <p className="text-xs text-gray-500">
                                          +{dayRecordings.length - 3} more
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-500">Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-100"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-200"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-600"></div>
                  </div>
                  <span className="text-xs text-gray-500">More</span>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{recordings.length}</p>
                    <p className="text-sm text-gray-500">Total Recordings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{new Set(recordings.map((recording) => recording.recording_date)).size}</p>
                    <p className="text-sm text-gray-500">Active days</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{(recordings.length / new Set(recordings.map((recording) => recording.recording_date)).size).toFixed(1)}</p>
                    <p className="text-sm text-gray-500">Avg per day</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {recordings.length > 0
                        ? Object.entries(
                          recordings.reduce(
                            (acc, recording) => {
                              const month = new Date(recording.recording_date).toLocaleString("default", { month: "long" })
                              acc[month] = (acc[month] || 0) + 1
                              return acc
                            },
                            {} as Record<string, number>
                          )
                        ).sort((a, b) => b[1] - a[1])[0][0]
                        : "-"}
                    </p>
                    <p className="text-sm text-gray-500">Most active month</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Day Recordings */}
            {selectedHeatmapDate && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recordings for {format(selectedHeatmapDate, "MMMM d, yyyy")}
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => setSelectedHeatmapDate(null)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white cursor-pointer"
                  >
                    Clear selection
                  </Button>
                </div>

                {(() => {
                  const dayRecordings = getRecordingsForDate(selectedHeatmapDate)

                  if (dayRecordings.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <FileAudio className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No recordings found for this day</p>
                      </div>
                    )
                  }

                  return (
                    <div className="space-y-3">
                      {dayRecordings.map((recording) => (
                        <Card
                          key={recording.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            selectedRecording?.id === recording.id && "ring-2 ring-blue-500",
                          )}
                          onClick={() => setSelectedRecording(recording)}
                        >
                          <CardContent className="px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <FileAudio className="w-5 h-5 text-blue-600" />
                                </div>

                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 mb-1">{recording.filename}</h4>
                                  <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span>{recording.recording_time}</span>
                                    <span>•</span>
                                    <span>{formatDuration(recording.duration)}</span>
                                    <span>•</span>
                                    <span>{recording.participants} participants</span>
                                  </div>

                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className={getStatusColor(recording.status || "processing")}>
                                      {recording.status || "processing"}
                                    </Badge>
                                    {recording.transcript && (
                                      <Badge variant="outline" className="gap-1 cursor-pointer" onClick={() => {
                                        setTranscriptSearchModel(true)
                                        toggleTranscript(recording.id)
                                      }}>
                                        <FileText className="w-3 h-3" />
                                        Transcript
                                      </Badge>
                                    )}
                                    <div className="flex gap-1">
                                      {JSON.parse(recording?.tags || '[]').slice(0, 3).map((tag: TagType) => (
                                        <Badge key={tag.id} variant="secondary" className="text-xs">
                                          {tag.name}
                                        </Badge>
                                      ))}
                                      {JSON.parse(recording?.tags || '[]').length > 3 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{JSON.parse(recording?.tags || '[]').length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        ) : viewMode === "calendar" ? (
          <div className="space-y-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{format(currentMonth, "MMMM yyyy")}</h2>
              <div className="flex gap-2">
                <Button className="cursor-pointer" variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  ←
                </Button>
                <Button className="cursor-pointer" variant="outline" size="sm" onClick={() => setCurrentMonth(new Date(2025, 6, 1))}>
                  Today
                </Button>
                <Button className="cursor-pointer" variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  →
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Days of week header */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50">
                    {day}
                  </div>
                ))}
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
                        "min-h-[120px] p-2 border-r border-b border-gray-100 hover:bg-gray-50 transition-colors",
                        isCurrentDay && "bg-blue-50",
                      )}
                    >
                      <div
                        className={cn(
                          "text-sm font-medium mb-2",
                          isCurrentDay ? "text-blue-600" : "text-gray-900",
                        )}
                      >
                        {format(date, "d")}
                      </div>

                      <div className="space-y-1">
                        {dayRecordings.slice(0, 3).map((recording) => (
                          <div
                            key={recording.id}
                            className={cn(
                              "p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-all",
                              selectedRecording?.id === recording.id
                                ? "bg-blue-100 border border-blue-200"
                                : "bg-white border border-gray-200",
                            )}
                            onClick={() => setSelectedRecording(recording)}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <div className={cn("w-2 h-2 rounded-full", getStatusDot(recording.status || "processing"))} />
                              <span className="font-medium truncate">{recording.filename}</span>
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
        ) : viewMode === "list" ? (
          <div className="space-y-4">
            {filteredRecordings.map((recording) => (
              <Card
                key={recording.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedRecording?.id === recording.id && "ring-2 ring-blue-500",
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
                        <h3 className="font-semibold text-gray-900 mb-1">{recording.filename}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            {format(new Date(recording.recording_date), "MMM d, yyyy")} at {recording.recording_time}
                          </span>
                          <span>•</span>
                          <span>{formatDuration(recording.duration)}</span>
                          <span>•</span>
                          <span>{recording.participants ?? 0} participants</span>
                          <span>•</span>
                          <span>{recording.size ?? 0} MB</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getStatusColor(recording.status || "processing")}>{recording.status || "processing"}</Badge>
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
                          {recording.tags && JSON.parse(recording.tags).map((tag: TagType) => (
                            <Badge key={tag.id} variant="secondary" className="gap-1">
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
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedRecording?.id === recording.id && "ring-2 ring-blue-500",
                )}
                onClick={() => setSelectedRecording(recording)}
              >
                <CardContent className="px-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileAudio className="w-5 h-5 text-blue-600" />
                    </div>
                    <Badge className={getStatusColor(recording.status || "processing")}>{recording.status || "processing"}</Badge>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{recording.filename}</h3>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div>
                      {format(new Date(recording.recording_date), "MMM d, yyyy")} at {recording.recording_time}
                    </div>
                    <div className="flex justify-between">
                      <span>Duration: {formatDuration(recording.duration)}</span>
                      <span>{recording?.size ?? "0"} MB</span>
                    </div>
                    <div>{recording?.participants ?? 0} participants</div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-1 mb-4">
                    <div className="flex items-center gap-1 flex-wrap">
                      {JSON.parse(recording?.tags || '[]').slice(0, 3).map((tag: TagType) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                    {recording.transcript && (
                      <Badge variant="outline" className="gap-1 cursor-pointer" onClick={() => {
                        setTranscriptSearchModel(true)
                        toggleTranscript(recording.id)
                      }}>
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
        expandedTranscriptIds={expandedTranscriptIds}
        filteredRecordings={filteredRecordings}
        setExpandedTranscriptIds={setExpandedTranscriptIds}
      />
    </div>
  )
}

export default LibraryCalendar
