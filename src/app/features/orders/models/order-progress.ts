import { FilterOption } from '../../../shared/models/filter-option';
import type { Order } from './order';

export type FulfillmentStatus =
  'PENDIENTE' | 'PREPARANDO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
export type FulfillmentFilter = 'all' | FulfillmentStatus;
export const PROGRESS_LABELS: Record<FulfillmentStatus, string> = {
  PENDIENTE: 'Pendiente',
  PREPARANDO: 'Preparando',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};
export const PROGRESS_FILTERS: FilterOption<FulfillmentFilter>[] = [
  { value: 'all', label: 'Todos' },
  ...Object.entries(PROGRESS_LABELS)
    .filter(([value]) => value !== 'PREPARANDO')
    .map(([value, label]) => ({
      value: value as FulfillmentStatus,
      label,
    })),
];
export function progressOf(order: Order): FulfillmentStatus {
  return order.orderStatus ?? (order.status === 'cancelled' ? 'CANCELADO' : 'PENDIENTE');
}
export const EDITABLE_PROGRESS: FulfillmentStatus[] = ['PENDIENTE', 'EN_CAMINO', 'ENTREGADO'];
export function progressOptions(order: Order): FulfillmentStatus[] {
  if (order.status !== 'paid') return [];
  return EDITABLE_PROGRESS;
}
