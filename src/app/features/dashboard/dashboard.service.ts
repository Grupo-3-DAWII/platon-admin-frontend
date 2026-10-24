import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  merge,
  timer,
  EMPTY,
  expand,
  forkJoin,
  map,
  of,
  reduce,
  Subject,
  switchMap,
  startWith,
} from 'rxjs';
import { CustomersService } from '../customers/services/customers.service';
import { Order } from '../orders/models/order';
import { OrdersService } from '../orders/services/orders.service';
import { ProductSummary } from '../products/models/product';
import { ProductsService } from '../products/services/products.service';

export type WeekPeriod = 'current' | 'previous';
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function weeklySales(
  orders: Order[],
  period: WeekPeriod,
  now = new Date(),
): (number | null)[] {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) - (period === 'previous' ? 7 : 0));
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(day.getDate() + index);
    const paid = orders.filter(
      (order) => order.status === 'paid' && order.createdAt.slice(0, 10) === dateKey(day),
    );
    const priced = paid.filter((order) => order.total !== null);
    return paid.length && !priced.length
      ? null
      : Math.round(priced.reduce((sum, order) => sum + (order.total ?? 0), 0) * 100) / 100;
  });
}

export function salesByCategory(orders: Order[], products: ProductSummary[]) {
  const genres = new Map(products.map((product) => [product.id, product.genre]));
  const totals = new Map<string, number>();
  for (const order of orders.filter((order) => order.status === 'paid')) {
    for (const item of order.items) {
      const genre = genres.get(item.productId) || 'Sin categoría';
      totals.set(genre, (totals.get(genre) ?? 0) + item.quantity);
    }
  }
  return [...totals]
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name));
}

@Injectable()
export class DashboardService {
  private readonly ordersApi = inject(OrdersService);
  private readonly productsApi = inject(ProductsService);
  private readonly customersApi = inject(CustomersService);
  private readonly reload = new Subject<void>();
  readonly selectedWeek = signal<WeekPeriod>('current');

  private readonly state = toSignal(
    merge(this.reload, timer(8000, 8000)).pipe(
      startWith(undefined),
      switchMap(() =>
        forkJoin({
          orders: this.ordersApi.getAll(),
          products: this.productsApi.getPage({ page: 0, size: 100 }).pipe(
            expand((page) =>
              page.last || page.page + 1 >= page.totalPages
                ? EMPTY
                : this.productsApi.getPage({ page: page.page + 1, size: 100 }),
            ),
            reduce((all, page) => all.concat(page.content), [] as ProductSummary[]),
          ),
          customers: this.customersApi.getCustomers(),
        }).pipe(
          map((data) => ({ data, error: false })),
          catchError(() => of({ data: null, error: true })),
        ),
      ),
    ),
    { initialValue: null },
  );

  readonly loading = computed(() => this.state() === null);
  readonly error = computed(() => this.state()?.error ?? false);
  private readonly orders = computed(() => this.state()?.data?.orders ?? []);
  readonly orderCount = computed(() => this.orders().length);
  readonly customerCount = computed(() => this.state()?.data?.customers.length ?? 0);
  readonly productCount = computed(() => this.state()?.data?.products.length ?? 0);
  readonly salesTotal = computed(() =>
    this.orders()
      .filter((order) => order.status === 'paid')
      .reduce((sum, order) => sum + (order.total ?? 0), 0),
  );
  readonly missingAmounts = computed(
    () => this.orders().filter((order) => order.status === 'paid' && order.total === null).length,
  );
  readonly recentOrders = computed(() =>
    [...this.orders()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id)
      .slice(0, 5),
  );
  readonly weeklySales = computed(() => weeklySales(this.orders(), this.selectedWeek()));
  readonly categories = computed(() =>
    salesByCategory(this.orders(), this.state()?.data?.products ?? []),
  );

  retry(): void {
    this.reload.next();
  }
}
