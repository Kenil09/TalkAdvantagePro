import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLibraryStore } from "@/lib/store/library.store"
import { Recording } from '@/types/library.types'
import { X } from 'lucide-react'

function TranscriptTextModel({
  isOpen,
  setTranscriptSearchModel,
  filteredRecordings,
}: {
  isOpen: boolean
  setTranscriptSearchModel: (value: boolean) => void
  filteredRecordings: Recording[]
}) {
  const { setExpandedTranscriptIds, expandedTranscriptIds } = useLibraryStore()
  const handleClose = () => {
    setTranscriptSearchModel(false)
    setExpandedTranscriptIds([])
  }
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="!max-w-[500px] max-h-[90vh] p-0 overflow-y-auto bg-white border-gray-200 [&>button]:hidden">
        <DialogHeader className="sticky top-0 z-10 bg-gray-200 text-white p-6">
          <DialogTitle className="!text-2xl font-bold text-white flex items-center gap-2">
            Transcript
          </DialogTitle>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => handleClose()}
              className="absolute top-4 right-4 text-white hover:bg-white/20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 p-4 md:mr-6">
          {filteredRecordings.map((recording, index) => {
            return (
              expandedTranscriptIds.includes(recording?.id) && (
                <div
                  key={index}
                  className="m-2 p-2 border rounded-md w-full h-[100px] max-w-[630px] overflow-y-auto"
                >
                  <p className="text-sm whitespace-normal break-words">
                    {recording?.transcript}
                  </p>
                </div>
              )
            )
          })}
        </div>

        <DialogFooter>
          <div className=" bg-white w-full flex justify-end px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="px-6 text-sm font-medium cursor-pointer"
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TranscriptTextModel
