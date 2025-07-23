import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DATABASE_TABLE } from "@/config"
import { useLibraryStore } from '@/lib/store/library.store'
import { useSettingsStore } from '@/lib/store/user-setting.store'
import { createClient } from '@/lib/supabase/client'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { Download, FileText } from 'lucide-react'

const TranscriptDialog = () => {
  const {
    showTranscriptDialog,
    setShowTranscriptDialog,
    setCurrentTranscript,
    isLoadingTranscript,
    setCurrentTranscriptTitle,
    currentTranscript,
    currentTranscriptTitle,
    selectedRecording,
  } = useLibraryStore()

  // Update the downloadTranscript function to handle unprocessed recordings
  const downloadTranscript = async (
    recordingId: string,
    recordingName: string,
  ) => {
    try {
      // Use storageLocation from settings store instead of cookies
      const storageLocation =
        useSettingsStore.getState().storageLocation || 'cloud'
      console.log('downloadTranscript using storageLocation:', storageLocation)

      let transcriptText: string | null = null
      let summaryText: string | null = null

        // For cloud recordings, fetch from Supabase as before
        console.log('Downloading cloud recording transcript', { recordingId })
        const supabase = createClient()

        // Get transcript and summary
        const { data, error } = await supabase
          .from(DATABASE_TABLE.TRANSCRIPTS)
          .select('full_text, summary')
          .eq('recording_id', recordingId)
          .single()

        if (error || !data) {
          console.error('Error fetching transcript:', error)
          alert(
            'No transcript available. This recording may not have been processed yet.',
          )
          return
        }

        transcriptText = data.full_text
        summaryText = data.summary

      // Create a blob with the transcript text, including summary if available
      let finalText = transcriptText || ''
      if (summaryText) {
        finalText = `SUMMARY:\n${summaryText}\n\nFULL TRANSCRIPT:\n${transcriptText}`
      }

      const blob = new Blob([finalText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)

      // Create a temporary link element
      const a = document.createElement('a')
      a.href = url
      a.download = `${recordingName.replace(/[^\w\s-]/g, '')}_transcript.txt`

      // Trigger the download
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading transcript:', error)
      alert('Failed to download transcript: ' + String(error))
    }
  }

  return (
    <Dialog
      open={showTranscriptDialog}
      onOpenChange={(open) => {
        setShowTranscriptDialog(open)
        if (!open) {
          // Clear transcript state when dialog closes

          setCurrentTranscript(null)
          setCurrentTranscriptTitle('')
        }
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {currentTranscriptTitle} - Transcript
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-end mb-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              selectedRecording
                ? downloadTranscript(
                    selectedRecording.id,
                    selectedRecording.filename,
                  )
                : null
            }
            disabled={!currentTranscript || isLoadingTranscript}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Transcript
          </Button>
        </div>

        <ScrollArea className="h-[60vh]">
          {isLoadingTranscript ? (
            <div className="py-8 flex justify-center">
              <div className="animate-pulse space-y-3 w-full">
                <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                <div className="h-4 bg-primary/20 rounded w-full"></div>
                <div className="h-4 bg-primary/20 rounded w-5/6"></div>
                <div className="h-4 bg-primary/20 rounded w-4/5"></div>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none p-2">
              {currentTranscript?.split('\n').map((line, idx) => {
                // Apply special formatting to section headers
                if (line.startsWith('SUMMARY:')) {
                  return (
                    <h3
                      key={idx}
                      className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 border-b border-emerald-200 dark:border-emerald-800 pb-2 mb-3"
                    >
                      {line}
                    </h3>
                  )
                } else if (line.startsWith('FULL TRANSCRIPT:')) {
                  return (
                    <h3
                      key={idx}
                      className="text-lg font-semibold text-purple-600 dark:text-purple-400 border-b border-purple-200 dark:border-purple-800 pb-2 mb-3 mt-6"
                    >
                      {line}
                    </h3>
                  )
                } else if (
                  line.startsWith('Duration:') ||
                  line.startsWith('Speakers:') ||
                  line.startsWith('Overall Sentiment:') ||
                  line.startsWith('Topics:') ||
                  line.startsWith('Entities:')
                ) {
                  // Format metadata lines
                  const [label, value] = line.split(':', 2)
                  return (
                    <div key={idx} className="flex items-start mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400 mr-2 min-w-[100px]">
                        {label}:
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {value}
                      </span>
                    </div>
                  )
                } else if (line.trim() === '') {
                  // Empty line
                  return <div key={idx} className="h-2"></div>
                } else {
                  // Regular transcript text
                  return (
                    <p key={idx} className="my-1">
                      {line}
                    </p>
                  )
                }
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default TranscriptDialog
