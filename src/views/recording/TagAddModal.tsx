import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { TAG_COLORS } from '@/utils/date'
import { TagIcon, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Tag } from '@/types/library.types'
import { Dialog } from '@radix-ui/react-dialog'
import { useRecordingStore } from '@/lib/store/recording.store'

const TagAddModal = ({
  isOpen,
  setAddTagModal,
}: {
  isOpen: boolean
  setAddTagModal: (value: boolean) => void
}) => {
  const { tags, setTags } = useRecordingStore()

  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].value)
  const [isSaving, setIsSaving] = useState(false)

  // Group tags by color for better organization
  const groupedTags = useMemo(() => {
    return tags?.reduce((acc, tag) => {
      const colorGroup = acc[tag.color] || []
      return {
        ...acc,
        [tag.color]: [...colorGroup, tag],
      }
    }, {} as Record<string, Tag[]>)
  }, [tags])

  const addTag = () => {
    if (newTagName.trim()) {
      setTags([
        ...(tags || []),
        {
          id: crypto.randomUUID(),
          name: newTagName.trim(),
          color: selectedColor,
        },
      ])
      setNewTagName('')
    }
  }

  const removeTag = (tagId: string) => {
    setTags(tags?.filter((tag) => tag.id !== tagId))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleClose = () => {
    setAddTagModal(false)
    setTags([])
  }

  const handleSave = async () => {
    try {
      if (!tags?.length) return
      setIsSaving(true)

      setAddTagModal(false)
    } catch (error) {
      console.error('Error saving tags:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="!max-w-[500px] max-h-[90vh] p-0 overflow-y-auto bg-white border-gray-200 [&>button]:hidden">
        <DialogHeader className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <DialogTitle className="!text-2xl font-bold text-white flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-white" />
            Add Tags
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

        <div className="space-y-4 p-4">
          {/* Current Tags */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Current Tags ({tags?.length})
              </label>
              {tags?.length && tags?.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  Click on a tag to remove it
                </span>
              )}
            </div>

            {Object.entries(groupedTags || {}).map(([color, colorTags]) => (
              <div key={color} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      TAG_COLORS.find((c) => c.value === color)?.class
                    }`}
                  />
                  <span className="text-xs font-medium">
                    {TAG_COLORS.find((c) => c.value === color)?.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pl-4">
                  {colorTags.map((tag) => (
                    <div
                      key={tag.id}
                      className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity ${
                        TAG_COLORS.find((c) => c.value === color)?.class
                      }`}
                      onClick={() => removeTag(tag.id)}
                      title="Click to remove"
                    >
                      <span>{tag.name}</span>
                      <TagIcon className="h-3 w-3 opacity-50" />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {tags?.length === 0 && (
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 text-center">
                No tags added yet. Add your first tag below.
              </div>
            )}
          </div>

          {/* Add New Tag */}
          <div className="space-y-2 pt-2 border-t">
            <label className="text-sm font-medium">Add New Tag</label>
            <div className="flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter tag name"
                className="flex-1 mt-1"
              />
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-input rounded-md text-sm"
              >
                {TAG_COLORS.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={addTag}
                disabled={!newTagName.trim()}
                className="shrink-0 cursor-pointer text-sm font-medium bg-primary-600 text-white hover:bg-primary-500 "
              >
                Add Tag
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className=" bg-white w-full flex justify-between px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="px-6 text-sm font-medium cursor-pointer"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 text-sm font-medium cursor-pointer"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TagAddModal
