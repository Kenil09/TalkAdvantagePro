import { useEffect, useRef, useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useLibraryStore } from '@/lib/store/library.store'
import { DATABASE_TABLE } from '@/config'

export const RenameDialog = () => {
  const {
    showRenameDialog,
    recordings,
    setRecordings,
    recordingToRename,
    setShowRenameDialog,
  } = useLibraryStore()
  const [formState, setFormState] = useState({
    name: '',
    isSaving: false,
  })
  const inputRef = useRef<HTMLInputElement>(null)

  // Add rename handler
  const handleRename = async (id: string, newName: string) => {
    try {
      const recording = recordings.find((r) => r.id === id)
      if (!recording) return

      // Keep the date part of the name if it exists
      const dateMatch = recording.filename.match(/^\d{6}_\d{6}/)
      const datePart = dateMatch ? dateMatch[0] : ''

      // Construct the new name
      const finalName = datePart
        ? `${datePart}_${newName.trim()}.mp3`
        : `${newName.trim()}.mp3`

      const supabase = createClient()
      const { error } = await supabase
        .from(DATABASE_TABLE.RECORDINGS)
        .update({
          filename: finalName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setRecordings((prev) =>
        prev.map((rec) =>
          rec.id === id
            ? {
                ...rec,
                filename: finalName,
              }
            : rec,
        ),
      )
    } catch (error) {
      console.error('Error renaming recording:', error)
      throw error
    }
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (showRenameDialog && recordingToRename) {
      // Remove date prefix and .mp3 extension for display
      const displayName = recordingToRename.filename
        .replace(/^\d{6}_\d{6}_?/, '')
        .replace(/\.mp3$/, '')
      setFormState((prev) => ({
        ...prev,
        name: displayName,
      }))
      // Focus input after dialog animation
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      // Reset form when dialog closes
      setFormState({
        name: '',
        isSaving: false,
      })
    }
  }, [showRenameDialog, recordingToRename])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setFormState((prev) => ({
      ...prev,
      name: newName,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recordingToRename || !formState.name.trim() || formState.isSaving)
      return

    try {
      setFormState((prev) => ({ ...prev, isSaving: true }))
      await handleRename(recordingToRename.id, formState.name)
      setShowRenameDialog(false)
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setFormState((prev) => ({ ...prev, isSaving: false }))
    }
  }

  return (
    <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Rename Recording
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Name</label>
              <p className="text-sm text-muted-foreground">
                {recordingToRename?.filename || ''}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                New Name
              </label>
              <Input
                id="name"
                ref={inputRef}
                value={formState.name}
                onChange={handleNameChange}
                placeholder="Enter new name"
                disabled={formState.isSaving}
              />
              <p className="text-xs text-muted-foreground">
                The date prefix will be preserved automatically.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRenameDialog(false)}
              disabled={formState.isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formState.isSaving || !formState.name.trim()}
            >
              {formState.isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
