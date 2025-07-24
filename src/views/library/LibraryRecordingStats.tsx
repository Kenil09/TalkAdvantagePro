'use client'
import React, { useEffect, useState } from 'react'
import { Clock, FileAudio, FileText, Loader2 } from 'lucide-react'
import { useLibraryStore } from '@/lib/store/library.store'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Card, CardContent } from '@/components/ui/card'

const LibraryRecordingStats = () => {
  const [isMounted, setIsMounted] = useState(false)
  const {
    recordings = [],
    getLongestRecording,
    getShortestRecording,
  } = useLibraryStore()

  // Get stats data
  const longestRecording = getLongestRecording?.() || {
    duration: 0,
    date: null,
  }
  const shortestRecording = getShortestRecording?.() || {
    duration: 0,
    date: null,
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  if (!isMounted) {
    return (
      <div className="w-full p-3 bg-gradient-to-br from-emerald-50/80 via-slate-50/90 to-teal-50/80 dark:from-emerald-900/20 dark:via-slate-900/40 dark:to-teal-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm">
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Total Recordings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help !py-4">
              <CardContent className="p-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                    <FileAudio className="w-3 h-3 text-blue-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {recordings.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total Recordings</p>
          </TooltipContent>
        </Tooltip>

        {/* Processed */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help !py-4">
              <CardContent className="p-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                    <FileText className="w-3 h-3 text-green-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {recordings.filter((r) => r.is_processed).length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Processed</p>
          </TooltipContent>
        </Tooltip>

        {/* Processing */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help !py-4">
              <CardContent className="p-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center">
                    <Clock className="w-3 h-3 text-yellow-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {recordings.filter((r) => !r.is_processed).length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Processing</p>
          </TooltipContent>
        </Tooltip>

        {/* Failed */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help !py-4">
              <CardContent className="p-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center">
                    <FileAudio className="w-3 h-3 text-red-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {recordings.filter((r) => !r.is_processed).length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Failed</p>
          </TooltipContent>
        </Tooltip>

        {/* Longest Recording */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help !py-4">
              <CardContent className="p-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                    <Clock className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {longestRecording.duration > 0
                        ? formatDuration(longestRecording.duration)
                        : '--'}
                    </p>
                    {longestRecording.date && (
                      <p className="text-xs font-normal text-gray-500">
                        ({longestRecording.date.toLocaleDateString()})
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Longest Recording</p>
          </TooltipContent>
        </Tooltip>

        {/* Shortest Recording */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help !py-4">
              <CardContent className="p-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                    <Clock className="w-3 h-3 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {shortestRecording.duration > 0
                        ? formatDuration(shortestRecording.duration)
                        : '--'}
                    </p>
                    {shortestRecording.date && (
                      <p className="text-xs font-normal text-gray-500">
                        ({shortestRecording.date.toLocaleDateString()})
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Shortest Recording</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export default LibraryRecordingStats
