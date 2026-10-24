import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of } from 'rxjs';

import { Order } from '../../orders/models/order';
import { OrdersService } from '../../orders/services/orders.service';
import { LOW_STOCK_THRESHOLD } from '../../products/models/product';
import { ProductsService } from '../../products/services/products.service';
import {
  DailyReportRow,
  ReportKpis,
  ReportPeriod,
  ReportStatusMetric,
  ReportTone,
} from '../models/report.model';

const NO_COUNTS = { total: 0, critical: 0, out: 0 };

const round2 = (n: number) => Math.round(n * 100) / 100;
const sumTotal = (orders: Order[]) => orders.reduce((sum, o) => sum + (o.total ?? 0), 0);

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

@Injectable()
export class ReportsService {
  private readonly products = inject(ProductsService);
  private readonly ordersApi = inject(OrdersService);

  readonly period = signal<ReportPeriod>('30');

  // --- Inventario  ---
  private readonly counts = toSignal(
    forkJoin({
      total: this.products.count(),
      critical: this.products.count({ maxStock: LOW_STOCK_THRESHOLD }),
      out: this.products.count({ maxStock: 0 }),
    }).pipe(catchError(() => of(NO_COUNTS))),
    { initialValue: NO_COUNTS },
  );

  readonly inventoryStatus = computed<ReportStatusMetric[]>(() => {
    const { total, critical, out } = this.counts();
    const available = total - critical;
    const low = critical - out;

    return [
      this.metric('available', 'Disponibles', available, total, 'success'),
      this.metric('low', 'Bajo stock', low, total, 'warning'),
      this.metric('out', 'Agotados', out, total, 'danger'),
    ];
  });

  // --- Pedidos / pagos ---
  private readonly ordersState = toSignal(
    this.ordersApi.getAll().pipe(
      map((orders) => ({ orders, error: false })),
      catchError(() => of({ orders: [] as Order[], error: true })),
    ),
    { initialValue: null },
  );

  readonly loading = computed(() => this.ordersState() === null);
  readonly error = computed(() => this.ordersState()?.error ?? false);

  private readonly periodOrders = computed(() => {
    const orders = this.ordersState()?.orders ?? [];
    const period = this.period();
    if (period === 'all') return orders;

    const since = new Date();
    since.setDate(since.getDate() - (Number(period) - 1));
    const sinceKey = dateKey(since);
    return orders.filter((o) => o.createdAt.slice(0, 10) >= sinceKey);
  });

  private readonly paidOrders = computed(() =>
    this.periodOrders().filter((o) => o.status === 'paid'),
  );

  readonly missingAmountCount = computed(() => this.periodOrders().filter((order) => order.total === null).length);

  readonly kpis = computed<ReportKpis>(() => {
    const paid = this.paidOrders();
    const priced = paid.filter((order) => order.total !== null);
    const netSales = round2(sumTotal(priced));
    return {
      netSales,
      completedSales: paid.length,
      averageTicket: priced.length ? round2(netSales / priced.length) : paid.length ? null : 0,
      criticalStock: this.counts().critical,
    };
  });

  // Por cantidad de pedidos
  readonly salesStatus = computed<ReportStatusMetric[]>(() => {
    const orders = this.periodOrders();
    const count = (status: Order['status']) => orders.filter((o) => o.status === status).length;
    const total = orders.length;
    return [
      this.metric('paid', 'Pagados', count('paid'), total, 'success'),
      this.metric('pending', 'Pendientes', count('pending'), total, 'warning'),
      this.metric('cancelled', 'Cancelados', count('cancelled'), total, 'danger'),
    ];
  });

  // Por monto
  readonly paymentStatus = computed<ReportStatusMetric[]>(() => {
    const orders = this.periodOrders();
    const amount = (status: Order['status']) => sumTotal(orders.filter((o) => o.status === status));
    const paid = amount('paid');
    const pending = amount('pending');
    const cancelled = amount('cancelled');
    const total = paid + pending + cancelled;
    return [
      this.metric('paid', 'Cobrado', paid, total, 'success'),
      this.metric('pending', 'Por cobrar', pending, total, 'warning'),
      this.metric('cancelled', 'Rechazado', cancelled, total, 'danger'),
    ];
  });

  // Más reciente primero
  readonly dailySummary = computed<DailyReportRow[]>(() => {
    const days = new Map<string, { date: string; sales: number; revenue: number; cancelled: number; pricedSales: number }>();

    for (const order of this.periodOrders()) {
      const date = order.createdAt.slice(0, 10);
      const row = days.get(date) ?? { date, sales: 0, revenue: 0, pricedSales: 0, cancelled: 0 };
      if (order.status === 'paid') {
        row.sales += 1;
        if (order.total !== null) {
          row.revenue += order.total;
          row.pricedSales += 1;
        }
      } else if (order.status === 'cancelled') {
        row.cancelled += 1;
      }
      days.set(date, row);
    }

    return [...days.values()]
      .map(({ pricedSales, ...row }) => ({
        ...row,
        revenue: row.sales && !pricedSales ? null : round2(row.revenue),
        averageTicket: pricedSales ? round2(row.revenue / pricedSales) : row.sales ? null : 0,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  });

  setPeriod(period: ReportPeriod): void {
    this.period.set(period);
  }

  private metric(
    key: string,
    label: string,
    count: number,
    total: number,
    tone: ReportTone,
  ): ReportStatusMetric {
    return {
      key,
      label,
      count,
      percentage: total === 0 ? 0 : Math.round((count / total) * 100),
      tone,
    };
  }
}
