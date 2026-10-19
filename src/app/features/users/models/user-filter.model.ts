import { FilterOption } from '../../../shared/models/filter-option';

export type UserFilter = 'all' | 'active' | 'inactive';

export const USER_FILTERS: FilterOption<UserFilter>[] = [
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
