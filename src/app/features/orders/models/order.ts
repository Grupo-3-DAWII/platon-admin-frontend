import { FilterOption } from '../../../shared/models/filter-option';

export type OrderStatus = 'delivered' | 'pending' | 'cancelled';

export type OrderFilter = 'all' | OrderStatus;

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
