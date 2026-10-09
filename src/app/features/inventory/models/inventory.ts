import { ProductResponse } from '../../products/models/product';

export type MovementType = 'entry' | 'exit' | 'adjustment';

export interface InventoryMovement {
  id: number;
  productId: number;
  type: MovementType;
  quantity: number;
  createdAt: string;
}

export interface InventoryItem {
  product: ProductResponse;
  lastMovement: InventoryMovement | null;
}
