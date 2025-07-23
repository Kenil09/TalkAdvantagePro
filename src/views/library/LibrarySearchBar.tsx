import React, { useCallback, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import debounce from 'lodash.debounce'
import { createClient } from '@/lib/supabase/client'
import { useLibraryStore } from '@/lib/store/library.store'
import { DATABASE_TABLE } from "@/config"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Filter,
  CalendarIcon,
  Grid3X3,
  List,
  SortAsc,
  Activity,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/lib/store/auth.store"

const LibrarySearchBar = () => {
  const {
    setRecordings,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    setSearchQuery,
    searchQuery,
    sortOrder,
    dateRange,
    setDateRange,
  } = useLibraryStore()
  const { user } = useAuthStore()

  const fetchRecordings = useCallback(async () => {
    if (!user?.id) return setRecordings([])

    const supabase = createClient()
    let query = supabase
      .from(DATABASE_TABLE.RECORDINGS)
      .select('*')
      .eq('user_id', user.id)

    // Filter by date range
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from)
      if (!isNaN(fromDate.getTime())) {
        query = query.gte('recording_date', fromDate.toISOString())
        if (dateRange.to) {
          const endOfDay = new Date(dateRange.to)
          endOfDay.setHours(23, 59, 59, 999)
          query = query.lte('recording_date', endOfDay.toISOString())
        }
      }
    }

    // Filter by search
    if (searchQuery?.trim()) {
      query = query.or(
        `filename.ilike.%${searchQuery}%,filepath.ilike.%${searchQuery}%,transcript.ilike.%${searchQuery}%`
      )
    }

    // Dynamic sorting
    const sortFieldMap: Record<string, string> = {
      date: 'recording_date',
      filename: 'filename',
      duration: 'duration',
    }

    const sortField = sortFieldMap[sortBy] || 'recording_date'
    query = query.order(sortField, { ascending: sortOrder === 'asc' })

    try {
      const { data, error } = await query
      if (error) throw error
      setRecordings(data || [])
    } catch (error) {
      console.error('Error fetching recordings:', error)
      setRecordings([])
    }
  }, [user?.id, searchQuery, dateRange, sortBy, sortOrder, setRecordings])

  // Debounce the search input changes
  const debouncedFetch = useMemo(() => debounce(fetchRecordings, 400), [fetchRecordings])

  // Run search on query change
  useEffect(() => {
    debouncedFetch()
    return debouncedFetch.cancel
  }, [searchQuery, debouncedFetch])

  // Run fetch on date change
  useEffect(() => {
    fetchRecordings()
  }, [fetchRecordings])

  return (
    <div>
      <div className="flex items-center gap-2 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search recordings, tags, or participants..."
            className="pl-12 py-4.5 rounded-sm text-base bg-white dark:bg-slate-900 placeholder:text-gray-600"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              debouncedFetch()
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault()
                const input = e.target as HTMLInputElement
                input.select()
              }
            }}
          />
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 cursor-pointer">
                <CalendarIcon className="w-4 h-4" />
                Date Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-white cursor-pointer">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-white cursor-pointer">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
              <SelectItem value="filename">File Name</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`rounded-r-none cursor-pointer ${viewMode === 'list' ? '' : 'bg-white'
                }`}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`rounded-none border-x cursor-pointer ${viewMode === 'grid' ? '' : 'bg-white'
                }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={`rounded-none border-x  cursor-pointer ${viewMode === 'calendar' ? '' : 'bg-white'
                }`}
            >
              <CalendarIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'heatmap' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('heatmap')}
              className={`rounded-l-none cursor-pointer ${viewMode === 'heatmap' ? '' : 'bg-white'
                }`}
            >
              <Activity className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LibrarySearchBar
