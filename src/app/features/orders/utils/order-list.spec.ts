import { filterOrders } from './order-list';
import { emptyCollectionFilters } from '../../../shared/utils/collection-filters';
import { Order } from '../models/order';
const rows: Order[] = [
  {
    id: 35,
    customerName: 'María Pérez',
    status: 'paid',
    total: 37.5,
    createdAt: '2026-10-23T23:59:59',
    paymentMethod: 'VISA_PLATINUM_SIMULATED',
    items: [
      {
        productId: 1,
        productName: 'Árboles del Perú',
        isbn: '978-612-000001-8',
        author: 'Autor',
        quantity: 1,
        unitPrice: 37.5,
        subtotal: 37.5,
      },
    ],
  },
  {
    id: 4,
    customerName: 'Ana Soto',
    status: 'pending',
    total: 0,
    createdAt: '2026-10-22T00:00:00',
    items: [],
  },
  {
    id: 10,
    customerName: 'Luis Soto',
    status: 'paid',
    total: null,
    createdAt: '2026-10-23T00:00:00',
    items: [],
  },
];
describe('Orders list filtering', () => {
  it('searches customers, IDs with leading zeros, book titles and ISBNs', () => {
    for (const search of ['perez maria', '#00035', 'peru', '9786120000018'])
      expect(
        filterOrders(rows, 'all', search, emptyCollectionFilters('orders'), true).map(
          (order) => order.id,
        ),
      ).toEqual([35]);
  });
  it('combines status, inclusive dates, amount and payment method', () => {
    const filters = {
      ...emptyCollectionFilters('orders'),
      from: '2026-10-23',
      to: '2026-10-23',
      min: '37.50',
      max: '37.50',
      payment: 'card',
    };
    expect(filterOrders(rows, 'paid', 'maria', filters, true).map((order) => order.id)).toEqual([
      35,
    ]);
    expect(filterOrders(rows, 'pending', '', filters, true)).toEqual([]);
  });
  it('keeps unknown amounts distinct from zero and last in either sort direction', () => {
    const filters = { ...emptyCollectionFilters('orders'), sortBy: 'total' as const };
    expect(filterOrders(rows, 'all', '', filters, false).map((order) => order.id)).toEqual([
      4, 35, 10,
    ]);
    expect(filterOrders(rows, 'all', '', filters, true).map((order) => order.id)).toEqual([
      35, 4, 10,
    ]);
    expect(
      filterOrders(rows, 'all', '', { ...filters, min: '0', max: '0' }, true).map(
        (order) => order.id,
      ),
    ).toEqual([4]);
  });
  it('orders numeric IDs as numbers and preserves original input order', () => {
    const original = rows.map((order) => order.id);
    const filters = { ...emptyCollectionFilters('orders'), sortBy: 'id' as const };
    expect(filterOrders(rows, 'all', '', filters, false).map((order) => order.id)).toEqual([
      4, 10, 35,
    ]);
    expect(rows.map((order) => order.id)).toEqual(original);
  });
});
