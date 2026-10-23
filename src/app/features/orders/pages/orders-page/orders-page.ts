import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
import { Icon } from '../../../../shared/components/icon/icon';
import { OrderStatusBadge } from '../../../../shared/components/order-status-badge/order-status-badge';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { RowAction, RowActions } from '../../../../shared/components/row-actions/row-actions';
import { ORDER_FILTERS, OrderFilter } from '../../../../shared/models/order-status';
import { ListQuery } from '../../../../shared/utils/list-query';
import { Order, STATE_BY_FILTER } from '../../models/order';
import { OrdersResult, OrdersService } from '../../services/orders.service';
import { RouterLink } from '@angular/router';
import { orderErrorMessage } from '../../utils/order-errors';

const EMPTY_RESULT: OrdersResult = { content: [], totalElements: 0 };

@Component({
  imports: [
    CurrencyPipe,
    DataTable,
    DatePipe,
    FiltersBar,
    Icon,
    OrderStatusBadge,
    PageHeader,
    Pagination,
    RowActions,
    RouterLink,
  ],
  selector: 'app-orders-page',
  templateUrl: './orders-page.html',
})
export class OrdersPage {
  private readonly service = inject(OrdersService);
  private readonly searchInput$ = new Subject<string>();

  readonly columns: TableColumn[] = [
    { key: 'id', label: '#', width: '8%' },
    { key: 'customer', label: 'Cliente', width: '20%' },
    { key: 'product', label: 'Producto', width: '24%' },
    { key: 'date', label: 'Fecha', width: '12%' },
    { key: 'total', label: 'Total', width: '12%' },
    { key: 'status', label: 'Estado', width: '12%' },
    { key: 'actions', label: 'Acciones', width: '12%', align: 'center' },
  ];

  readonly filters = ORDER_FILTERS;
  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly query = new ListQuery<OrderFilter>('pending');

  readonly rowActions: RowAction[] = [
    { id: 'accept', label: 'Aceptar pago', icon: 'sales' },
    { id: 'reject', label: 'Rechazar pago', icon: 'circle-danger', danger: true },
  ];

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly actionError = signal<string | null>(null);
  private readonly busy = signal(false);
  private readonly reloadTick = signal(0);

  private readonly params = computed(() => ({
    page: this.query.page() - 1,
    size: this.query.pageSize(),
    state: STATE_BY_FILTER[this.query.filter()],
    search: this.query.search(),
    tick: this.reloadTick(),
  }));

  private readonly result = toSignal(
    toObservable(this.params).pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(false);
      }),
      switchMap(({ page, size, state, search }) =>
        this.service.getPage({ page, size, state, search }).pipe(
          catchError(() => {
            this.error.set(true);
            return of(EMPTY_RESULT);
          }),
        ),
      ),
      tap((res) => {
        this.loading.set(false);
        if (this.error()) return;
        const lastPage = Math.max(1, Math.ceil(res.totalElements / this.query.pageSize()));
        if (this.query.page() > lastPage) this.query.setPage(lastPage);
      }),
    ),
    { initialValue: EMPTY_RESULT },
  );

  readonly totalCount = computed(() => this.result().totalElements);

  readonly orders = computed(() => this.result().content);
  constructor() {
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => this.query.setSearch(term));
  }

  onSearch(term: string) {
    this.searchInput$.next(term.trim());
  }
  retry() {
    this.reloadTick.update((n) => n + 1);
  }

  handleAction(action: string, order: Order) {
    if (this.busy()) return;
    if (action === 'accept' && order.total === null) {
      this.actionError.set('Este pedido no tiene un total definido, no se puede aceptar el pago.');
      return;
    }
    const verb = action === 'accept' ? 'aceptar' : 'rechazar';
    if (
      !confirm(
        `¿Seguro que quieres ${verb} el pago del pedido #${order.id}? No se podrá cambiar después.`,
      )
    )
      return;

    const request$: Observable<void> =
      action === 'accept'
        ? this.service.acceptPayment(order.id, order.total!)
        : this.service.rejectPayment(order.id);

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
}
