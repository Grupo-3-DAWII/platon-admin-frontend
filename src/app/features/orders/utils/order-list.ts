import { Order } from '../models/order';
import { OrderFilter } from '../../../shared/models/order-status';
import {
  CollectionFiltersValue,
  compareValues,
  matchesDay,
  matchesRange,
  matchesSearch,
} from '../../../shared/utils/collection-filters';
export function filterOrders(
  orders: Order[],
  state: OrderFilter,
  search: string,
  filters: CollectionFiltersValue,
  descending: boolean,
): Order[] {
  return orders
    .filter(
      (order) =>
        (state === 'all' || order.status === state) &&
        matchesSearch(
          search,
          [
            order.customerName,
            ...order.items.flatMap((item) => [
              item.productName,
              item.isbn,
              item.isbn?.replace(/[\s-]/g, ''),
              item.author,
            ]),
          ],
          order.id,
        ) &&
        matchesDay(order.createdAt, filters) &&
        matchesRange(order.total, filters) &&
        (filters.payment === 'all' ||
          (filters.payment === 'card'
            ? order.paymentMethod === 'VISA_PLATINUM_SIMULATED'
            : !order.paymentMethod)),
    )
    .sort((a, b) => {
      const value = (order: Order) =>
        filters.sortBy === 'name'
          ? order.customerName
          : filters.sortBy === 'id'
            ? order.id
            : filters.sortBy === 'total'
              ? order.total
              : order.createdAt;
      return compareValues(value(a), value(b), descending) || compareValues(a.id, b.id, descending);
    });
}
