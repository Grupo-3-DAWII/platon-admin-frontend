import { Component, input, output, signal } from '@angular/core';
import { SearchInput } from '../../../../shared/components/search-input/search-input';
import { Icon } from '../../../../shared/components/icon/icon';

export type StockFilter = 'all' | 'available' | 'low' | 'out';

interface FilterOption {
  value: StockFilter;
  label: string;
}

@Component({
  imports: [SearchInput, Icon],
  styleUrl: './filters-bar.css',
  selector: 'app-filters-bar',
  templateUrl: './filters-bar.html',
})
export class FiltersBar {
  totalCount = input<number | null>(null);

  filterChange = output<StockFilter>();
  filterClick = output<void>();
  sortClick = output<void>();

  selectedFilter = signal<StockFilter>('all');

  readonly filters: FilterOption[] = [
    { value: 'all', label: 'Todos' },
    { value: 'available', label: 'Disponible' },
    { value: 'low', label: 'Poco stock' },
    { value: 'out', label: 'Agotado' },
  ];

  selectFilter(value: StockFilter) {
    this.selectedFilter.set(value);
    this.filterChange.emit(value);
  }

  openFilters() {
    this.filterClick.emit();
  }

  openSort() {
    this.sortClick.emit();
  }
}
