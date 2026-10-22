import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap, tap } from 'rxjs';

import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { FilterOption } from '../../../../shared/models/filter-option';
import { ListQuery } from '../../../../shared/utils/list-query';
import { OrdersResult, OrdersService } from '../../../orders/services/orders.service';

const EMPTY_RESULT: OrdersResult = { content: [], totalElements: 0 };

@Component({
  imports: [CurrencyPipe, DataTable, DatePipe, FiltersBar, PageHeader, Pagination],
  selector: 'app-sales-page',
  templateUrl: './sales-page.html',
})
export class SalesPage {
  private readonly service = inject(OrdersService);
  private readonly searchInput$ = new Subject<string>();

  readonly columns: TableColumn[] = [
    { key: 'id', label: '#', width: '6%' },
    { key: 'order', label: 'Pedido ID', width: '14%' },
    { key: 'customer', label: 'Cliente', width: '22%' },
    { key: 'product', label: 'Producto', width: '28%' },
    { key: 'date', label: 'Fecha', width: '14%' },
    { key: 'total', label: 'Total', width: '16%' },
  ];

  readonly filters: FilterOption<'all'>[] = [{ value: 'all', label: 'Pagadas' }];
  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly query = new ListQuery<'all'>('all');

  readonly loading = signal(true);
  readonly error = signal(false);
  private readonly reloadTick = signal(0);

  private readonly params = computed(() => ({
    page: this.query.page() - 1,
    size: this.query.pageSize(),
    search: this.query.search(),
    tick: this.reloadTick(),
  }));

  private readonly result = toSignal(
    toObservable(this.params).pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(false);
      }),
      switchMap(({ page, size, search }) =>
        this.service.getPage({ page, size, state: 'PAGADO', search }).pipe(
          catchError(() => {
            this.error.set(true);
            return of(EMPTY_RESULT);
          }),
        ),
      ),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: EMPTY_RESULT },
  );

  readonly sales = computed(() => this.result().content);
  readonly totalCount = computed(() => this.result().totalElements);

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

  openFilterPanel() {}

  openSortMenu() {}
}