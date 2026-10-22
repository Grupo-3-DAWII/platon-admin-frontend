import { FilterOption } from '../../../shared/models/filter-option';
import { OrderFilter, OrderStatus } from '../../../shared/models/order-status';



// --- Backend ---

export interface OrderItemDto {
  idProducts: number;
  productName: string;
  isbn: string;
  numberSold: number;
  unitPrice: number | null;
}

export interface OrderDto {
  idOrder: number;
  createDate: string;
  stateSold: { idStateSold: number; nameState: string };
  buyer: { idUser: number; name: string; lastname: string } | null;
  items: OrderItemDto[];
  total: number | null;
}

export interface OrdersPageDto {
  content: OrderDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// --- Modelo que usa la UI ---

export interface OrderLine {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number | null;
}

export interface Order {
  id: number;
  code: string;
  customerName: string;
  items: OrderLine[];
  total: number | null;
  status: OrderStatus;
  createdAt: string;
}

const STATUS_BY_STATE: Record<string, OrderStatus> = {
  PENDIENTE: 'pending',
  PAGADO: 'paid',
  CANCELADO: 'cancelled',
};

export const STATE_BY_FILTER: Partial<Record<OrderFilter, string>> = {
  pending: 'PENDIENTE',
  paid: 'PAGADO',
  cancelled: 'CANCELADO',
};

export const toOrder = (d: OrderDto): Order => ({
  id: d.idOrder,
  code: `PED${String(d.idOrder).padStart(4, '0')}`,
  customerName: d.buyer ? `${d.buyer.name} ${d.buyer.lastname}`.trim() : 'Cliente desconocido',
  items: d.items.map((i) => ({
    productId: i.idProducts,
    productName: i.productName,
    quantity: i.numberSold,
    unitPrice: i.unitPrice,
  })),
  total: d.total,
  status: STATUS_BY_STATE[d.stateSold.nameState.toUpperCase()] ?? 'pending',
  createdAt: d.createDate,
});
