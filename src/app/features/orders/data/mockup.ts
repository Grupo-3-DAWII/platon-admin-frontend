import { OrderStatus } from '../../../shared/models/order-status';
import { OrderItem, OrderResponse } from '../models/order';

const book = (
  productId: number,
  productName: string,
  quantity: number,
  unitPrice: number,
): OrderItem => ({ productId, productName, quantity, unitPrice });

const order = (
  id: number,
  customerName: string,
  createdAt: string,
  status: OrderStatus,
  items: OrderItem[],
): OrderResponse => ({
  id,
  code: `PED${String(id).padStart(4, '0')}`,
  customerName,
  items,
  total: items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
  status,
  createdAt,
});

const cien = (q = 1) => book(1, 'Cien años de soledad', q, 59.9);
const quijote = (q = 1) => book(2, 'Don Quijote de la Mancha', q, 74.5);
const ciudad = (q = 1) => book(3, 'La ciudad y los perros', q, 52);
const ficciones = (q = 1) => book(4, 'Ficciones', q, 45.9);
const principito = (q = 1) => book(9, 'El principito', q, 29.9);
const rayuela = (q = 1) => book(10, 'Rayuela', q, 68);

export const ordersMockup: OrderResponse[] = [
  order(1, 'Angelica Torres', '2026-10-09T10:37:00', 'delivered', [cien(2), ciudad(), ficciones()]),
  order(2, 'Luis Mendoza', '2026-10-09T09:12:00', 'pending', [principito(3)]),
  order(3, 'Andrea Ramos', '2026-10-08T17:45:00', 'delivered', [rayuela(), quijote()]),
  order(4, 'Carlos Quispe', '2026-10-08T11:20:00', 'cancelled', [ficciones(2)]),
  order(5, 'Marisol Vargas', '2026-10-07T15:05:00', 'delivered', [cien()]),
  order(6, 'Jorge Salazar', '2026-10-06T12:30:00', 'pending', [ciudad(2), principito()]),
  order(7, 'Rosa Huamán', '2026-10-05T18:10:00', 'delivered', [quijote(2)]),
  order(8, 'Diego Paredes', '2026-10-03T10:00:00', 'cancelled', [rayuela(2), cien()]),
  order(9, 'Lucía Fernández', '2026-10-01T14:25:00', 'delivered', [principito(2)]),
  order(10, 'Miguel Rojas', '2026-09-30T16:40:00', 'delivered', [ficciones(), rayuela(), ciudad()]),
  order(11, 'Patricia León', '2026-09-28T09:55:00', 'pending', [cien(3)]),
  order(12, 'Renzo Castillo', '2026-09-28T08:15:00', 'delivered', [quijote()]),
];
