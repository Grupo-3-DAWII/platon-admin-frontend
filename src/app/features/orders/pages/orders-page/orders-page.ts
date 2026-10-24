import { ConfirmationService } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { OrderProgress } from '../../components/order-progress/order-progress';
import {
  FulfillmentFilter,
  FulfillmentStatus,
  PROGRESS_FILTERS,
  progressOf,
} from '../../models/order-progress';
import { orderConfirmation } from '../../utils/order-confirmation';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap, merge, timer } from 'rxjs';

import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
import { Icon } from '../../../../shared/components/icon/icon';
import { OrderStatusBadge } from '../../../../shared/components/order-status-badge/order-status-badge';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { RowAction, RowActions } from '../../../../shared/components/row-actions/row-actions';

import { ListQuery } from '../../../../shared/utils/list-query';
import { Order } from '../../models/order';
import { OrdersService } from '../../services/orders.service';
import { Router, RouterLink } from '@angular/router';
import { orderErrorMessage } from '../../utils/order-errors';

import { CollectionFilters } from '../../../../shared/components/collection-filters/collection-filters';
import {
  CollectionFiltersValue,
  activeCollectionFilterCount,
  emptyCollectionFilters,
  sortFieldLabel,
} from '../../../../shared/utils/collection-filters';
import { filterOrders } from '../../utils/order-list';

@Component({
  imports: [
    CurrencyPipe,
    DataTable,
    DatePipe,
    FiltersBar,
    CollectionFilters,
    Icon,
    OrderStatusBadge,
    OrderProgress,
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
  private readonly confirmation = inject(ConfirmationService);
  private readonly router = inject(Router);
  readonly filterPanelOpen = signal(false);
  readonly advancedFilters = signal(emptyCollectionFilters('orders'));
  readonly descending = signal(true);
  readonly activeFilterCount = computed(() => activeCollectionFilterCount(this.advancedFilters()));
  readonly sortDescription = computed(
    () =>
      sortFieldLabel(this.advancedFilters().sortBy, 'orders') +
      ' · ' +
      (this.descending() ? 'Descendente' : 'Ascendente'),
  );
  readonly sortLabel = computed(
    () =>
      this.sortDescription() + '. Cambiar a ' + (this.descending() ? 'ascendente' : 'descendente'),
  );

  readonly columns: TableColumn[] = [
    { key: 'id', label: '#', width: '6%' },
    { key: 'customer', label: 'Cliente', width: '18%' },
    { key: 'product', label: 'Producto', width: '20%' },
    { key: 'date', label: 'Fecha', width: '11%' },
    { key: 'total', label: 'Total', width: '11%' },
    { key: 'payment', label: 'Pago', width: '10%' },
    { key: 'status', label: 'Pedido', width: '15%' },
    { key: 'actions', label: 'Acciones', width: '9%', align: 'center' },
  ];

  readonly filters = PROGRESS_FILTERS;
  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly query = new ListQuery<FulfillmentFilter>('all');

  actionsFor(order: Order): RowAction[] {
    return [
      { id: 'view', label: 'Ver detalle', icon: 'show2' },
      ...(order.status === 'pending'
        ? [
            {
              id: 'reject',
              label: 'Cancelar pedido',
              icon: 'circle-danger',
              danger: true,
              disabled: this.busy(),
            },
          ]
        : []),
    ];
  }

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly busy = signal(false);
  private readonly reloadTick = signal(0);

  private readonly result = toSignal(
    merge(toObservable(this.reloadTick), timer(8000, 8000)).pipe(
      switchMap(() =>
        this.service.getAll().pipe(
          tap(() => this.error.set(false)),
          catchError(() => {
            this.error.set(true);
            return of([] as Order[]);
          }),
          tap(() => this.loading.set(false)),
        ),
      ),
    ),
    { initialValue: [] as Order[] },
  );
  readonly filteredOrders = computed(() =>
    filterOrders(
      this.result(),
      'all',
      this.query.search(),
      this.advancedFilters(),
      this.descending(),
    ).filter((order) => this.query.filter() === 'all' || progressOf(order) === this.query.filter()),
  );
  readonly totalCount = computed(() => this.filteredOrders().length);
  readonly currentPage = computed(() =>
    Math.min(this.query.page(), Math.max(1, Math.ceil(this.totalCount() / this.query.pageSize()))),
  );
  readonly orders = computed(() =>
    this.filteredOrders().slice(
      (this.currentPage() - 1) * this.query.pageSize(),
      this.currentPage() * this.query.pageSize(),
    ),
  );
  updateProgress(order: Order, status: FulfillmentStatus): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.actionError.set(null);
    this.service.updateOrderStatus(order.id, status).subscribe({
      next: () => {
        this.busy.set(false);
        this.retry();
      },
      error: (error: HttpErrorResponse) => {
        this.busy.set(false);
        this.actionError.set(orderErrorMessage(error));
        this.retry();
      },
    });
  }
  onSearch(term: string) {
    this.query.setSearch(term);
  }
  applyAdvancedFilters(value: CollectionFiltersValue) {
    this.advancedFilters.set({ ...value });
    this.query.setPage(1);
    this.filterPanelOpen.set(false);
  }
  clearAdvancedFilters() {
    this.advancedFilters.set(emptyCollectionFilters('orders'));
    this.query.setPage(1);
  }
  toggleSort() {
    this.descending.update((value) => !value);
    this.query.setPage(1);
  }
  retry() {
    this.reloadTick.update((n) => n + 1);
  }

  async handleAction(action: string, order: Order): Promise<void> {
    if (action === 'view') {
      this.router.navigate(['/orders', order.id]);
      return;
    }
    if (action !== 'reject' || order.status !== 'pending' || this.busy()) return;
    if (
      !(await this.confirmation.ask(
        `Cancelar pedido #${order.id}`,
        orderConfirmation('reject', order.id),
        'Cancelar pedido',
        true,
      ))
    )
      return;
    const request$ = this.service.rejectPayment(order.id);

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
