import { OrderStatus } from '../../../shared/models/order-status';

export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export interface SaleResponse {
  id: number;
  code: string;
  orderId: number;
  orderCode: string;
  customerName: string;
  total: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
}
