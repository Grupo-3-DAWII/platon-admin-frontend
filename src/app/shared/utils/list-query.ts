import { signal } from '@angular/core';

export class ListQuery<F extends string> {
  readonly filter;
  readonly search = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);

  constructor(initialFilter: F) {
    this.filter = signal<F>(initialFilter);
  }

  setFilter(filter: F) {
    this.filter.set(filter);
    this.page.set(1);
  }

  setSearch(term: string) {
    this.search.set(term);
    this.page.set(1);
  }

  setPageSize(size: number) {
    this.pageSize.set(size);
    this.page.set(1);
  }

  setPage(page: number) {
    this.page.set(page);
  }

  /** For mock pagination. */
  paginate<T>(items: T[]): T[] {
    const start = (this.page() - 1) * this.pageSize();
    return items.slice(start, start + this.pageSize());
  }
}
