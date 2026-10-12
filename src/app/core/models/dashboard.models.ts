export type WidgetType = 'donut' | 'bar' | 'empty' | 'text';

export interface ChartSegment {
  label: string;
  value: number;
  color: string;
}

export interface Widget {
  id: string;
  name: string;
  text: string;
  type: WidgetType;
  segments?: ChartSegment[];
  /** true = shown on the dashboard, false = available but hidden */
  selected: boolean;
}

export interface Category {
  id: string;
  name: string;
  shortName: string;
  widgets: Widget[];
}

export interface DashboardConfig {
  categories: Category[];
}

export interface NewWidget {
  name: string;
  text: string;
}