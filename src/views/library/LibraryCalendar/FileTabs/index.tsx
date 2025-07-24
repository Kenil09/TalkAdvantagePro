// import { useCallback, useMemo } from 'react'
// import { useLibraryStore } from '@/lib/store/library.store'
// import { endOfDay, isWithinInterval, startOfDay } from 'date-fns'
// import { Calendar, FolderOpen } from 'lucide-react'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import useTagManagement from '@/hooks/useTagManagement'
// import RenderRecordingItem from '@/views/library/LibraryCalendar/FileTabs/RenderRecordingItem'

// function FileTabs() {
//   const { recordingTags } = useTagManagement()
//   const {
//     setSortOrder,
//     setSortBy,
//     isLoading,
//     sortBy,
//     sortOrder,
//     selectedHourRecordings,
//     activeTagFilters,
//     dateRange,
//     isWeekView,
//     viewMode,
//     selectedDate,
//     searchQuery,
//     transcriptSearchResults,
//     recordings,
//     currentWeek,
//     durationRange,
//     durationUnit,
//     selectedHourInfo,
//   } = useLibraryStore()
//   const currentWeekRecordings = useMemo(() => {
//     if (!recordings.length || currentWeek === 0) return []

//     // Calculate the date range for the selected week
//     const currentDate = new Date()
//     const year = currentDate.getFullYear()
//     const firstDayOfYear = new Date(year, 0, 1)

//     // Adjust to get the first Sunday of the year
//     const daysOffset = firstDayOfYear.getDay()
//     const firstSundayOfYear = new Date(firstDayOfYear)
//     if (daysOffset > 0) {
//       firstSundayOfYear.setDate(firstDayOfYear.getDate() + (7 - daysOffset))
//     }

//     // Get the start date for the week
//     const startOfWeek = new Date(firstSundayOfYear)
//     startOfWeek.setDate(firstSundayOfYear.getDate() + (currentWeek - 1) * 7)
//     startOfWeek.setHours(0, 0, 0, 0)

//     const endOfWeek = new Date(startOfWeek)
//     endOfWeek.setDate(startOfWeek.getDate() + 6)
//     endOfWeek.setHours(23, 59, 59, 999)

//     return recordings.filter((recording) => {
//       const recordingDate = new Date(recording.recording_date)
//       return recordingDate >= startOfWeek && recordingDate <= endOfWeek
//     })
//   }, [recordings, currentWeek])

//   const getRecordingsForDate = useCallback(
//     (date: Date | null) => {
//       if (
//         !date ||
//         !recordings.length ||
//         !(date instanceof Date) ||
//         isNaN(date.getTime())
//       ) {
//         return []
//       }

//       return recordings.filter((recording) => {
//         const recordingDate = new Date(recording.recording_date)
//         if (isNaN(recordingDate.getTime())) return false

//         const isOnDate =
//           recordingDate.getDate() === date.getDate() &&
//           recordingDate.getMonth() === date.getMonth() &&
//           recordingDate.getFullYear() === date.getFullYear()

//         // Check if recording is within selected date range
//         const isInRange =
//           dateRange?.from && dateRange?.to
//             ? isWithinInterval(recordingDate, {
//                 start: startOfDay(dateRange.from),
//                 end: endOfDay(dateRange.to),
//               })
//             : true

//         return isOnDate && isInRange
//       })
//     },
//     [recordings, dateRange],
//   )

//   const getDurationInUnit = (
//     seconds: number,
//     unit: 'seconds' | 'minutes' | 'hours',
//   ): number => {
//     switch (unit) {
//       case 'seconds':
//         return seconds
//       case 'minutes':
//         return seconds / 60
//       case 'hours':
//         return seconds / 3600
//       default:
//         return seconds
//     }
//   }

//   const isDurationInRange = useCallback(
//     (duration: number) => {
//       if (!durationRange.min && !durationRange.max) return true
//       const durationInUnit = getDurationInUnit(duration, durationUnit)
//       const min = durationRange.min ? parseFloat(durationRange.min) : 0
//       const max = durationRange.max ? parseFloat(durationRange.max) : Infinity
//       return durationInUnit >= min && durationInUnit <= max
//     },
//     [durationRange, durationUnit],
//   )

//   const filteredDateRecordings = useMemo(() => {
//     const baseRecordings =
//       selectedHourRecordings.length > 0
//         ? selectedHourRecordings
//         : isWeekView && viewMode === 'heatmap'
//           ? currentWeekRecordings
//           : selectedDate
//             ? getRecordingsForDate(selectedDate)
//             : []

//     return baseRecordings.filter((recording) => {
//       // Check duration first
//       if (!isDurationInRange(recording.duration)) return false

//       // Check active tag filters
//       if (activeTagFilters.length > 0) {
//         const recordingTagList = recordingTags[recording.id] || []
//         // Recording must match ALL selected tag filters
//         const hasAllSelectedTags = activeTagFilters.every((filterTag) =>
//           recordingTagList.some(
//             (tag) =>
//               tag.name === filterTag.name && tag.color === filterTag.color,
//           ),
//         )
//         if (!hasAllSelectedTags) return false
//       }

//       // Then check search
//       if (searchQuery.trim()) {
//         // For all search types, check if this recording is in the search results
//         return Boolean(transcriptSearchResults[recording.id])
//       }

//       // If no search query, show all recordings
//       return true
//     })
//   }, [
//     selectedHourRecordings,
//     isWeekView,
//     viewMode,
//     currentWeekRecordings,
//     selectedDate,
//     isDurationInRange,
//     searchQuery,
//     transcriptSearchResults,
//     recordingTags,
//     activeTagFilters,
//     getRecordingsForDate,
//   ])

//   const sortedFilteredDateRecordings = [...filteredDateRecordings].sort(
//     (a, b) => {
//       if (sortBy === 'name') {
//         // Sort by formatted name instead of raw name
//         const nameA = a.filename?.toLowerCase() || ''
//         const nameB = b.filename?.toLowerCase() || ''
//         return sortOrder === 'asc'
//           ? nameA.localeCompare(nameB)
//           : nameB.localeCompare(nameA)
//       } else {
//         // Sort by date
//         const dateA = new Date(a.created_at).getTime()
//         const dateB = new Date(b.created_at).getTime()
//         return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
//       }
//     },
//   )
//   // Update the filteredRecordings useMemo to include selectedRecordings
//   const filteredRecordings = useMemo(() => {
//     return recordings.filter((recording) => {
//       // Check date range first (most efficient)
//       if (!new Date(recording.recording_date)) return false

//       // Check duration next
//       if (!isDurationInRange(recording.duration)) return false

//       // Check active tag filters
//       if (activeTagFilters.length > 0) {
//         const recordingTagList = recordingTags[recording.id] || []
//         // Recording must match ALL selected tag filters
//         const hasAllSelectedTags = activeTagFilters.every((filterTag) =>
//           recordingTagList.some(
//             (tag) =>
//               tag.name === filterTag.name && tag.color === filterTag.color,
//           ),
//         )
//         if (!hasAllSelectedTags) return false
//       }

//       // Finally check search
//       if (searchQuery.trim()) {
//         // For all search types, check if this recording is in the search results
//         return Boolean(transcriptSearchResults[recording.id])
//       }

//       // If no search query, show all recordings
//       return true
//     })
//   }, [
//     recordings,
//     isDurationInRange,
//     searchQuery,
//     transcriptSearchResults,
//     recordingTags,
//     activeTagFilters,
//   ])
//   const sortedFilteredRecordings = [...filteredRecordings].sort((a, b) => {
//     if (sortBy === 'name') {
//       // Sort by formatted name instead of raw name
//       const nameA = a.filename?.toLowerCase() || ''
//       const nameB = b.filename?.toLowerCase() || ''
//       return sortOrder === 'asc'
//         ? nameA.localeCompare(nameB)
//         : nameB.localeCompare(nameA)
//     } else {
//       // Sort by date
//       const dateA = new Date(a.created_at).getTime()
//       const dateB = new Date(b.created_at).getTime()
//       return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
//     }
//   })

//   return (
//     <Tabs defaultValue="by-date">
//       <div className="bg-muted p-2">
//         {/* TabsList styling update: make active tab white, remove colored backgrounds */}
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger
//             value="by-date"
//             className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:text-slate-900 data-[state=active]:dark:text-slate-100"
//           >
//             <Calendar className="h-4 w-4" />
//             {selectedHourInfo
//               ? `${selectedHourInfo.day} ${selectedHourInfo.hour}:00`
//               : viewMode === 'calendar' && selectedDate
//                 ? new Date(selectedDate).toLocaleDateString(undefined, {
//                     month: 'short',
//                     day: 'numeric',
//                   })
//                 : isWeekView && viewMode === 'heatmap'
//                   ? `Week ${currentWeek}`
//                   : 'By Date'}
//           </TabsTrigger>
//           <TabsTrigger
//             value="all-files"
//             className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:text-slate-900 data-[state=active]:dark:text-slate-100"
//           >
//             <FolderOpen className="h-4 w-4" />
//             All Files
//           </TabsTrigger>
//         </TabsList>
//       </div>

//       <div className="p-2">
//         {/* Search and Filters */}
//         <div className="space-y-3 mb-4">
//           {/* Sort Controls */}
//           <div className="flex justify-between items-center">
//             <div className="text-xs text-muted-foreground">Sort by:</div>
//             <div className="flex gap-2">
//               <button
//                 className={`px-2 py-1 text-xs rounded ${
//                   sortBy === 'name'
//                     ? 'bg-primary text-primary-foreground'
//                     : 'bg-muted hover:bg-muted/80'
//                 }`}
//                 onClick={() => {
//                   if (sortBy === 'name') {
//                     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
//                   } else {
//                     setSortBy('name')
//                     setSortOrder('asc')
//                   }
//                 }}
//               >
//                 Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
//               </button>
//               <button
//                 className={`px-2 py-1 text-xs rounded ${
//                   sortBy === 'date'
//                     ? 'bg-primary text-primary-foreground'
//                     : 'bg-muted hover:bg-muted/80'
//                 }`}
//                 onClick={() => {
//                   if (sortBy === 'date') {
//                     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
//                   } else {
//                     setSortBy('date')
//                     setSortOrder('desc')
//                   }
//                 }}
//               >
//                 Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
//               </button>
//             </div>
//           </div>
//         </div>

//         <TabsContent value="by-date" className="h-[600px] overflow-y-auto">
//           {isLoading ? (
//             <div className="flex items-center justify-center h-full text-muted-foreground">
//               Loading recordings...
//             </div>
//           ) : sortedFilteredDateRecordings.length > 0 ||
//             (selectedHourInfo && selectedHourRecordings.length > 0) ? (
//             <div className="space-y-2">
//               {/* Selected Hour Info */}
//               {selectedHourInfo && (
//                 <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-md mb-3 text-xs">
//                   <div className="flex items-center justify-between">
//                     <div className="font-medium text-emerald-700 dark:text-emerald-300">
//                       {selectedHourInfo.day} {selectedHourInfo.hour}:00
//                     </div>
//                     <div className="text-slate-600 dark:text-slate-400">
//                       {selectedHourRecordings.length} recordings
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {isWeekView && !selectedHourInfo && viewMode === 'heatmap' && (
//                 <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-md mb-3 text-xs">
//                   <div className="flex items-center justify-between">
//                     <div className="font-medium text-emerald-700 dark:text-emerald-300">
//                       Week {currentWeek}
//                     </div>
//                     <div className="text-slate-600 dark:text-slate-400">
//                       {currentWeekRecordings.length} recordings
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {selectedDate && viewMode === 'calendar' && !selectedHourInfo && (
//                 <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-md mb-3 text-xs">
//                   <div className="flex items-center justify-between">
//                     <div className="font-medium text-emerald-700 dark:text-emerald-300">
//                       {new Date(selectedDate).toLocaleDateString(undefined, {
//                         weekday: 'long',
//                         day: 'numeric',
//                         month: 'long',
//                         year: 'numeric',
//                       })}
//                     </div>
//                     <div className="text-slate-600 dark:text-slate-400">
//                       {getRecordingsForDate(selectedDate).length} recordings
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {(selectedHourRecordings.length > 0
//                 ? selectedHourRecordings
//                 : sortedFilteredDateRecordings
//               ).map((recording, key) => (
//                 <RenderRecordingItem key={key} recording={recording} />
//               ))}
//             </div>
//           ) : (
//             <div className="flex items-center justify-center h-full text-muted-foreground">
//               {selectedHourInfo
//                 ? 'No recordings found for this hour'
//                 : isWeekView
//                   ? searchQuery && currentWeekRecordings.length > 0
//                     ? 'No recordings matching your search for this week'
//                     : 'No recordings for this week'
//                   : selectedDate
//                     ? searchQuery &&
//                       getRecordingsForDate(selectedDate).length > 0
//                       ? 'No recordings matching your search for this date'
//                       : 'No recordings for this date'
//                     : 'Select a date or hour to view recordings'}
//             </div>
//           )}
//         </TabsContent>

//         <TabsContent value="all-files" className="h-[600px] overflow-y-auto">
//           {isLoading ? (
//             <div className="flex items-center justify-center h-full text-muted-foreground">
//               Loading recordings...
//             </div>
//           ) : sortedFilteredRecordings.length > 0 ? (
//             <div className="space-y-2">
//               {sortedFilteredRecordings.map((recording) => (
//                 <RenderRecordingItem key={recording.id} recording={recording} />
//               ))}
//             </div>
//           ) : (
//             <div className="flex items-center justify-center h-full text-muted-foreground">
//               {searchQuery
//                 ? 'No recordings found matching your search'
//                 : 'No recordings found'}
//             </div>
//           )}
//         </TabsContent>
//       </div>
//     </Tabs>
//   )
// }

// export default FileTabs
