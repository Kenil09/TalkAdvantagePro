import React, { useCallback, useMemo } from 'react'
import { TagIcon, X } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import useTagManagement from '@/hooks/useTagManagement'
import { Tag, TagColor } from '@/types/library.types'
import { useLibraryStore } from '@/lib/store/library.store'
import { TAG_COLORS } from '@/utils/date'

const TagFilter = () => {
  const { activeTagFilters, setActiveTagFilters, searchType, setSearchType } =
    useLibraryStore()
  const { recordingTags } = useTagManagement()

  // Add function to get all unique tags
  const getAllUniqueTags = useMemo(() => {
    const uniqueTags = new Map<string, Tag>()
    Object.values(recordingTags).forEach((tags) => {
      tags.forEach((tag) => {
        const key = `${tag.name}-${tag.color}`
        if (!uniqueTags.has(key)) {
          uniqueTags.set(key, tag)
        }
      })
    })
    return Array.from(uniqueTags.values())
  }, [recordingTags])

  // Memoize search type change handler
  const handleSearchTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSearchType(e.target.value as 'transcript' | 'tags')
    },
    [setSearchType],
  )

  return (
    <React.Fragment>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 flex items-center gap-1"
            >
              <TagIcon className="h-3.5 w-3.5" />
              <span>Filter by Tags</span>
              {activeTagFilters.length > 0 && (
                <span className="ml-1 bg-primary/20 text-primary rounded-full px-1.5 text-xs">
                  {activeTagFilters.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Filter by Tags</h4>
              {getAllUniqueTags.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {getAllUniqueTags.map((tag: Tag) => (
                      <div
                        key={`${tag.name}-${tag.color}`}
                        className={`px-2 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all
                            ${
                              TAG_COLORS.find(
                                (c: TagColor) => c.value === tag.color,
                              )?.class
                            }
                            ${
                              activeTagFilters.some(
                                (t) =>
                                  t.name === tag.name && t.color === tag.color,
                              )
                                ? 'ring-2 ring-primary shadow-sm'
                                : 'opacity-70 hover:opacity-100'
                            }`}
                        onClick={() => {
                          setActiveTagFilters((prev) => {
                            const isSelected = prev.some(
                              (t) =>
                                t.name === tag.name && t.color === tag.color,
                            )
                            if (isSelected) {
                              return prev.filter(
                                (t) =>
                                  t.name !== tag.name || t.color !== tag.color,
                              )
                            } else {
                              return [...prev, tag]
                            }
                          })
                        }}
                      >
                        {tag.name}
                      </div>
                    ))}
                  </div>
                  {activeTagFilters.length > 0 && (
                    <div className="pt-2 flex justify-between items-center border-t">
                      <span className="text-xs text-muted-foreground">
                        {activeTagFilters.length} tag
                        {activeTagFilters.length !== 1 ? 's' : ''} selected
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTagFilters([])}
                        className="h-7 px-2 text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-2">
                  No tags available
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Tag Filters Display */}
        {activeTagFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeTagFilters.map((tag) => (
              <div
                key={`${tag.name}-${tag.color}`}
                className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1
                    ${TAG_COLORS.find((c) => c.value === tag.color)?.class}`}
              >
                {tag.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                  onClick={() =>
                    setActiveTagFilters((prev) =>
                      prev.filter(
                        (t) => t.name !== tag.name || t.color !== tag.color,
                      ),
                    )
                  }
                >
                  <X className="h-3 w-3 text-red-600 dark:text-red-400" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs hover:bg-red-100 dark:hover:bg-red-900/30"
              onClick={() => setActiveTagFilters([])}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>
      <select
        className="h-7 text-xs bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={searchType}
        onChange={handleSearchTypeChange}
      >
        <option value="transcript">Transcript</option>
        <option value="tags">Tags</option>
      </select>
    </React.Fragment>
  )
}

export default TagFilter
