import { Fragment } from "react"
import { Card } from '@/components/ui/card'
import { FileAudio, FileText, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Recording, Tag as TagType } from '@/types/library.types'
import {
    format,
    subYears,
    eachDayOfInterval,
} from 'date-fns'
import { cn } from '@/utils/tailwind'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDuration } from '@/utils/date'
import CalendarHeatmap, { CalendarHeatmapValue } from 'react-calendar-heatmap'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { useLibraryStore } from "@/lib/store/library.store"
import { getStatusColor } from "@/constants/library.constants"

const LibraryHeatmap = ({
    filteredRecordings,
    getRecordingsForDate,
    toggleTranscript,
}: {
    filteredRecordings: Recording[]
    getRecordingsForDate: (date: Date) => Recording[]
    toggleTranscript: (id: string) => void
}) => {
    const {
        recordings,
        selectedRecording,
        setSelectedRecording,
        setTranscriptSearchModel,
        setSelectedHeatmapDate,
        selectedHeatmapDate,
    } = useLibraryStore()
    // Generate data for the heatmap
    const generateHeatmapData = () => {
        const endDate = new Date(2026, 0, 1); // January is month 0 (0-indexed)
        const startDate = subYears(endDate, 1); // Go back one year

        const allDates = eachDayOfInterval({ start: startDate, end: endDate });

        const recordingsByDate = filteredRecordings.reduce(
            (acc, recording) => {
                const dateStr = format(new Date(recording.recording_date), 'yyyy-MM-dd');
                acc[dateStr] = (acc[dateStr] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const values: CalendarHeatmapValue[] = allDates.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            return {
                date: dateStr,
                count: recordingsByDate[dateStr] || 0,
            };
        });

        return {
            startDate,
            endDate,
            values,
        };
    };

    const heatmapData = generateHeatmapData()

    return (
        <Fragment>
            <div className="space-y-6">
                {/* Heatmap Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Meeting Activity
                        </h2>
                        <p className="text-gray-500 mt-1">
                            Last 12 months of meeting patterns
                        </p>
                    </div>
                </div>

                {/* Heatmap Grid */}
                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 w-full overflow-hidden">
                    <div className="space-y-3">
                        {/* React Calendar Heatmap */}
                        <div className="react-calendar-heatmap-wrapper">
                            <CalendarHeatmap
                                startDate={heatmapData.startDate}
                                endDate={heatmapData.endDate}
                                values={heatmapData.values}
                                showWeekdayLabels={true}
                                showMonthLabels={true}
                                horizontal={true}
                                gutterSize={1}
                                monthLabels={[
                                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                                ]}
                                classForValue={(value) => {
                                    if (!value || value.count === 0) {
                                        return 'color-empty';
                                    }
                                    if (value.count === 1) return 'color-scale-1';
                                    if (value.count === 2) return 'color-scale-2';
                                    return 'color-scale-3';
                                }}
                                tooltipDataAttrs={(value) => {
                                    if (!value || !value.date) {
                                        return { 'data-tooltip-id': 'calendar-tooltip', 'data-tooltip-content': 'No recordings' };
                                    }
                                    const dateObj = new Date(value.date);
                                    const dateStr = format(dateObj, 'MMM d, yyyy');
                                    const count = value.count || 0;
                                    const recordingText = count === 1 ? 'meeting' : 'meetings';
                                    const content = count > 0 ? `${dateStr}: ${count} ${recordingText}` : `${dateStr}: No recordings`;
                                    return {
                                        'data-tooltip-id': 'calendar-tooltip',
                                        'data-tooltip-content': content,
                                    };
                                }}
                                onClick={(value) => {
                                    if (value && value.date) {
                                        const date = new Date(value.date);
                                        setSelectedHeatmapDate(date);
                                        const dayRecordings = getRecordingsForDate(date);
                                        if (dayRecordings.length > 0) {
                                            setSelectedRecording(dayRecordings[0]);
                                        }
                                    }
                                }}
                            />
                            <ReactTooltip id="calendar-tooltip" />
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-xs font-medium text-gray-500">Less</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-sm bg-gray-100"></div>
                                <div className="w-3 h-3 rounded-sm bg-green-200"></div>
                                <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                                <div className="w-3 h-3 rounded-sm bg-green-600"></div>
                            </div>
                            <span className="text-xs font-medium text-gray-500">More</span>
                        </div>
                    </div>

                    {/* Activity Summary */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {recordings.length}
                                </p>
                                <p className="text-xs lg:text-sm text-gray-500">Total Recordings</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {
                                        new Set(
                                            recordings.map(
                                                (recording) => recording.recording_date,
                                            ),
                                        ).size
                                    }
                                </p>
                                <p className="text-xs lg:text-sm text-gray-500">Active days</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {(
                                        recordings.length /
                                        new Set(
                                            recordings.map(
                                                (recording) => recording.recording_date,
                                            ),
                                        ).size
                                    ).toFixed(1)}
                                </p>
                                <p className="text-xs lg:text-sm text-gray-500">Avg per day</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {recordings.length > 0
                                        ? Object.entries(
                                            recordings.reduce(
                                                (acc, recording) => {
                                                    const month = new Date(
                                                        recording.recording_date,
                                                    ).toLocaleString('default', { month: 'long' })
                                                    acc[month] = (acc[month] || 0) + 1
                                                    return acc
                                                },
                                                {} as Record<string, number>,
                                            ),
                                        ).sort((a, b) => b[1] - a[1])[0][0]
                                        : '-'}
                                </p>
                                <p className="text-xs lg:text-sm text-gray-500">Most active month</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Day Recordings */}
                {selectedHeatmapDate && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Recordings for {format(selectedHeatmapDate, 'MMMM d, yyyy')}
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedHeatmapDate(null)}
                                className="cursor-pointer"
                            >
                                Clear selection
                            </Button>
                        </div>

                        {(() => {
                            const dayRecordings =
                                getRecordingsForDate(selectedHeatmapDate)

                            if (dayRecordings.length === 0) {
                                return (
                                    <div className="text-center py-8 text-gray-500">
                                        <FileAudio className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>No recordings found for this day</p>
                                    </div>
                                )
                            }

                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {dayRecordings.map((recording) => (
                                        <Card
                                            key={recording.id}
                                            className={cn(
                                                'cursor-pointer transition-all hover:shadow-md',
                                                selectedRecording?.id === recording.id &&
                                                'ring-2 ring-blue-500',
                                            )}
                                            onClick={() => setSelectedRecording(recording)}
                                        >
                                            <CardContent className="px-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="w-full flex justify-between items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <FileAudio className="w-5 h-5 text-blue-600" />
                                                        </div>

                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900 mb-1">
                                                                {recording.filename}
                                                            </h4>
                                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                                <span>{recording.recording_time}</span>
                                                                <span>•</span>
                                                                <span>
                                                                    {formatDuration(recording.duration)}
                                                                </span>
                                                                <span>•</span>
                                                                <span>
                                                                    {recording.participants} participants
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Badge
                                                                    className={getStatusColor(
                                                                        recording.status || 'processing',
                                                                    )}
                                                                >
                                                                    {recording.status || 'processing'}
                                                                </Badge>
                                                                {recording.transcript && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="gap-1 cursor-pointer"
                                                                        onClick={() => {
                                                                            setTranscriptSearchModel(true)
                                                                            toggleTranscript(recording.id)
                                                                        }}
                                                                    >
                                                                        <FileText className="w-3 h-3" />
                                                                        Transcript
                                                                    </Badge>
                                                                )}
                                                                <div className="flex gap-1">
                                                                    {JSON.parse(recording?.tags || '[]')
                                                                        .slice(0, 3)
                                                                        .map((tag: TagType) => (
                                                                            <Badge
                                                                                key={tag.id}
                                                                                variant="secondary"
                                                                                className="text-xs"
                                                                            >
                                                                                {tag.name}
                                                                            </Badge>
                                                                        ))}
                                                                    {JSON.parse(recording?.tags || '[]')
                                                                        .length > 3 && (
                                                                            <Badge
                                                                                variant="secondary"
                                                                                className="text-xs"
                                                                            >
                                                                                +
                                                                                {JSON.parse(recording?.tags || '[]')
                                                                                    .length - 3}
                                                                            </Badge>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button size="sm" variant="ghost">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )
                        })()}
                    </div>
                )}
            </div>
        </Fragment>
    )
}

export default LibraryHeatmap