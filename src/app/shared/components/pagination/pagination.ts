import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

type PageItem = number | 'gap-start' | 'gap-end';

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

function buildPages(current: number, total: number): PageItem[] {
  if (total <= 7) return range(1, total);
  if (current <= 4) return [...range(1, 5), 'gap-end', total];
  if (current >= total - 3) return [1, 'gap-start', ...range(total - 4, total)];
  return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', total];
}

@Component({
  selector: 'app-pagination',
  imports: [Icon],
  templateUrl: './pagination.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  page = input.required<number>();
  pageSize = input(10);
  totalItems = input.required<number>();
  pageSizeOptions = input<number[]>([10, 25, 50]);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  from = computed(() => (this.totalItems() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  to = computed(() => Math.min(this.page() * this.pageSize(), this.totalItems()));
  pages = computed(() => buildPages(this.page(), this.totalPages()));

  goTo(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.page()) return;
    this.pageChange.emit(page);
  }

  onPageSizeChange(event: Event) {
    this.pageSizeChange.emit(Number((event.target as HTMLSelectElement).value));
  }
}
