import { progressOptions, progressOf } from './order-progress';
import { Order } from './order';
const order: Order = {
  id: 1,
  customerName: 'Ana',
  items: [],
  total: 10,
  status: 'paid',
  createdAt: '2026-10-23',
};
describe('Independent payment and delivery', () => {
  it('offers all three states even when an order was already delivered', () => {
    expect(progressOf(order)).toBe('PENDIENTE');
    for (const orderStatus of ['PENDIENTE', 'EN_CAMINO', 'ENTREGADO'] as const) {
      expect(progressOptions({ ...order, orderStatus })).toEqual([
        'PENDIENTE',
        'EN_CAMINO',
        'ENTREGADO',
      ]);
    }
  });
  it('does not offer delivery changes for unpaid or canceled orders', () => {
    expect(progressOptions({ ...order, status: 'pending' })).toEqual([]);
    expect(progressOf({ ...order, status: 'cancelled' })).toBe('CANCELADO');
    expect(progressOptions({ ...order, status: 'cancelled' })).toEqual([]);
  });
});
