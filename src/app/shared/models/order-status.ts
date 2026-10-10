import { FilterOption } from './filter-option';

export type OrderStatus = 'delivered' | 'pending' | 'cancelled';

export type OrderFilter = 'all' | OrderStatus;

export const ORDER_FILTERS: FilterOption<OrderFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'cancelled', label: 'Cancelado' },
];
