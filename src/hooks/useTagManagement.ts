import { DATABASE_TABLE } from '@/config'
import { createClient } from '@/lib/supabase/client'
import { Tag } from '@/types/library.types'
import { useCallback, useEffect, useState } from 'react'

function useTagManagement() {
  const [recordingTags, setRecordingTags] = useState<Record<string, Tag[]>>({})

  const tagsToJSON = (tags: Tag[]): string => {
    return JSON.stringify(
      tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      })),
    )
  }

  const JSONToTags = (jsonString: string | null): Tag[] => {
    if (!jsonString) return []
    try {
      const parsed = JSON.parse(jsonString)
      return parsed.map((tag: { id: string; name: string; color: string }) => ({
        id: tag.id || crypto.randomUUID(),
        name: tag.name,
        color: tag.color,
      }))
    } catch (error) {
      console.error('Error parsing tags JSON:', error)
      return []
    }
  }

  const saveTags = async (recordingId: string, tags: Tag[]) => {
    try {
      console.log('Saving tags for recording:', { recordingId, tags })
      const tagsJSON = tagsToJSON(tags)
      // Save tags in Supabase
      const supabase = createClient()
      const { error } = await supabase
        .from(DATABASE_TABLE.RECORDINGS)
        .update({
          tags: tagsJSON,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recordingId)

      if (error) {
        throw error
      }
      console.log('Tags saved to cloud:', { recordingId, tags })

      // Update local state
      setRecordingTags((prev) => {
        const newTags = {
          ...prev,
          [recordingId]: tags,
        }
        console.log('Updated tags in state:', newTags)
        return newTags
      })
    } catch (error) {
      console.error('Error saving tags:', error)
      throw error
    }
  }

  const loadTags = useCallback(async () => {
    try {
      // Load tags from Supabase recordings table
      const supabase = createClient()
      const { data, error } = await supabase
        .from(DATABASE_TABLE.RECORDINGS)
        .select('id, tags')

      if (error) {
        throw error
      }

      const tags: Record<string, Tag[]> = {}
      data?.forEach((recording) => {
        if (recording.tags) {
          tags[recording.id] = JSONToTags(recording.tags)
        }
      })
      setRecordingTags(tags)
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }, [])

  // Load tags when storage location changes
  useEffect(() => {
    loadTags()
  }, [loadTags])

  return {
    recordingTags,
    saveTags,
    loadTags,
  }
}

export default useTagManagement
