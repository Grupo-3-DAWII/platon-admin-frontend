import { computed, signal, Signal, WritableSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, startWith, switchMap } from 'rxjs';
import { ListQuery } from './list-query';
import { StockFilter } from '../models/stock-status';
import {
  CollectionFiltersValue,
  activeCollectionFilterCount,
  compareValues,
  emptyCollectionFilters,
  matchesDay,
  matchesRange,
  matchesSearch,
  sortFieldLabel,
  stockMatches,
  uniqueOptions,
} from './collection-filters';
export interface CatalogRow {
  id: number;
  name: string;
  author: string;
  genre: string;
  stock: number;
  active: boolean;
  isbn?: string;
  editorial?: string;
  salePrice?: number;
  lastMovement?: { type: string; date: string } | null;
}
export class CatalogList<T extends CatalogRow> {
  readonly query = new ListQuery<StockFilter>('all');
  readonly panelOpen = signal(false);
  readonly descending = signal(false);
  readonly advanced: WritableSignal<CollectionFiltersValue>;
  private readonly tick = signal(0);
  private readonly state: Signal<{ items: T[]; loading: boolean; error: boolean }>;
  constructor(
    private readonly load: () => Observable<T[]>,
    readonly kind: 'products' | 'inventory',
  ) {
    this.advanced = signal(emptyCollectionFilters(kind));
    this.state = toSignal(
      toObservable(this.tick).pipe(
        switchMap(() =>
          this.load().pipe(
            map((items) => ({ items, loading: false, error: false })),
            catchError(() => of({ items: [] as T[], loading: false, error: true })),
            startWith({ items: [] as T[], loading: true, error: false }),
          ),
        ),
      ),
      { initialValue: { items: [] as T[], loading: true, error: false } },
    );
  }
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly genres = computed(() => uniqueOptions(this.state().items.map((item) => item.genre)));
  readonly editorials = computed(() =>
    uniqueOptions(this.state().items.map((item) => item.editorial)),
  );
  readonly activeCount = computed(() => activeCollectionFilterCount(this.advanced()));
  readonly sortDescription = computed(
    () =>
      sortFieldLabel(this.advanced().sortBy, this.kind) +
      ' · ' +
      (this.descending() ? 'Descendente' : 'Ascendente'),
  );
  readonly sortLabel = computed(
    () =>
      this.sortDescription() + '. Cambiar a ' + (this.descending() ? 'ascendente' : 'descendente'),
  );
  readonly filtered = computed(() => {
    const f = this.advanced();
    const descending = this.descending();
    return this.state()
      .items.filter(
        (item) =>
          stockMatches(item.stock, this.query.filter()) &&
          matchesSearch(
            this.query.search(),
            [
              item.name,
              item.author,
              item.genre,
              item.editorial,
              item.isbn,
              item.isbn?.replace(/[\s-]/g, ''),
            ],
            item.id,
          ) &&
          (!f.genre || item.genre === f.genre) &&
          (!f.editorial || item.editorial === f.editorial) &&
          (f.active === 'all' || item.active === (f.active === 'active')) &&
          matchesRange(this.kind === 'products' ? item.salePrice : item.stock, f) &&
          (this.kind !== 'inventory' ||
            (matchesDay(item.lastMovement?.date, f) &&
              (f.movement === 'all' ||
                (f.movement === 'none'
                  ? !item.lastMovement
                  : item.lastMovement?.type === f.movement)))),
      )
      .sort((a, b) => {
        const value = (item: T) =>
          f.sortBy === 'id'
            ? item.id
            : f.sortBy === 'stock'
              ? item.stock
              : f.sortBy === 'price'
                ? item.salePrice
                : f.sortBy === 'date'
                  ? item.lastMovement?.date
                  : item.name;
        return (
          compareValues(value(a), value(b), descending) || compareValues(a.id, b.id, descending)
        );
      });
  });
  readonly total = computed(() => this.filtered().length);
  readonly page = computed(() =>
    Math.min(this.query.page(), Math.max(1, Math.ceil(this.total() / this.query.pageSize()))),
  );
  readonly paged = computed(() =>
    this.filtered().slice(
      (this.page() - 1) * this.query.pageSize(),
      this.page() * this.query.pageSize(),
    ),
  );
  apply(value: CollectionFiltersValue) {
    this.advanced.set({ ...value });
    this.query.setPage(1);
    this.panelOpen.set(false);
  }
  clear() {
    this.advanced.set(emptyCollectionFilters(this.kind));
    this.query.setPage(1);
  }
  toggleSort() {
    this.descending.update((value) => !value);
    this.query.setPage(1);
  }
  retry() {
    this.tick.update((n) => n + 1);
  }
}
