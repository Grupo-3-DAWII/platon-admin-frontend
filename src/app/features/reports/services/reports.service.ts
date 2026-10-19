import { computed, inject, Injectable, signal } from '@angular/core';

import { ProductsService } from '../../products/services/products.service';
import { SalesService } from '../../sales/services/sales.service';
import {
  DailyReportRow,
  ReportKpis,
  ReportPeriod,
  ReportStatusMetric,
} from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly sales = inject(SalesService).sales;

  private readonly products = inject(ProductsService).books;

  readonly period = signal<ReportPeriod>('30');

  readonly periodSales = computed(() => {
    const period = this.period();
    const sales = this.sales();

    if (period === 'all') {
      return sales;
    }

    const days = Number(period);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (days - 1));

    return sales.filter((sale) => {
      const date = new Date(sale.createdAt);

      return date >= startDate && date <= endDate;
    });
  });

  readonly kpis = computed<ReportKpis>(() => {
    const sales = this.periodSales();

    const paidSales = sales.filter((sale) => sale.paymentStatus === 'paid');

    const completedSales = sales.filter((sale) => sale.status !== 'cancelled');

    const netSales = paidSales.reduce((total, sale) => total + sale.total, 0);

    const averageTicket = paidSales.length > 0 ? netSales / paidSales.length : 0;

    const criticalStock = this.products().filter(
      (product) => product.status === 'low' || product.status === 'out',
    ).length;

    return {
      netSales,
      completedSales: completedSales.length,
      averageTicket,
      criticalStock,
    };
  });

  readonly inventoryStatus = computed<ReportStatusMetric[]>(() => {
    const products = this.products();

    const total = products.length;

    const available = products.filter((product) => product.status === 'available').length;

    const low = products.filter((product) => product.status === 'low').length;

    const out = products.filter((product) => product.status === 'out').length;

    return [
      {
        key: 'available',
        label: 'Disponibles',
        count: available,
        percentage: this.percentage(available, total),
        tone: 'success',
      },
      {
        key: 'low',
        label: 'Bajo stock',
        count: low,
        percentage: this.percentage(low, total),
        tone: 'warning',
      },
      {
        key: 'out',
        label: 'Agotados',
        count: out,
        percentage: this.percentage(out, total),
        tone: 'danger',
      },
    ];
  });

  readonly salesStatus = computed<ReportStatusMetric[]>(() => {
    const sales = this.periodSales();

    const total = sales.length;

    const delivered = sales.filter((sale) => sale.status === 'delivered').length;

    const pending = sales.filter((sale) => sale.status === 'pending').length;

    const cancelled = sales.filter((sale) => sale.status === 'cancelled').length;

    return [
      {
        key: 'delivered',
        label: 'Entregadas',
        count: delivered,
        percentage: this.percentage(delivered, total),
        tone: 'success',
      },
      {
        key: 'pending',
        label: 'Pendientes',
        count: pending,
        percentage: this.percentage(pending, total),
        tone: 'warning',
      },
      {
        key: 'cancelled',
        label: 'Canceladas',
        count: cancelled,
        percentage: this.percentage(cancelled, total),
        tone: 'danger',
      },
    ];
  });

  readonly paymentStatus = computed<ReportStatusMetric[]>(() => {
    const sales = this.periodSales();

    const total = sales.length;

    const paid = sales.filter((sale) => sale.paymentStatus === 'paid').length;

    const pending = sales.filter((sale) => sale.paymentStatus === 'pending').length;

    const refunded = sales.filter((sale) => sale.paymentStatus === 'refunded').length;

    return [
      {
        key: 'paid',
        label: 'Pagado',
        count: paid,
        percentage: this.percentage(paid, total),
        tone: 'success',
      },
      {
        key: 'pending',
        label: 'Pendiente',
        count: pending,
        percentage: this.percentage(pending, total),
        tone: 'warning',
      },
      {
        key: 'refunded',
        label: 'Reembolsado',
        count: refunded,
        percentage: this.percentage(refunded, total),
        tone: 'danger',
      },
    ];
  });

  readonly dailySummary = computed<DailyReportRow[]>(() => {
    const sales = this.periodSales();

    const grouped = new Map<
      string,
      {
        sales: number;
        revenue: number;
        paidSales: number;
        cancelled: number;
      }
    >();

    for (const sale of sales) {
      const date = sale.createdAt.slice(0, 10);

      const current = grouped.get(date) ?? {
        sales: 0,
        revenue: 0,
        paidSales: 0,
        cancelled: 0,
      };

      if (sale.status === 'cancelled') {
        current.cancelled += 1;
      } else {
        current.sales += 1;
      }

      if (sale.paymentStatus === 'paid') {
        current.revenue += sale.total;

        current.paidSales += 1;
      }

      grouped.set(date, current);
    }

    return Array.from(grouped.entries())
      .map(([date, summary]): DailyReportRow => ({
        date,
        sales: summary.sales,
        revenue: summary.revenue,
        averageTicket: summary.paidSales > 0 ? summary.revenue / summary.paidSales : 0,
        cancelled: summary.cancelled,
      }))
      .sort((first, second) => second.date.localeCompare(first.date));
  });

  setPeriod(period: ReportPeriod): void {
    this.period.set(period);
  }

  private percentage(value: number, total: number): number {
    if (total === 0) {
      return 0;
    }

    return Math.round((value / total) * 100);
  }
}
