import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
import { useRecordingStore } from '@/lib/store/recording.store'
import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const MeetingNotesDialog = () => {
  const { models, meetingNotesSelectedModel, fetchModels, setSelectedModel } =
    useRecordingStore()
  const [open, setOpen] = useState<boolean>(false)

  const [formState, setFormState] = useState({
    selectedModel: '',
  })

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  // When dialog opens, sync local form state from Zustand state
  useEffect(() => {
    if (open) {
      setFormState({
        selectedModel: meetingNotesSelectedModel || '',
      })
    }
  }, [open, meetingNotesSelectedModel])

  // On save, update Zustand with local form values, which triggers persist/localStorage update
  const handleSave = () => {
    setSelectedModel('meetingNotesSelectedModel', formState.selectedModel)
    setOpen(false)
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-gray-500 hover:text-gray-700"
          aria-label="Open Chatbot settings"
        >
          <Settings className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent
        className="z-[100]"
        onInteractOutside={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Meeting Notes settings</DialogTitle>
          <DialogDescription>
            Customize the meeting notes settings
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="">
            <Label className="text-gray-700 text-sm block">Model</Label>
            <Select
              value={formState.selectedModel}
              onValueChange={(value) =>
                setFormState({ ...formState, selectedModel: value })
              }
            >
              <SelectTrigger className="bg-white border-gray-300 text-gray-900 cursor-pointer w-full">
                <SelectValue placeholder="Select a model..." />
              </SelectTrigger>
              <SelectContent
                className="cursor-pointer w-full z-[9999999] h-full max-h-[250px]"
                position="popper"
                sideOffset={5}
              >
                {models?.map((model: string) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-1 items-center pt-4">
            <Button
              onClick={() => setOpen(false)}
              variant="destructive"
              className="w-full max-w-[100px] hover:bg-red-600 transition-colors cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="default"
              className="bg-indigo-500 hover:bg-indigo-600 text-white w-full max-w-[100px] transition-colors cursor-pointer"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MeetingNotesDialog
