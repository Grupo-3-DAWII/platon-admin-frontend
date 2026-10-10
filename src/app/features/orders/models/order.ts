import { FilterOption } from '../../../shared/models/filter-option';
import { OrderFilter, OrderStatus } from '../../../shared/models/order-status';

export const ORDER_FILTERS: FilterOption<OrderFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'cancelled', label: 'Cancelado' },
];

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderResponse {
  id: number;
  code: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}
