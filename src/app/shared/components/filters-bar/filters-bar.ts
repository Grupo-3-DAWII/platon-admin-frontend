import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Icon } from '../icon/icon';
import { SearchInput } from '../search-input/search-input';
import { StockFilter } from '../../models/stock-status';

interface FilterOption {
  value: StockFilter;
  label: string;
}

@Component({
  imports: [SearchInput, Icon],
  styleUrl: './filters-bar.css',
  selector: 'app-filters-bar',
  templateUrl: './filters-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersBar {
  selectedFilter = input<StockFilter>('all');
  totalCount = input<number | null>(null);
  searchPlaceholder = input('Buscar...');
  tabsLabel = input('Filtrar por estado de stock');

  filterChange = output<StockFilter>();
  searchChange = output<string>();
  filterClick = output<void>();
  sortClick = output<void>();

  readonly filters: FilterOption[] = [
    { value: 'all', label: 'Todos' },
    { value: 'available', label: 'Disponible' },
    { value: 'low', label: 'Poco stock' },
    { value: 'out', label: 'Agotado' },
  ];
}
