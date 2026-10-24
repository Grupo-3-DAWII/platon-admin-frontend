import type { FulfillmentStatus } from './order-progress';
import { OrderFilter, OrderStatus } from '../../../shared/models/order-status';

// --- Backend ---

export interface OrderProductDto {
  name: string;
  isbn: string;
  author: string;
  imageUrl?: string | null;
}

export interface OrderItemDto {
  idProducts: number;
  numberSold: number;
  product: OrderProductDto | null;
  unitPrice: number | null;
  subtotal: number | null;
}

export interface OrderDto {
  idProductsSold: number;
  idUser: number;
  createDate: string;
  stateSold: { idStateSold: number; nameState: string };
  buyer: { name: string; lastname: string } | null;
  products: OrderItemDto[];
  totalAmount: number | null;
  orderStatus?: FulfillmentStatus;
  paymentMethod?: string | null;
  paidAt?: string | null;
  paymentReference?: string | null;
}

export interface OrdersPageDto {
  content: OrderDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  message?: string | null;
}

// --- Modelo que usa la UI ---

export interface OrderLine {
  isbn?: string;
  author?: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number | null;
  subtotal: number | null;
}

export interface Order {
  id: number;
  customerName: string;
  items: OrderLine[];
  total: number | null;
  status: OrderStatus;
  createdAt: string;
  orderStatus?: FulfillmentStatus;
  paymentMethod?: string | null;
  paidAt?: string | null;
  paymentReference?: string | null;
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
  id: d.idProductsSold,
  customerName: d.buyer ? `${d.buyer.name} ${d.buyer.lastname}`.trim() : 'Cliente desconocido',
  items: (d.products ?? []).map((i) => ({
    productId: i.idProducts,
    isbn: i.product?.isbn,
    author: i.product?.author,
    productName: i.product?.name ?? `Producto #${i.idProducts}`,
    quantity: i.numberSold,
    unitPrice: i.unitPrice,
    subtotal: i.subtotal,
  })),
  total: d.totalAmount,
  status: STATUS_BY_STATE[d.stateSold.nameState.toUpperCase()] ?? 'unknown',
  createdAt: d.createDate,
  orderStatus: d.orderStatus,
  paymentMethod: d.paymentMethod,
  paidAt: d.paidAt,
  paymentReference: d.paymentReference,
});
export interface OrderStateDto {
  idStateSold: number;
  nameState: string;
}

export interface PurchaseRequest {
  idUser: number;
  idStateSold: number;
  products: { idProducts: number; numberSold: number }[];
  totalAmount: number;
}

export interface PurchaseResponseDto {
  idProductsSold: number;
}
