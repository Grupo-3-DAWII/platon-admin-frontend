import { InventoryMovement } from '../models/inventory';

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

export const lastMovementsMockup: Record<number, InventoryMovement> = {
  1: { id: 1, productId: 1, type: 'exit', quantity: -2, createdAt: hoursAgo(1) },
  2: { id: 2, productId: 2, type: 'entry', quantity: 20, createdAt: hoursAgo(5) },
  3: { id: 3, productId: 3, type: 'exit', quantity: -1, createdAt: hoursAgo(20) },
  4: { id: 4, productId: 4, type: 'adjustment', quantity: -1, createdAt: hoursAgo(30) },
  6: { id: 6, productId: 6, type: 'entry', quantity: 30, createdAt: hoursAgo(55) },
  7: { id: 7, productId: 7, type: 'exit', quantity: -3, createdAt: hoursAgo(80) },
  8: { id: 8, productId: 8, type: 'exit', quantity: -1, createdAt: hoursAgo(100) },
  9: { id: 9, productId: 9, type: 'exit', quantity: -4, createdAt: hoursAgo(150) },
  10: { id: 10, productId: 10, type: 'adjustment', quantity: 2, createdAt: hoursAgo(200) },
};
