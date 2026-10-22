import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap, tap } from 'rxjs';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
import { Icon } from '../../../../shared/components/icon/icon';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { PageDto } from '../../../../shared/models/page';
import { STOCK_FILTERS, StockFilter } from '../../../../shared/models/stock-status';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductSummary, LOW_STOCK_THRESHOLD } from '../../models/product';
import { ProductsService } from '../../services/products.service';

const EMPTY_PAGE: PageDto<ProductSummary> = {
  content: [],
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};
const MAX_STOCK_BY_FILTER: Partial<Record<StockFilter, number>> = {
  low: LOW_STOCK_THRESHOLD,
  out: 0,
};

@Component({
  imports: [Icon, ProductCard, FiltersBar, PageHeader, Pagination, RouterLink],
  styleUrl: '../../style/products.css',
  selector: 'app-products-list-page',
  templateUrl: './products-list-page.html',
})
export class ProductsListPage {
  private readonly service = inject(ProductsService);
  private readonly searchInput$ = new Subject<string>();

  readonly filters = STOCK_FILTERS;
  readonly pageSizeOptions = [12, 24, 48];

  readonly selectedFilter = signal<StockFilter>('all');
  readonly search = signal('');
  readonly page = signal(1); 
  readonly pageSize = signal(12);
  readonly loading = signal(true);
  readonly error = signal(false);
  private readonly reloadTick = signal(0);

  private readonly query = computed(() => ({
    page: this.page() - 1,
    size: this.pageSize(),
    search: this.search(),
    maxStock: MAX_STOCK_BY_FILTER[this.selectedFilter()],
    tick: this.reloadTick(),
  }));

  private readonly result = toSignal(
    toObservable(this.query).pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(false);
      }),
      switchMap(({ page, size, search, maxStock }) =>
        this.service.getPage({ page, size, search, maxStock }).pipe(
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

  readonly filteredProducts = computed(() => {
    const all = this.result().content;
    return this.selectedFilter() === 'available' ? all.filter((p) => p.stock > 0) : all;
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
    this.page.set(1);
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
}