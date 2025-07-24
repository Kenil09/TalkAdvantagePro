declare module 'react-calendar-heatmap' {
  export interface CalendarHeatmapValue {
    date: string;
    count: number;
  }

  export interface CalendarHeatmapProps {
    values: CalendarHeatmapValue[];
    startDate: Date;
    endDate: Date;
    showMonthLabels?: boolean;
    showWeekdayLabels?: boolean;
    horizontal?: boolean;
    gutterSize?: number;
    monthLabels?: string[];
    weekLabels?: string[];
    classForValue?: (value: CalendarHeatmapValue | null) => string | null;
    tooltipDataAttrs?: (value: CalendarHeatmapValue | null) => { [key: string]: string };
    onClick?: (value: CalendarHeatmapValue | null) => void;
  }

  export default function CalendarHeatmap(props: CalendarHeatmapProps): JSX.Element;
}
