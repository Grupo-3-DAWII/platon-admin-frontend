import { changedOrders } from './order-notifications';
import { Order } from '../../features/orders/models/order';
const order: Order = {
  id: 25,
  customerName: 'Elena Soto',
  status: 'pending',
  total: 37.5,
  createdAt: '2026-10-23',
  items: [],
};
describe('Order notifications', () => {
  it('does not announce historical orders when the panel opens', () =>
    expect(changedOrders(null, [order])).toEqual([]));
  it('announces a new order once and notices a later approved card payment', () => {
    expect(changedOrders(new Map(), [order])[0].message).toContain('Nuevo pedido #25');
    const previous = new Map([[25, 'pending']]);
    expect(changedOrders(previous, [order])).toEqual([]);
    const paid = { ...order, status: 'paid' as const, paymentMethod: 'VISA_PLATINUM_SIMULATED' };
    expect(changedOrders(previous, [paid])[0].message).toContain('pagado con Visa');
    expect(changedOrders(new Map([[25, 'paid']]), [paid])).toEqual([]);
  });
});
