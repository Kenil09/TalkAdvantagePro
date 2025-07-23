// components/ChatSettingsDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRecordingStore } from '@/lib/store/recording.store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ChatSettingsDialog = () => {
  const {
    startWord,
    endWord,
    aiPersonalityName,
    systemPrompt,
    models,
    chatbotSelectedModel,
    setStartWord,
    setEndWord,
    setAiPersonalityName,
    setSystemPrompt,
    fetchModels,
    setSelectedModel,
  } = useRecordingStore()
  const [open, setOpen] = useState<boolean>(false)
  const [formState, setFormState] = useState({
    startWord: '',
    endWord: '',
    aiPersonalityName: '',
    systemPrompt: '',
    selectedModel: '',
  })

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  // When dialog opens, sync local form state from Zustand state
  useEffect(() => {
    if (open) {
      setFormState({
        startWord: startWord || '',
        endWord: endWord || '',
        aiPersonalityName: aiPersonalityName || '',
        systemPrompt: systemPrompt || '',
        selectedModel: chatbotSelectedModel || '',
      })
    }
  }, [
    open,
    startWord,
    endWord,
    aiPersonalityName,
    systemPrompt,
    chatbotSelectedModel,
  ])

  // Handle input change only updates local state
  const onChange =
    (key: keyof typeof formState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [key]: e.target.value }))
    }

  // On save, update Zustand with local form values, which triggers persist/localStorage update
  const handleSave = () => {
    setStartWord(formState.startWord.trim())
    setEndWord(formState.endWord.trim())
    setAiPersonalityName(formState.aiPersonalityName.trim())
    setSystemPrompt(formState.systemPrompt.trim())
    if (process.env.NEXT_PUBLIC_IS_LOCAL_ENVIRONMENT === 'local') {
      setSelectedModel('chatbotSelectedModel', formState.selectedModel)
    }
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
          <DialogTitle>Chatbot settings</DialogTitle>
          <DialogDescription>Customize the chatbot settings</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {process.env.NEXT_PUBLIC_IS_LOCAL_ENVIRONMENT === 'local' && (
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
          )}
          <div className="flex flex-col gap-1">
            <Label className="text-gray-700 text-sm block" htmlFor="startWord">
              Start word
            </Label>
            <Input
              id="startWord"
              placeholder="Start word"
              value={formState.startWord}
              onChange={onChange('startWord')}
              autoComplete="off"
              spellCheck={false}
              type="text"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-gray-700 text-sm block" htmlFor="endWord">
              End word
            </Label>
            <Input
              id="endWord"
              placeholder="End word"
              value={formState.endWord}
              onChange={onChange('endWord')}
              autoComplete="off"
              spellCheck={false}
              type="text"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label
              className="text-gray-700 text-sm block"
              htmlFor="systemPrompt"
            >
              System prompt
            </Label>
            <Input
              id="systemPrompt"
              placeholder="System prompt"
              value={formState.systemPrompt}
              onChange={onChange('systemPrompt')}
              autoComplete="off"
              spellCheck={false}
              type="text"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label
              className="text-gray-700 text-sm block"
              htmlFor="aiPersonalityName"
            >
              AI personality name
            </Label>
            <Input
              id="aiPersonalityName"
              placeholder="AI personality name"
              value={formState.aiPersonalityName}
              onChange={onChange('aiPersonalityName')}
              autoComplete="off"
              spellCheck={false}
              type="text"
            />
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

export default ChatSettingsDialog
