import { CurrencyPipe, DatePipe, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';

import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { Icon } from '../../../../shared/components/icon/icon';
import { OrderStatusBadge } from '../../../../shared/components/order-status-badge/order-status-badge';
import { OrdersService } from '../../services/orders.service';
import { orderErrorMessage } from '../../utils/order-errors';

@Component({
  selector: 'app-order-detail-page',
  imports: [CurrencyPipe, DataTable, DatePipe, Icon, OrderStatusBadge],
  templateUrl: './order-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly service = inject(OrdersService);

  readonly columns: TableColumn[] = [
    { key: 'product', label: 'Producto', width: '46%' },
    { key: 'quantity', label: 'Cantidad', width: '14%' },
    { key: 'unitPrice', label: 'Precio unitario', width: '20%' },
    { key: 'subtotal', label: 'Subtotal', width: '20%' },
  ];

  readonly loading = signal(true);
  readonly error = signal(false);
  private readonly reloadTick = signal(0);
  readonly busy = signal(false);
  readonly actionError = signal<string | null>(null);

  readonly order = toSignal(
    combineLatest([
      this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
      toObservable(this.reloadTick),
    ]).pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(false);
      }),
      switchMap(([id]) => {
        if (!Number.isInteger(id) || id <= 0) {
          this.router.navigate(['/orders']);
          return of(null);
        }
        return this.service.getById(id).pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.status === 404) this.router.navigate(['/orders']);
            else this.error.set(true);
            return of(null);
          }),
        );
      }),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: null },
  );

  decide(action: 'accept' | 'reject') {
    const current = this.order();
    if (!current || this.busy()) return;
    if (action === 'accept' && current.total === null) {
      this.actionError.set('Este pedido no tiene un total definido, no se puede aceptar el pago.');
      return;
    }
    const verb = action === 'accept' ? 'aceptar' : 'rechazar';
    if (
      !confirm(
        `¿Seguro que quieres ${verb} el pago del pedido #${current.id}? No se podrá cambiar después.`,
      )
    )
      return;

    let request$: Observable<void>;
    if (action === 'accept') {
      request$ = this.service.acceptPayment(current.id, current.total!);
    } else {
      request$ = this.service.rejectPayment(current.id);
    }
    this.busy.set(true);
    this.actionError.set(null);

    request$.subscribe({
      next: () => {
        this.busy.set(false);
        this.retry();
      },
      error: (err: HttpErrorResponse) => {
        this.busy.set(false);
        this.actionError.set(orderErrorMessage(err));
      },
    });
  }

  back() {
    this.location.back();
  }

  retry() {
    this.reloadTick.update((n) => n + 1);
  }
}
