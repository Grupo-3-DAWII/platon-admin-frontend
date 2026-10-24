import { StockFilter } from '../models/stock-status';
export type ListKind = 'products' | 'inventory' | 'orders';
export type SortBy = 'name' | 'price' | 'stock' | 'date' | 'total' | 'id';
export interface CollectionFiltersValue {
  genre: string;
  editorial: string;
  active: string;
  min: string;
  max: string;
  from: string;
  to: string;
  movement: string;
  payment: string;
  sortBy: SortBy;
}
export const emptyCollectionFilters = (kind: ListKind): CollectionFiltersValue => ({
  genre: '',
  editorial: '',
  active: 'all',
  min: '',
  max: '',
  from: '',
  to: '',
  movement: 'all',
  payment: 'all',
  sortBy: kind === 'orders' ? 'date' : 'name',
});
export const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
export function matchesSearch(
  term: string,
  fields: (string | null | undefined)[],
  id: number,
): boolean {
  const text = normalizeSearch(fields.filter(Boolean).join(' '));
  return normalizeSearch(term)
    .split(' ')
    .filter(Boolean)
    .every((token) => {
      const numeric = token.replace(/^#/, '').replace(/^0+(?=\d)/, '');
      return (/^#?\d+$/.test(token) && String(id) === numeric) || text.includes(token);
    });
}
export const uniqueOptions = (values: (string | undefined)[]) =>
  [...new Set(values.filter((v): v is string => !!v))].sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true }),
  );
export const activeCollectionFilterCount = (f: CollectionFiltersValue) =>
  Number(!!f.genre) +
  Number(!!f.editorial) +
  Number(f.active !== 'all') +
  Number(!!f.min) +
  Number(!!f.max) +
  Number(!!f.from || !!f.to) +
  Number(f.movement !== 'all') +
  Number(f.payment !== 'all');
export function validDate(value: string): boolean {
  return (
    !value ||
    (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value)
  );
}
export function validCollectionFilters(value: CollectionFiltersValue, kind: ListKind): boolean {
  const numeric = kind === 'inventory' ? /^\d+$/ : /^\d+(\.\d{1,2})?$/;
  return (
    [value.min, value.max].every((v) => !v || (numeric.test(v) && Number.isFinite(Number(v)))) &&
    (!value.min || !value.max || Number(value.min) <= Number(value.max)) &&
    validDate(value.from) &&
    validDate(value.to) &&
    (!value.from || !value.to || value.from <= value.to)
  );
}
export function matchesRange(
  value: number | null | undefined,
  filters: CollectionFiltersValue,
): boolean {
  if (!filters.min && !filters.max) return true;
  return (
    value !== null &&
    value !== undefined &&
    Number.isFinite(value) &&
    (!filters.min || value >= Number(filters.min)) &&
    (!filters.max || value <= Number(filters.max))
  );
}
export function matchesDay(
  value: string | null | undefined,
  filters: CollectionFiltersValue,
): boolean {
  if (!filters.from && !filters.to) return true;
  if (!value || !validDate(value.slice(0, 10))) return false;
  const day = value.slice(0, 10);
  return (!filters.from || day >= filters.from) && (!filters.to || day <= filters.to);
}
export function compareValues(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
  descending: boolean,
): number {
  if (a === null || a === undefined || a === '')
    return b === null || b === undefined || b === '' ? 0 : 1;
  if (b === null || b === undefined || b === '') return -1;
  const order =
    typeof a === 'number' && typeof b === 'number'
      ? a - b
      : String(a).localeCompare(String(b), 'es', { sensitivity: 'base', numeric: true });
  return descending ? -order : order;
}
export const stockMatches = (stock: number, filter: StockFilter) =>
  filter === 'all' ||
  (filter === 'out' ? stock <= 0 : filter === 'low' ? stock > 0 && stock <= 5 : stock > 5);
export const sortFieldLabel = (key: SortBy, kind: ListKind) =>
  ({
    name: kind === 'orders' ? 'Cliente' : 'Nombre',
    price: 'Precio',
    stock: 'Stock',
    date: kind === 'inventory' ? 'Último movimiento' : 'Fecha del pedido',
    total: 'Importe',
    id: kind === 'orders' ? 'Número de pedido' : 'Código',
  })[key];
