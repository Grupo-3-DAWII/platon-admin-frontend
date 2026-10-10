import { OrderStatus } from '../../../shared/models/order-status';
import { ordersMockup } from '../../orders/data/mockup';
import { PaymentStatus, SaleResponse } from '../models/sale';

const PAYMENT_BY_STATUS: Record<OrderStatus, PaymentStatus> = {
  delivered: 'paid',
  pending: 'pending',
  cancelled: 'refunded',
};

export const salesMockup: SaleResponse[] = ordersMockup.map((order) => ({
  id: order.id,
  code: `VTA-${1000 + order.id}`,
  orderId: order.id,
  orderCode: order.code,
  customerName: order.customerName,
  total: order.total,
  paymentStatus: PAYMENT_BY_STATUS[order.status],
  status: order.status,
  createdAt: order.createdAt,
}));
