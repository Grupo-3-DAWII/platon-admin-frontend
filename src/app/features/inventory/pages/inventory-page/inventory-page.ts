import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap, tap } from 'rxjs';

import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
import { Icon } from '../../../../shared/components/icon/icon';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { StockStatusBadge } from '../../../../shared/components/stock-status-badge/stock-status-badge';
import { PageDto } from '../../../../shared/models/page';
import { STOCK_FILTERS, StockFilter } from '../../../../shared/models/stock-status';

import { InventoryItem } from '../../models/inventory';
import { InventoryService } from '../../services/inventory.service';
import { movementDate, movementSummary } from '../../utils/movement-format';

const EMPTY_PAGE: PageDto<InventoryItem> = {
  content: [],
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

@Component({
  imports: [DataTable, FiltersBar, Icon, PageHeader, Pagination, StockStatusBadge, RouterLink],
  selector: 'app-inventory-page',
  templateUrl: './inventory-page.html',
})
export class InventoryPage {
  private readonly service = inject(InventoryService);
  private readonly searchInput$ = new Subject<string>();

  readonly columns: TableColumn[] = [
    { key: 'product', label: 'Producto', width: '28%' },
    { key: 'genre', label: 'Género', width: '14%' },
    { key: 'stock', label: 'Cantidad', width: '10%' },
    { key: 'status', label: 'Estado', width: '16%' },
    { key: 'lastMovement', label: 'Último movimiento', width: '20%' },
    { key: 'actions', label: 'Acciones', width: '12%', align: 'center' },
  ];

  readonly pageSizeOptions = [5, 10, 25, 50];

  readonly movementDate = movementDate;
  readonly movementSummary = movementSummary;

  readonly filters = STOCK_FILTERS;

  readonly selectedFilter = signal<StockFilter>('all');
  readonly search = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly loading = signal(true);
  readonly error = signal(false);
  private readonly reloadTick = signal(0);

  private readonly query = computed(() => ({
    page: this.page() - 1,
    size: this.pageSize(),
    search: this.search(),
    tick: this.reloadTick(),
  }));

  private readonly result = toSignal(
    toObservable(this.query).pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(false);
      }),
      switchMap(({ page, size, search }) =>
        this.service.getPage({ page, size, search }).pipe(
          catchError(() => {
            this.error.set(true);
            return of(EMPTY_PAGE);
          }),
        ),
      ),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: EMPTY_PAGE },
  );

  readonly totalElements = computed(() => this.result().totalElements);

  readonly filteredItems = computed(() => {
    const filter = this.selectedFilter();
    const all = this.result().content;
    return filter === 'all' ? all : all.filter((item) => item.status === filter);
  });

  constructor() {
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => {
        this.search.set(term);
        this.page.set(1);
      });
  }

  onSearch(term: string) {
    this.searchInput$.next(term.trim());
  }

  onFilterChange(filter: StockFilter) {
    this.selectedFilter.set(filter);
  }

  onPageChange(page: number) {
    this.page.set(page);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.page.set(1);
  }

  retry() {
    this.reloadTick.update((n) => n + 1);
  }

  openFilterPanel() {}

  openSortMenu() {}

  registerMovement() {}
}