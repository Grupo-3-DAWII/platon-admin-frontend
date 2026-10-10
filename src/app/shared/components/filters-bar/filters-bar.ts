import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FilterOption } from '../../models/filter-option';
import { Icon } from '../icon/icon';
import { SearchInput } from '../search-input/search-input';

@Component({
  imports: [SearchInput, Icon],
  styleUrl: './filters-bar.css',
  selector: 'app-filters-bar',
  templateUrl: './filters-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersBar<T extends string> {
  filters = input.required<FilterOption<T>[]>();
  selectedFilter = input.required<T>();
  totalCount = input<number | null>(null);
  searchPlaceholder = input('Buscar...');
  tabsLabel = input('Filtrar por estado');

  filterChange = output<T>();
  searchChange = output<string>();
  filterClick = output<void>();
  sortClick = output<void>();
}
