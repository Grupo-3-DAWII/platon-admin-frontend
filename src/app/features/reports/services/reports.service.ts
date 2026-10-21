import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of } from 'rxjs';

import { LOW_STOCK_THRESHOLD } from '../../products/models/product';
import { ProductsService } from '../../products/services/products.service';
import {
  DailyReportRow,
  ReportKpis,
  ReportPeriod,
  ReportStatusMetric,
} from '../models/report.model';

const NO_COUNTS = { total: 0, critical: 0, out: 0 };

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly products = inject(ProductsService);

  readonly period = signal<ReportPeriod>('30');

  private readonly counts = toSignal(
    forkJoin({
      total: this.products.count(),
      critical: this.products.count({ maxStock: LOW_STOCK_THRESHOLD }),
      out: this.products.count({ maxStock: 0 }),
    }).pipe(catchError(() => of(NO_COUNTS))),
    { initialValue: NO_COUNTS },
  );

  readonly kpis = computed<ReportKpis>(() => ({
    netSales: 0,
    completedSales: 0,
    averageTicket: 0,
    criticalStock: this.counts().critical,
  }));

  readonly inventoryStatus = computed<ReportStatusMetric[]>(() => {
    const { total, critical, out } = this.counts();
    const available = total - critical;
    const low = critical - out;

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

  readonly salesStatus = signal<ReportStatusMetric[]>([
    { key: 'delivered', label: 'Entregadas', count: 0, percentage: 0, tone: 'success' },
    { key: 'pending', label: 'Pendientes', count: 0, percentage: 0, tone: 'warning' },
    { key: 'cancelled', label: 'Canceladas', count: 0, percentage: 0, tone: 'danger' },
  ]).asReadonly();

  readonly paymentStatus = signal<ReportStatusMetric[]>([
    { key: 'paid', label: 'Pagado', count: 0, percentage: 0, tone: 'success' },
    { key: 'pending', label: 'Pendiente', count: 0, percentage: 0, tone: 'warning' },
    { key: 'refunded', label: 'Reembolsado', count: 0, percentage: 0, tone: 'danger' },
  ]).asReadonly();

  readonly dailySummary = signal<DailyReportRow[]>([]).asReadonly();

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