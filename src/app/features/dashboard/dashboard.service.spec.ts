import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CustomersService } from '../customers/services/customers.service';
import { Order } from '../orders/models/order';
import { OrdersService } from '../orders/services/orders.service';
import { ProductSummary } from '../products/models/product';
import { ProductsService } from '../products/services/products.service';
import { DashboardService, salesByCategory, weeklySales } from './dashboard.service';

const order = (
  id: number,
  createdAt: string,
  total: number | null,
  status: Order['status'] = 'paid',
): Order => ({ id, createdAt, total, status, customerName: 'Cliente', items: [] });

describe('Dashboard data', () => {
  it('uses Monday to Sunday boundaries across years and excludes unpaid orders', () => {
    const orders = [
      order(1, '2025-12-29T10:00:00', 10),
      order(2, '2026-01-04T23:00:00', 20),
      order(3, '2026-01-05T00:00:00', 99),
      order(4, '2025-12-29T12:00:00', 50, 'cancelled'),
    ];
    expect(weeklySales(orders, 'current', new Date(2026, 0, 4))).toEqual([10, 0, 0, 0, 0, 0, 20]);
    expect(weeklySales(orders, 'previous', new Date(2026, 0, 5))).toEqual([10, 0, 0, 0, 0, 0, 20]);
  });

  it('distinguishes an unknown amount from zero and an empty day', () => {
    expect(
      weeklySales(
        [order(1, '2026-01-05', null), order(2, '2026-01-06', 0)],
        'current',
        new Date(2026, 0, 5),
      ),
    ).toEqual([null, 0, 0, 0, 0, 0, 0]);
  });

  it('counts paid units by category without pricing them from the current catalog', () => {
    const paid = {
      ...order(1, '2026-01-05', 20),
      items: [
        { productId: 1, productName: 'Libro', quantity: 3, unitPrice: 5, subtotal: 15 },
        { productId: 99, productName: 'Retirado', quantity: 1, unitPrice: 5, subtotal: 5 },
      ],
    };
    expect(
      salesByCategory(
        [paid, { ...paid, status: 'cancelled' }],
        [{ id: 1, genre: 'Historia' } as ProductSummary],
      ),
    ).toEqual([
      { name: 'Historia', quantity: 3 },
      { name: 'Sin categoría', quantity: 1 },
    ]);
  });

  it('loads every product page and derives totals and recent orders from API records', () => {
    const getPage = vi.fn(({ page }) =>
      of({ page, totalPages: 2, last: page === 1, content: [{ id: page + 1, genre: 'Historia' }] }),
    );
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        {
          provide: OrdersService,
          useValue: {
            getAll: () =>
              of([
                order(1, '2026-01-05', 12),
                order(2, '2026-01-05', null),
                order(3, '2026-01-06', 99, 'pending'),
              ]),
          },
        },
        { provide: ProductsService, useValue: { getPage } },
        { provide: CustomersService, useValue: { getCustomers: () => of([{ id: 1 }]) } },
      ],
    });
    const service = TestBed.inject(DashboardService);
    expect(getPage).toHaveBeenCalledTimes(2);
    expect(service.productCount()).toBe(2);
    expect(service.customerCount()).toBe(1);
    expect(service.orderCount()).toBe(3);
    expect(service.salesTotal()).toBe(12);
    expect(service.missingAmounts()).toBe(1);
    expect(service.recentOrders().map((item) => item.id)).toEqual([3, 2, 1]);
  });

  it('reports a failed request and can retry instead of displaying example data', () => {
    const getAll = vi
      .fn()
      .mockReturnValueOnce(throwError(() => new Error('offline')))
      .mockReturnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        { provide: OrdersService, useValue: { getAll } },
        {
          provide: ProductsService,
          useValue: { getPage: () => of({ page: 0, totalPages: 0, last: true, content: [] }) },
        },
        { provide: CustomersService, useValue: { getCustomers: () => of([]) } },
      ],
    });
    const service = TestBed.inject(DashboardService);
    expect(service.error()).toBe(true);
    service.retry();
    expect(service.error()).toBe(false);
    expect(service.loading()).toBe(false);
    expect(service.recentOrders()).toEqual([]);
  });
});
