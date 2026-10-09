import { computed, inject, Injectable } from '@angular/core';
import { ProductsService } from '../../products/services/products.service';
import { lastMovementsMockup } from '../data/mockup';
import { InventoryItem } from '../models/inventory';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly products = inject(ProductsService).books;

  // Mock: reemplazar cuando el backend exponga el último movimiento por producto.
  readonly items = computed<InventoryItem[]>(() =>
    this.products().map((product) => ({
      product,
      lastMovement: lastMovementsMockup[product.id] ?? null,
    })),
  );
}
