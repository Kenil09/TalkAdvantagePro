import { useEffect, useMemo, useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { TagIcon } from 'lucide-react'

import { DATABASE_TABLE } from '@/config'
import { createClient } from '@/lib/supabase/client'
import { TAG_COLORS } from '@/utils/date'
import { Tag, Recording } from '@/types/library.types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TagEditorModal = ({
  recording,
  onClose,
  onSave,
}: {
  recording: Recording
  onClose: () => void
  onSave: (tags: Tag[]) => Promise<void>
}) => {
  const [tags, setTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].value)
  const [isSaving, setIsSaving] = useState(false)

  // Load tags from Supabase and set to state
  const fetchTags = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from(DATABASE_TABLE.RECORDINGS)
        .select('tags')
        .eq('id', recording.id)
        .single()

      if (error) throw error

      if (data?.tags) {
        const parsedTags = JSON.parse(data.tags)
        setTags(parsedTags)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }, [recording.id])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  // Group tags by color
  const groupedTags = useMemo(() => {
    return tags.reduce(
      (acc, tag) => {
        const colorGroup = acc[tag.color] || []
        return {
          ...acc,
          [tag.color]: [...colorGroup, tag],
        }
      },
      {} as Record<string, Tag[]>,
    )
  }, [tags])

  const addTag = () => {
    if (newTagName.trim()) {
      setTags([
        ...tags,
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
    setTags(tags.filter((tag) => tag.id !== tagId))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave(tags)
      onClose()
    } catch (error) {
      console.error('Error saving tags:', error)
      alert('Failed to save tags. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-xl flex items-center gap-2">
          <TagIcon className="h-5 w-5 text-primary" />
          Edit Tags
        </DialogTitle>
        <p className="text-sm text-muted-foreground">{recording.filename}</p>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Current Tags */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Current Tags ({tags.length})
            </label>
            {tags.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Click on a tag to remove it
              </span>
            )}
          </div>

          {Object.entries(groupedTags).map(([color, colorTags]) => (
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

          {tags.length === 0 && (
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
              className="flex-1"
            />
            <Select
              value={selectedColor}
              onValueChange={(value) => setSelectedColor(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent className="px-3 py-2 bg-white dark:bg-slate-900 border border-input rounded-md text-sm">
                {TAG_COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    {color.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={addTag}
              disabled={!newTagName.trim()}
              className="shrink-0"
            >
              Add Tag
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default TagEditorModal
