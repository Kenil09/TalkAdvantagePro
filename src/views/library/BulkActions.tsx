import React, { useEffect, useState } from 'react'
import { Brain, Trash2, X } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { useLibraryStore } from '@/lib/store/library.store'

const BulkActions: React.FC = () => {
  const [mounted, setMounted] = useState(false)
  const {
    recordings,
    setShowDeleteDialog,
    selectedRecordings,
    setSelectedRecordings,
  } = useLibraryStore()
  // Check if any selected recordings are processed
  const hasProcessedRecordings = Array.from(selectedRecordings).some(
    (id) => recordings.find((r) => r.id === id)?.is_processed,
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex items-center gap-2">
      {selectedRecordings.size > 0 && (
        <>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-md px-2 py-1 flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {selectedRecordings.size} selected
            </span>
          </div>
          {hasProcessedRecordings && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      // Get IDs of processed recordings
                      const processedIds = Array.from(
                        selectedRecordings,
                      ).filter(
                        (id) =>
                          recordings.find((r) => r.id === id)?.is_processed,
                      )

                      // Get the processed recordings
                      const processedRecordings = recordings.filter((r) =>
                        processedIds.includes(r.id),
                      )

                      // Store the selected recordings in localStorage
                      localStorage.setItem(
                        'selectedTranscripts',
                        JSON.stringify(processedRecordings),
                      )

                      // Dispatch a custom event to switch tabs
                      const event = new CustomEvent('switchTab', {
                        detail: 'analysis',
                      })
                      window.dispatchEvent(event)
                    }}
                    className="h-7 w-7"
                  >
                    <Brain className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send to Deep Analysis</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-7 w-7"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete selected recordings (Delete)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedRecordings(new Set())}
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear selection (Ctrl/Cmd + A)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  )
}

export default BulkActions
