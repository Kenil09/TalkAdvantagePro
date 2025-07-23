import { Button } from '@/components/ui/button'
import { Recording } from '@/types/library.types'
import {
  Brain,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Link,
  Music2Icon,
  RefreshCw,
  Settings,
  TagIcon,
} from 'lucide-react'
import RecordingOptionsModal from '@/views/library/LibraryCalendar/FileTabs/RecordingOptionsModal'
import { useLibraryStore } from '@/lib/store/library.store'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import useTagManagement from '@/hooks/useTagManagement'
import { formatDuration, formatExactDate, TAG_COLORS } from '@/utils/date'

import { useSettingsStore } from "@/lib/store/user-setting.store"
import TagEditorModal from "./TagEditorModal"
import { useState } from 'react'

interface RenderRecordingItemProps {
  recording: Recording
}

function RenderRecordingItem({ recording }: RenderRecordingItemProps) {
  const { storageLocation } = useSettingsStore()
  const {
    selectedRecording,
    setSelectedRecording,
    isFetchingSummary,
    setSelectedRecordings,
    activeTagFilters,
    setActiveTagFilters,
    transcriptPreviews,
    expandedRecordings,
    transcriptMetadata,
    transcriptSummaries,
    expandedAnalysis,
  } = useLibraryStore()
  const { recordingTags, saveTags } = useTagManagement()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
   const toggleAnalysisPanel = (recordingId: string) => {
    console.log('toggleAnalysisPanel', recordingId)

    // setExpandedAnalysis(prev => {
    //     const newState = {
    //         ...prev,
    //         [recordingId]: !prev[recordingId]
    //     };

    //     // If expanding and it's processed, fetch the summary
    //     if (newState[recordingId]) {
    //         // const recording = recordings.find(r => r.id === recordingId);
    //         if (recording?.is_processed) {
    //             // fetchTranscriptSummary(recordingId);
    //         }
    //     }

    //     return newState;
    // });
  }

  const copyAnalysisSummary = (recording: Recording) => {
    const metadata = transcriptMetadata[recording.id] || {
      duration: formatDuration(recording.duration),
      speakers: 2,
      sentiment: 'Positive',
    }

    const meta = metadata.meta ? JSON.parse(metadata.meta) : {}

    // Build a comprehensive summary with available metadata
    let summaryText = `Deep Analysis Summary for ${recording.filename}\n\n`

    // Basic info
    summaryText += `Duration: ${metadata.duration}\n`
    summaryText += `Speakers: ${metadata.speakers} detected\n`
    summaryText += `Overall Sentiment: ${metadata.sentiment}\n\n`

    // Show topics if available
    if (meta.topics) {
      summaryText += 'Topics Detected:\n'
      Object.entries(meta.topics)
        .slice(0, 6)
        .forEach(([topic]) => {
          summaryText += `• ${topic}\n`
        })
      summaryText += '\n'
    }

    // Key points
    summaryText += 'Key Points:\n'
    if (transcriptSummaries[recording.id]) {
      transcriptSummaries[recording.id]
        ?.split('\n')
        .filter((line) => line.trim().length > 0)
        .forEach((point) => {
          summaryText += `• ${point.trim().replace(/^[•-]\s*/, '')}\n`
        })
    } else {
      // Fallback points
      summaryText += '• Discussion about project timeline\n'
      summaryText += '• Budget considerations\n'
      summaryText += '• Team resource allocation\n'
    }

    // Processing details
    // Parse the meta string into an object

    // Now you can safely access meta properties
    if (Object.keys(meta).length > 0) {
      summaryText += '\nProcessing Details:\n'
      if (meta.speaker_labels) summaryText += '✓ Speaker Detection\n'
      if (meta.timestamps) summaryText += '✓ Timestamps\n'
      if (meta.sentiment_analysis) summaryText += '✓ Sentiment Analysis\n'
      if (meta.topic_detection) summaryText += '✓ Topic Detection\n'
      if (meta.entity_detection) summaryText += '✓ Entity Detection\n'
      if (meta.summarization) {
        summaryText += `✓ Summary (${meta.summary_type || 'bullets'})\n`
      }
    }
    navigator.clipboard
      .writeText(summaryText)
      .then(() => {
        // You could add a toast notification here if you have one
        console.log('Analysis summary copied to clipboard')
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }

  const toggleTranscriptPreview = (
    recordingId: string,
    isProcessed: boolean,
  ) => {
    if (!isProcessed) return

    // setExpandedRecordings((prev) => {
    //     const isExpanding = !prev[recordingId];
    //     const newState = {
    //         ...prev,
    //         [recordingId]: isExpanding
    //     };

    //     if (isExpanding && !transcriptPreviews[recordingId]) {
    //         fetchTranscriptPreview(recordingId).catch(error => {
    //             console.error('Failed to fetch transcript preview:', error);
    //             // Optionally, you might want to set some error state here
    //         });
    //     }

    //     return newState;
    // });
  }

  const toggleRecordingSelection = (recordingId: string) => {
    setSelectedRecordings((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(recordingId)) {
        newSet.delete(recordingId)
      } else {
        newSet.add(recordingId)
      }
      return newSet
    })
  }

  return (
    <div
      key={recording.id}
      className={`border rounded-md border-slate-300 py-2 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors 
              ${selectedRecording?.id === recording.id
          ? 'bg-blue-50 dark:bg-blue-900/20'
          : ''
        }`}
      onClick={() => setSelectedRecording({
        ...recording,
        filepath: recording.filepath,
      })}
    >
      <div className="flex items-center gap-[3px] px-2 py-2">
        {/* Add checkbox for selection */}
        <div
          className="mr-2 flex items-center"
          onClick={(e) => {
            e.stopPropagation()
            toggleRecordingSelection(recording.id)
          }}
        >
          <input
            type="checkbox"
            // checked={selectedRecordings.has(recording.id)}
            onChange={() => { }}
            className="h-4 w-4 rounded border-gray-300"
          />
        </div>

        <span className="text-slate-500 text-[10px] mr-1">
          <Music2Icon size={14} />
        </span>
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mr-auto">
          {recording.filename}
        </span>

        <span
          className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${recording.is_processed ? 'bg-green-500' : 'bg-yellow-500'
            } mx-0.5`}
          title={recording.is_processed ? 'Processed' : 'Not processed'}
        />

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Display Tags */}
          <div className="flex items-center gap-1 mr-2">
            {recordingTags[recording.id]?.slice(0, 4).map((tag) => (
              <div
                key={tag.id}
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-normal border ${TAG_COLORS.find((c) => c.value === tag.color)?.class
                  } cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (
                    activeTagFilters.some(
                      (filterTag) =>
                        filterTag.name === tag.name &&
                        filterTag.color === tag.color,
                    )
                  ) {
                    setActiveTagFilters((prev) =>
                      prev.filter(
                        (filterTag) =>
                          filterTag.name !== tag.name ||
                          filterTag.color !== tag.color,
                      ),
                    )
                  } else {
                    setActiveTagFilters((prev) => [...prev, tag])
                  }
                }}
                title={`${activeTagFilters.some(
                  (filterTag) =>
                    filterTag.name === tag.name &&
                    filterTag.color === tag.color,
                )
                  ? 'Click to remove filter'
                  : 'Click to filter by'
                  } "${tag.name}"`}
              >
                {tag.name}
              </div>
            ))}
            {recordingTags[recording.id]?.length > 4 && (
              <div
                className="px-1.5 py-0.5 rounded-full text-[8px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                title={`${recordingTags[recording.id].length - 4} more tags`}
              >
                +{recordingTags[recording.id].length - 4}
              </div>
            )}
          </div>

          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {recording.duration > 0
              ? formatDuration(recording.duration)
              : '...'}
          </span>

          <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 px-1 rounded-sm border border-slate-200 dark:border-slate-800 flex-shrink-0">
            {formatExactDate(recording.recording_date)}
          </span>

          {recording.is_processed && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 flex-shrink-0"
              title="Show/hide transcript preview"
              onClick={(e) => {
                e.stopPropagation()
                toggleTranscriptPreview(recording.id, recording.is_processed)
              }}
            >
              <FileText className="h-2.5 w-2.5 text-slate-500" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 flex-shrink-0"
            title="Show/hide Deep Analysis"
            onClick={(e) => {
              e.stopPropagation()
              toggleAnalysisPanel(recording.id)
            }}
          >
            <Brain
              className={`h-2.5 w-2.5 text-slate-500 transition-transform duration-200 ${expandedAnalysis[recording.id] ? 'rotate-180' : ''
                }`}
            />
          </Button>

          {/* Add Tag Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 flex-shrink-0"
                title="Edit Tags"
                onClick={(e) => e.stopPropagation()}
              >
                <TagIcon className="h-2.5 w-2.5 text-slate-500" />
              </Button>
            </DialogTrigger>
            <TagEditorModal
              recording={recording}
              onSave={async (tags) => {
                await saveTags(recording.id, tags)
              }}
              onClose={() => {
                setIsDialogOpen(false)
              }}
            />
          </Dialog>

          <Link
            href={`/dashboard/recordings/${recording.id}?mode=${storageLocation}`}
            className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 p-0.5 rounded-sm flex items-center justify-center h-4 w-4 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <ExternalLink className="h-3 w-3" />
          </Link>

          <Dialog
            onOpenChange={(open) => {
              // When the dialog is closed, we can ensure there are no conflicts
              if (!open) {
                // If we were going to view transcript, allow time for dialog to close
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800/30 rounded-sm flex items-center justify-center flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                }}
                title="View Options"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <RecordingOptionsModal recording={recording} />
          </Dialog>
        </div>
      </div>
      {/* Transcript Preview */}
      {expandedRecordings[recording.id] && recording.is_processed && (
        <div className="bg-slate-50 dark:bg-slate-900/20 p-3 border-t border-slate-200 dark:border-slate-800 mx-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Transcript Preview
            </h4>
          </div>
          {transcriptPreviews[recording.id] ? (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {transcriptPreviews[recording.id]}
            </p>
          ) : (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin h-4 w-4 border-2 border-slate-500 rounded-full border-t-transparent"></div>
              <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                Loading transcript...
              </span>
            </div>
          )}
        </div>
      )}
      {/* Deep Analysis Panel */}
      {expandedAnalysis[recording.id] && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 border-t border-blue-200 dark:border-blue-800 mx-1">
          {!recording.is_processed ? (
            <div className="flex flex-col items-center justify-center py-2">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                Start Deep Analysis
              </p>
              <Link
                href={`/dashboard/recordings/${recording.id}?mode=${storageLocation}`}
                className="flex items-center gap-2 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Brain className="h-4 w-4" />
                Run Deep Analysis
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Deep Analysis Summary
                </h4>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      // fetchTranscriptSummary(recording.id);
                    }}
                    title="Refresh summary"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyAnalysisSummary(recording)
                    }}
                    title="Copy summary to clipboard"
                  >
                    <Copy className="h-3.5 w-3.5 text-blue-600" />
                  </Button>
                </div>
              </div>

              {/* Display summary content */}
              {isFetchingSummary[recording.id] ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                    Loading summary...
                  </span>
                </div>
              ) : transcriptSummaries[recording.id] ? (
                <div className="text-sm space-y-1.5">
                  <p className="text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Duration:</span>{' '}
                    {transcriptMetadata[recording.id]?.duration ||
                      formatDuration(recording.duration)}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Speakers:</span>{' '}
                    {transcriptMetadata[recording.id]?.speakers || 2} detected
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Overall Sentiment:</span>{' '}
                    {transcriptMetadata[recording.id]?.sentiment || 'Positive'}
                  </p>

                  {/* Show topics if available in meta */}
                  {/* {transcriptMetadata[recording.id]?.meta?.topics && (
                                        <div>
                                            <p className="text-blue-700 dark:text-blue-300 font-medium mt-2">
                                                Topics Detected:
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {Object.entries(transcriptMetadata[recording.id].meta.topics)
                                                    .slice(0, 4)
                                                    .map(([topic, relevance], idx) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                                                            {topic}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    )} */}

                  <p className="text-blue-700 dark:text-blue-300 mt-2">
                    <span className="font-medium">Key Points:</span>
                  </p>
                  <ul className="list-disc list-inside text-blue-600 dark:text-blue-400 pl-2">
                    {transcriptSummaries[recording.id]
                      ?.split('\n')
                      .filter((line) => line.trim().length > 0)
                      .map((point, idx) => (
                        <li key={idx}>
                          {point.trim().replace(/^[•-]\s*/, '')}
                        </li>
                      ))}
                  </ul>

                  {/* Show processing details if available */}
                  {/* {transcriptMetadata[recording.id]?.meta && ( */}
                  <div className="mt-3 pt-2 border-t border-blue-200 dark:border-blue-800">
                    <p className="text-blue-700 dark:text-blue-300 font-medium mb-1">
                      Processing Details:
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {/* {transcriptMetadata[recording.id].meta.speaker_labels && ( */}
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        ✓ Speaker Detection
                      </p>
                      {/* )} */}
                      {/* {transcriptMetadata[recording.id].meta.timestamps && ( */}
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        ✓ Timestamps
                      </p>
                      {/* )} */}
                      {/* {transcriptMetadata[recording.id].meta.sentiment_analysis && ( */}
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        ✓ Sentiment Analysis
                      </p>
                      {/* )}/ */}
                      {/* {transcriptMetadata[recording.id].meta.topic_detection && ( */}
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        ✓ Topic Detection
                      </p>
                      {/* )} */}
                      {/* {transcriptMetadata[recording.id].meta.entity_detection && ( */}
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        ✓ Entity Detection
                      </p>
                      {/* )} */}
                      {/* {transcriptMetadata[recording.id].meta.summarization && ( */}
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        ✓ Summary{' '}
                        {/* ({transcriptMetadata[recording.id].meta.summary_type || "bullets"}) */}
                      </p>
                      {/* )} */}
                    </div>
                  </div>
                  {/* )} */}

                  <div className="pt-2">
                    <Link
                      href={`/dashboard/recordings/${recording.id}?mode=${storageLocation}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Full Analysis
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-sm space-y-1.5">
                  <p className="text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Duration:</span>{' '}
                    {formatDuration(recording.duration)}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Speakers:</span> 2 detected
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Overall Sentiment:</span>{' '}
                    Positive
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Key Points:</span>
                  </p>
                  <ul className="list-disc list-inside text-blue-600 dark:text-blue-400 pl-2">
                    <li>Discussion about project timeline</li>
                    <li>Budget considerations</li>
                    <li>Team resource allocation</li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      href={`/dashboard/recordings/${recording.id}?mode=${storageLocation}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Full Analysis
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RenderRecordingItem
