import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexMarkers,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { Icon } from '../../../../shared/components/icon/icon';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';

import { ReportPeriod } from '../../models/report.model';
import { ReportsService } from '../../services/reports.service';

interface SalesChartOptions {
  chart: ApexChart;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  tooltip: ApexTooltip;
  grid: ApexGrid;
  markers: ApexMarkers;
  yaxis: ApexYAxis;
  colors: string[];
}

function getCssVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DataTable, Icon, NgApexchartsModule, PageHeader, Pagination],
  providers: [ReportsService],
  templateUrl: './reports-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPage {
  readonly reports = inject(ReportsService);

  readonly page = signal(1);
  readonly pageSize = signal(5);

  readonly pageSizeOptions = [5, 10, 25];

  readonly columns: TableColumn[] = [
    {
      key: 'date',
      label: 'Fecha',
      width: '20%',
    },
    {
      key: 'sales',
      label: 'Ventas',
      width: '18%',
    },
    {
      key: 'revenue',
      label: 'Ingresos',
      width: '22%',
    },
    {
      key: 'averageTicket',
      label: 'Ticket promedio',
      width: '24%',
    },
    {
      key: 'cancelled',
      label: 'Canceladas',
      width: '16%',
    },
  ];

  readonly pagedRows = computed(() => {
    const rows = this.reports.dailySummary();

    const start = (this.page() - 1) * this.pageSize();

    return rows.slice(start, start + this.pageSize());
  });

  readonly chartSeries = computed<ApexAxisChartSeries>(() => [
    {
      name: 'Ingresos',
      data: [...this.reports.dailySummary()].reverse().map((row) => row.revenue),
    },
  ]);

  readonly chartXAxis = computed<ApexXAxis>(() => ({
    categories: [...this.reports.dailySummary()]
      .reverse()
      .map((row) => this.formatChartDate(row.date)),

    axisBorder: {
      show: false,
    },

    axisTicks: {
      show: false,
    },

    labels: {
      style: {
        colors: getCssVariable('--color-ink-soft'),
        fontSize: '11px',
        fontFamily: 'Satoshi, sans-serif',
        fontWeight: 400,
      },
    },

    tooltip: {
      enabled: false,
    },
  }));

  readonly chartOptions: SalesChartOptions = {
    chart: {
      type: 'area',
      width: '100%',
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
      height: 280,

      toolbar: {
        show: false,
      },

      zoom: {
        enabled: false,
      },

      fontFamily: 'Satoshi, sans-serif',

      animations: {
        enabled: true,
        speed: 700,
      },
    },

    colors: [getCssVariable('--color-brand')],

    stroke: {
      curve: 'smooth',
      width: 2,
    },

    dataLabels: {
      enabled: false,
    },

    markers: {
      size: 4,

      strokeWidth: 2,

      hover: {
        size: 6,
      },
    },

    fill: {
      type: 'gradient',

      gradient: {
        shadeIntensity: 0,
        opacityFrom: 0.25,
        opacityTo: 0.02,
        stops: [0, 90, 100],
      },
    },

    yaxis: {
      min: 0,

      labels: {
        formatter: (value: number) => `S/ ${Math.round(value).toLocaleString('es-PE')}`,

        style: {
          colors: [getCssVariable('--color-ink-soft')],

          fontSize: '11px',

          fontFamily: 'Satoshi, sans-serif',

          fontWeight: 400,
        },
      },
    },

    grid: {
      borderColor: getCssVariable('--color-border-soft'),

      strokeDashArray: 0,

      xaxis: {
        lines: {
          show: false,
        },
      },

      yaxis: {
        lines: {
          show: true,
        },
      },

      padding: {
        left: 4,
        right: 4,
      },
    },

    tooltip: {
      theme: 'light',

      y: {
        formatter: (value: number) =>
          `S/ ${value.toLocaleString('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      },
    },
  };

  onPeriodChange(event: Event): void {
    const target = event.target as HTMLSelectElement;

    this.reports.setPeriod(target.value as ReportPeriod);

    this.page.set(1);
  }

  setPage(page: number): void {
    this.page.set(page);
  }

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }

  exportReport(): void {
    const rows = this.reports.dailySummary();

    const header = ['Fecha', 'Ventas', 'Ingresos', 'Ticket promedio', 'Canceladas'];

    const content = rows.map((row) => [
      row.date,
      row.sales,
      row.revenue.toFixed(2),
      row.averageTicket.toFixed(2),
      row.cancelled,
    ]);

    const csv = [header.join(';'), ...content.map((row) => row.join(';'))].join('\n');

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = 'reporte-platon.csv';

    link.click();

    URL.revokeObjectURL(url);
  }

  private formatChartDate(date: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(`${date}T00:00:00`));
  }
}
