import { StockStatus } from '../../../shared/models/stock-status';
import { PLACEHOLDER_COVER, stockStatus } from '../../products/models/product';

export type MovementType = 'entry' | 'exit';

// Backend
export type MovementTypeDto = 'ENTRY' | 'EXIT';

export interface StockMovementDto {
  idMovement: number;
  productId: number;
  type: MovementTypeDto;
  quantity: number;
  movementDate: string;
  resultingStock: number;
  notes: string | null;
  createdAt: string;
}

export interface StockMovementRequest {
  type: MovementTypeDto;
  quantity: number; 
  notes?: string; 
}

export interface InventoryItemDto {
  idProduct: number;
  name: string;
  author: string;
  genre: string;
  image: string | null;
  stock: number;
  active: boolean;
  available: boolean;
  lastMovement: StockMovementDto | null;
}

// UI
export interface InventoryMovement {
  id: number;
  productId: number;
  type: MovementType;
  quantity: number; // entrada +, salida -
  date: string;
  resultingStock: number;
  notes: string | null;
}

export interface InventoryItem {
  id: number;
  name: string;
  author: string;
  genre: string;
  imageUrl: string;
  stock: number;
  active: boolean;
  status: StockStatus;
  lastMovement: InventoryMovement | null;
}

// Mapping
export const toInventoryMovement = (d: StockMovementDto): InventoryMovement => ({
  id: d.idMovement,
  productId: d.productId,
  type: d.type === 'ENTRY' ? 'entry' : 'exit',
  quantity: d.type === 'ENTRY' ? d.quantity : -d.quantity,
  date: d.movementDate,
  resultingStock: d.resultingStock,
  notes: d.notes,
});

export const toInventoryItem = (d: InventoryItemDto): InventoryItem => ({
  id: d.idProduct,
  name: d.name,
  author: d.author,
  genre: d.genre,
  imageUrl: d.image || PLACEHOLDER_COVER,
  stock: d.stock,
  active: d.active,
  status: stockStatus(d.stock),
  lastMovement: d.lastMovement ? toInventoryMovement(d.lastMovement) : null,
});