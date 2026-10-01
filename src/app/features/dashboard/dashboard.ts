import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
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
import { Badge } from '../../shared/components/badge/badge';
import { DataTable, TableColumn } from '../../shared/components/data-table/data-table';
import { Icon } from '../../shared/components/icon/icon';

type WeekPeriod = 'current' | 'previous';

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
  imports: [Icon, Badge, DataTable, NgApexchartsModule],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  readonly selectedWeek = signal<WeekPeriod>('current');

  readonly recentOrdersColumns: TableColumn[] = [
    {
      key: 'order',
      label: 'Pedido',
      width: '18%',
    },
    {
      key: 'customer',
      label: 'Cliente',
      width: '24%',
    },
    {
      key: 'status',
      label: 'Estado',
      width: '18%',
    },
    {
      key: 'total',
      label: 'Total',
      width: '16%',
    },
    {
      key: 'date',
      label: 'Fecha',
      width: '18%',
    },
    {
      key: 'actions',
      label: 'Acciones',
      width: '6%',
      align: 'center',
    },
  ];

  private readonly currentWeekData = [10000, 19000, 13000, 26000, 27000, 15000, 22000];

  private readonly previousWeekData = [8000, 15000, 11000, 21000, 23000, 17000, 19000];

  readonly chartSeries = computed<ApexAxisChartSeries>(() => [
    {
      name: 'Ventas',
      data: this.selectedWeek() === 'current' ? this.currentWeekData : this.previousWeekData,
    },
  ]);

  readonly chartOptions: Omit<ChartOptions, 'series'> = {
    chart: {
      type: 'area',
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
      max: 50000,
      tickAmount: 5,
      labels: {
        formatter: (value: number) => `${value / 1000}k`,
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
        data: [42, 31, 24, 18, 12],
      },
    ],

    chart: {
      type: 'bar',
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
      formatter: (value: number) => `${value}%`,
    },

    xaxis: {
      categories: ['Literatura', 'Infantil', 'Académicos', 'Historia', 'Ciencia ficción'],
      min: 0,
      max: 50,
      tickAmount: 5,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        formatter: (value: string) => `${value}%`,
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
        formatter: (value: number) => `${value}% de las ventas`,
      },
    },
  };

  selectWeek(period: WeekPeriod): void {
    this.selectedWeek.set(period);
  }
}
