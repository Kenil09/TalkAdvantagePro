import { useState } from 'react'
import { createClient } from "@/lib/supabase/client"
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLibraryStore } from '@/lib/store/library.store'
import { DATABASE_TABLE } from "@/config"

function DeleteDialog() {
  const [isDeleting, setIsDeleting] = useState(false)
  const {
    selectedRecording,
    setRecordings,
    selectedRecordings,
    setSelectedRecordings,
    setSelectedRecording,
    showDeleteDialog,
    setAudioUrl,
    setShowDeleteDialog,
  } = useLibraryStore()

  // Add delete handlers
  const handleDelete = async (recordingIds: string[]) => {
    try {
      setIsDeleting(true)
      const supabase = createClient()
      // Delete recordings from Supabase
      const { error } = await supabase
        .from(DATABASE_TABLE.RECORDINGS)
        .delete()
        .in('id', recordingIds)

      if (error) {
        console.error('Error deleting recordings from Supabase:', error)
        alert('Failed to delete recordings. Please try again.')
        return
      }
      // Update local state
      setRecordings((prev) =>
        prev.filter((rec) => !recordingIds.includes(rec.id)),
      )
      setSelectedRecordings(new Set())
      setShowDeleteDialog(false)

      // Clear selected recording if it was deleted
      if (selectedRecording && recordingIds.includes(selectedRecording.id)) {
        setSelectedRecording(null)
        setAudioUrl(null)
      }
    } catch (error) {
      console.error('Error deleting recordings:', error)
      alert('Failed to delete recordings. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Recordings</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedRecordings.size} recording
            {selectedRecordings.size !== 1 ? 's' : ''}? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDeleteDialog(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleDelete(Array.from(selectedRecordings))}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteDialog
