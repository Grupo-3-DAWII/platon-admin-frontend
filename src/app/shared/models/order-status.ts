import { FilterOption } from './filter-option';

export type OrderStatus = 'paid' | 'pending' | 'cancelled' | 'unknown';

export type OrderFilter = 'all' | Exclude<OrderStatus, 'unknown'>;

export const ORDER_FILTERS: FilterOption<OrderFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'cancelled', label: 'Cancelado' },
];
