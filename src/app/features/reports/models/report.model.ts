export type ReportPeriod = '7' | '30' | '90' | 'all';

export type ReportTone = 'success' | 'warning' | 'danger' | 'info';

export interface ReportKpis {
  netSales: number;
  completedSales: number;
  averageTicket: number | null;
  criticalStock: number;
}

export interface ReportStatusMetric {
  key: string;
  label: string;
  count: number;
  percentage: number;
  tone: ReportTone;
}

export interface DailyReportRow {
  date: string;
  sales: number;
  revenue: number | null;
  averageTicket: number | null;
  cancelled: number;
}
