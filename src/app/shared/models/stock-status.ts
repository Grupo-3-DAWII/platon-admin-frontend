import { FilterOption } from './filter-option';

export type StockStatus = 'available' | 'low' | 'out';

export type StockFilter = 'all' | StockStatus;

export const STOCK_FILTERS: FilterOption<StockFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'available', label: 'Disponible' },
  { value: 'low', label: 'Poco stock' },
  { value: 'out', label: 'Agotado' },
];
