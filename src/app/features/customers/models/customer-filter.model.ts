import { FilterOption } from '../../../shared/models/filter-option';

export type CustomerFilter = 'all' | 'active' | 'inactive';

export const CUSTOMER_FILTERS: FilterOption<CustomerFilter>[] = [
  {
    value: 'all',
    label: 'Todos',
  },
  {
    value: 'active',
    label: 'Activos',
  },
  {
    value: 'inactive',
    label: 'Inactivos',
  },
];
