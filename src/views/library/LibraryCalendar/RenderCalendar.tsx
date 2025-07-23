'use client'

import { useMemo } from 'react'
import { useLibraryStore } from '@/lib/store/library.store'
import { endOfDay, isWithinInterval, startOfDay } from 'date-fns'
import clsx from 'clsx'

export default function RenderCalendar() {
  const {
    currentMonth,
    selectedDate,
    dateRange,
    recordings,
    setSelectedHourRecordings,
    setSelectedHourInfo,
    setSelectedDate,
  } = useLibraryStore()

  const getRecordingsCountByDate = () => {
    const result = new Map<
      number,
      { total: number; processed: number; unprocessed: number }
    >()
    recordings.forEach((recording) => {
      const recordingDate = new Date(recording.recording_date)
      if (isNaN(recordingDate.getTime())) return

      if (
        recordingDate.getMonth() === currentMonth.getMonth() &&
        recordingDate.getFullYear() === currentMonth.getFullYear()
      ) {
        const day = recordingDate.getDate()
        const existing = result.get(day) || {
          total: 0,
          processed: 0,
          unprocessed: 0,
        }

        existing.total += 1
        if (recording.is_processed) {
          existing.processed += 1
        } else {
          existing.unprocessed += 1
        }

        result.set(day, existing)
      }
    })
    return result
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const recordingsCountByDate = useMemo(
    () => getRecordingsCountByDate(),
    [recordings, currentMonth],
  )
  const daysInMonth = useMemo(
    () => getDaysInMonth(currentMonth),
    [currentMonth],
  )
  const firstDay = useMemo(
    () => getFirstDayOfMonth(currentMonth),
    [currentMonth],
  )

  const days = []

  // Add empty cells for leading days
  for (let i = 0; i < firstDay; i++) {
    days.push(
      <div
        key={`empty-${i}`}
        className="h-14 border border-blue-100 dark:border-blue-900/20 bg-gray-50/50 dark:bg-blue-950/10 rounded-lg"
      ></div>,
    )
  }

  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      i,
    )
    const isToday = new Date().toDateString() === date.toDateString()
    // const isSelected = selectedDate?.toDateString() === date.toDateString()

    const isSelected =
      selectedDate &&
      new Date(selectedDate).toDateString() === date.toDateString()

    const isInDateRange =
      dateRange?.from &&
      dateRange?.to &&
      isWithinInterval(date, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to),
      })

    // const isRangeStart = dateRange?.from && date?.toDateString() === dateRange?.from?.toDateString()
    // const isRangeEnd = dateRange?.to && date?.toDateString() === dateRange?.to?.toDateString()

    const isRangeStart =
      dateRange?.from &&
      date.toDateString() === new Date(dateRange.from).toDateString()
    const isRangeEnd =
      dateRange?.to &&
      date.toDateString() === new Date(dateRange.to).toDateString()
    const stats = recordingsCountByDate.get(i) || {
      total: 0,
      processed: 0,
      unprocessed: 0,
    }
    const dayClass = clsx(
      'h-10 border rounded-lg p-1 relative cursor-pointer transition-all duration-200 overflow-hidden group',
      isToday &&
        'bg-blue-100/50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
      isSelected
        ? 'ring-2 ring-primary shadow-md'
        : 'shadow-sm hover:shadow hover:bg-blue-50 dark:hover:bg-blue-900/20',
      stats.total > 0 && 'border-blue-200 dark:border-blue-800',
      isInDateRange && 'bg-indigo-50 dark:bg-indigo-900/20',
      isRangeStart && 'border-l-2 border-l-indigo-500',
      isRangeEnd && 'border-r-2 border-r-indigo-500',
    )

    days.push(
      <div
        key={`day-${currentMonth.getMonth()}-${i}`}
        className={dayClass}
        role="button"
        tabIndex={0}
        aria-label={`Day ${i}, ${date.toDateString()}`}
        onClick={() => {
          setSelectedDate(date)
          setSelectedHourRecordings([])
          setSelectedHourInfo(null)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setSelectedDate(date)
            setSelectedHourRecordings([])
            setSelectedHourInfo(null)
          }
        }}
      >
        <div className="flex items-center gap-0.5">
          <span
            className={clsx(
              'text-[10px] font-medium',
              isToday &&
                'text-white bg-primary h-4 w-4 flex items-center justify-center rounded-full',
              isInDateRange && 'text-indigo-700 dark:text-indigo-300',
              (isRangeStart || isRangeEnd) &&
                'text-indigo-800 dark:text-indigo-200 font-semibold',
            )}
          >
            {i}
          </span>
          {isToday && !isSelected && (
            <span className="text-[7px] text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-0.5 rounded-sm">
              Today
            </span>
          )}
          {(isRangeStart || isRangeEnd) && (
            <span className="text-[7px] text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-0.5 rounded-sm">
              {isRangeStart ? 'Start' : 'End'}
            </span>
          )}
        </div>

        {stats.total > 0 && (
          <div className="mt-0.5 overflow-hidden">
            <div className="flex flex-wrap items-center gap-0.5">
              {stats.processed > 0 && (
                <div
                  className="flex items-center gap-0.5 bg-green-50 dark:bg-green-900/20 rounded-full px-1 py-0.5 border border-green-100 dark:border-green-800/30"
                  title={`${stats.processed} processed recordings`}
                >
                  <span className="h-1 w-1 rounded-full bg-green-500 inline-block border border-green-600/50"></span>
                  <span className="text-[8px] font-medium text-green-600 dark:text-green-400">
                    {stats.processed}
                  </span>
                </div>
              )}
              {stats.unprocessed > 0 && (
                <div
                  className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-full px-1 py-0.5 border border-yellow-100 dark:border-yellow-800/30"
                  title={`${stats.unprocessed} unprocessed recordings`}
                >
                  <span className="h-1 w-1 rounded-full bg-yellow-500 inline-block border border-yellow-600/50"></span>
                  <span className="text-[8px] font-medium text-yellow-600 dark:text-yellow-400">
                    {stats.unprocessed}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-1 text-center">
          <div className="text-[10px] font-medium">
            {date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          {stats.total > 0 ? (
            <div className="text-[8px] text-muted-foreground mt-0.5">
              {stats.total} recording{stats.total > 1 ? 's' : ''}
              <div className="text-[7px] mt-0.5">
                <span className="text-green-600 dark:text-green-400">
                  {stats.processed} processed
                </span>
                {stats.unprocessed > 0 && (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    {' '}
                    • {stats.unprocessed} unprocessed
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-[8px] text-muted-foreground mt-0.5">
              No recordings
            </div>
          )}
        </div>
      </div>,
    )
  }

  return <div className="grid grid-cols-7 gap-2">{days}</div>
}
