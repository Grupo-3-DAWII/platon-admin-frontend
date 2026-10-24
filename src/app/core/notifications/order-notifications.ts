import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, exhaustMap, of, switchMap, timer } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Order } from '../../features/orders/models/order';
import { OrdersService } from '../../features/orders/services/orders.service';
export interface OrderNotice {
  key: string;
  orderId: number;
  message: string;
  read: boolean;
}
export function changedOrders(
  previous: Map<number, string> | null,
  orders: Order[],
): OrderNotice[] {
  if (!previous) return [];
  return orders
    .filter(
      (order) =>
        !previous.has(order.id) || (order.status === 'paid' && previous.get(order.id) !== 'paid'),
    )
    .map((order) => ({
      key: `${order.id}-${order.status}`,
      orderId: order.id,
      message:
        order.status === 'paid'
          ? `Pedido #${order.id} pagado${order.paymentMethod === 'VISA_PLATINUM_SIMULATED' ? ' con Visa' : ''}`
          : `Nuevo pedido #${order.id} · ${order.customerName}`,
      read: false,
    }));
}
@Injectable({ providedIn: 'root' })
export class OrderNotifications {
  private readonly auth = inject(AuthService);
  private readonly orders = inject(OrdersService);
  private previous: Map<number, string> | null = null;
  readonly notices = signal<OrderNotice[]>([]);
  readonly disconnected = signal(false);
  readonly unread = computed(() => this.notices().filter((n) => !n.read).length);
  constructor() {
    toObservable(this.auth.session)
      .pipe(
        switchMap((session) => {
          this.previous = null;
          this.notices.set([]);
          this.disconnected.set(false);
          return session
            ? timer(0, 8000).pipe(
                exhaustMap(() => this.orders.getAll().pipe(catchError(() => of(null)))),
              )
            : of(null);
        }),
        takeUntilDestroyed(),
      )
      .subscribe((orders) => {
        if (!orders) {
          this.disconnected.set(!!this.auth.session());
          return;
        }
        this.disconnected.set(false);
        const notices = changedOrders(this.previous, orders);
        if (notices.length) this.notices.update((current) => [...notices, ...current].slice(0, 30));
        this.previous = new Map(orders.map((order) => [order.id, order.status]));
      });
  }
  markRead() {
    this.notices.update((items) => items.map((item) => ({ ...item, read: true })));
  }
}
