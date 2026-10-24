import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReportsService } from './reports.service';
import { ProductsService } from '../../products/services/products.service';
import { OrdersService } from '../../orders/services/orders.service';
import { Order } from '../../orders/models/order';

function order(id: number, total: number | null, status: Order['status'] = 'paid'): Order {
  return { id, total, status, createdAt: '2026-10-01T12:00:00', customerName: 'Cliente', items: [] };
}
function reportsFor(orders: Order[]): ReportsService {
  TestBed.configureTestingModule({ providers: [ReportsService,
    { provide: ProductsService, useValue: { count: () => of(0) } },
    { provide: OrdersService, useValue: { getAll: () => of(orders) } },
  ] });
  const reports = TestBed.inject(ReportsService);
  reports.setPeriod('all');
  return reports;
}
describe('Report amounts', () => {
  it('excludes unknown amounts from the average without hiding the paid order count', () => {
    const reports = reportsFor([order(1, 153), order(2, null), order(3, 200, 'pending')]);
    expect(reports.kpis().netSales).toBe(153);
    expect(reports.kpis().completedSales).toBe(2);
    expect(reports.kpis().averageTicket).toBe(153);
    expect(reports.missingAmountCount()).toBe(1);
    expect(reports.dailySummary()[0]).toMatchObject({ sales: 2, revenue: 153, averageTicket: 153 });
  });
  it('keeps a genuine zero amount distinct from an unknown amount', () => {
    const reports = reportsFor([order(1, 0), order(2, null)]);
    expect(reports.kpis().averageTicket).toBe(0);
    expect(reports.dailySummary()[0].revenue).toBe(0);
  });
  it('leaves unrecorded daily amounts empty instead of inventing zero sales values', () => {
    const reports = reportsFor([order(1, null)]);
    expect(reports.kpis().averageTicket).toBeNull();
    expect(reports.dailySummary()[0]).toMatchObject({ sales: 1, revenue: null, averageTicket: null });
  });
  it('returns zero for an empty period', () => {
    const reports = reportsFor([]);
    expect(reports.kpis().averageTicket).toBe(0);
    expect(reports.dailySummary()).toEqual([]);
    expect(reports.missingAmountCount()).toBe(0);
  });
});
