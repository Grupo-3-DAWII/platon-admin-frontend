import { RouterLink } from '@angular/router';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexMarkers,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { DataTable, TableColumn } from '../../shared/components/data-table/data-table';
import { Icon } from '../../shared/components/icon/icon';

import { DashboardService, WeekPeriod } from './dashboard.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderProgress } from '../orders/components/order-progress/order-progress';

interface ChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  tooltip: ApexTooltip;
  grid: ApexGrid;
  markers: ApexMarkers;
  colors: string[];
}

interface CategoryChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
  colors: string[];
}

function getCssVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, Icon, OrderProgress, DataTable, NgApexchartsModule, CurrencyPipe, DatePipe],
  providers: [DashboardService],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  readonly data = inject(DashboardService);
  readonly selectedWeek = this.data.selectedWeek;
  readonly salesTotalLabel = computed(
    () =>
      `S/ ${this.data.salesTotal().toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  );
  readonly categorySeries = computed<ApexAxisChartSeries>(() => [
    {
      name: 'Unidades vendidas',
      data: this.data.categories().map((category) => category.quantity),
    },
  ]);
  readonly categoryXAxis = computed<ApexXAxis>(() => ({
    ...this.categoryChartOptions.xaxis,
    categories: this.data.categories().map((category) => category.name),
  }));

  readonly recentOrdersColumns: TableColumn[] = [
    {
      key: 'order',
      label: 'Pedido',
      width: '18%',
    },
    {
      key: 'customer',
      label: 'Cliente',
      width: '25%',
    },
    {
      key: 'status',
      label: 'Estado',
      width: '18%',
    },
    {
      key: 'total',
      label: 'Total',
      width: '19%',
    },
    {
      key: 'date',
      label: 'Fecha',
      width: '20%',
    },
  ];

  readonly chartSeries = computed<ApexAxisChartSeries>(() => [
    { name: 'Ventas pagadas', data: this.data.weeklySales() },
  ]);

  readonly chartOptions: Omit<ChartOptions, 'series'> = {
    chart: {
      type: 'area',
      width: '100%',
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
      height: 330,
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
      size: 0,
      hover: {
        size: 5,
      },
    },

    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0,
        opacityFrom: 0.28,
        opacityTo: 0.03,
        stops: [0, 90, 100],
      },
    },

    xaxis: {
      categories: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
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
    },

    yaxis: {
      min: 0,
      tickAmount: 5,
      labels: {
        formatter: (value: number) =>
          `S/ ${value.toLocaleString('es-PE', { notation: 'compact' })}`,
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
        formatter: (value: number) => `S/ ${value.toLocaleString('es-PE')}`,
      },
    },
  };

  readonly categoryChartOptions: CategoryChartOptions = {
    series: [
      {
        name: 'Ventas',
        data: [],
      },
    ],

    chart: {
      type: 'bar',
      width: '100%',
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
      height: 285,
      toolbar: {
        show: false,
      },
      fontFamily: 'Satoshi, sans-serif',
      animations: {
        enabled: true,
        speed: 850,
        animateGradually: {
          enabled: true,
          delay: 120,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },

    colors: [
      getCssVariable('--color-card-sales-icon-bg'),
      getCssVariable('--color-card-orders-icon-bg'),
      getCssVariable('--color-accent'),
      getCssVariable('--color-info'),
      getCssVariable('--color-success'),
    ],

    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 8,
        borderRadiusApplication: 'end',
        barHeight: '38%',
      },
    },

    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      offsetX: 8,
      style: {
        fontSize: '11px',
        fontFamily: 'Satoshi, sans-serif',
        fontWeight: 500,
        colors: [getCssVariable('--color-ink-muted')],
      },
      formatter: (value: number) => `${value}`,
    },

    xaxis: {
      categories: [],
      min: 0,
      tickAmount: 5,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        formatter: (value: string) => `${value}`,
        style: {
          colors: getCssVariable('--color-ink-soft'),
          fontSize: '10px',
          fontFamily: 'Satoshi, sans-serif',
          fontWeight: 400,
        },
      },
    },

    yaxis: {
      labels: {
        maxWidth: 125,
        style: {
          colors: [getCssVariable('--color-ink-muted')],
          fontSize: '12px',
          fontFamily: 'Satoshi, sans-serif',
          fontWeight: 500,
        },
      },
    },

    grid: {
      borderColor: getCssVariable('--color-border-soft'),
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
      padding: {
        top: 4,
        right: 18,
        bottom: 0,
        left: 0,
      },
    },

    tooltip: {
      theme: 'light',
      y: {
        formatter: (value: number) => `${value} unidades vendidas`,
      },
    },
  };

  selectWeek(period: WeekPeriod): void {
    this.selectedWeek.set(period);
  }
}
