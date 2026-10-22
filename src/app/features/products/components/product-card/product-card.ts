import { Component, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RowAction, RowActions } from '../../../../shared/components/row-actions/row-actions';
import { StockStatusBadge } from '../../../../shared/components/stock-status-badge/stock-status-badge';
import { ProductSummary } from '../../models/product';

@Component({
  imports: [StockStatusBadge, RowActions, CurrencyPipe, RouterLink ],
  selector: 'app-product-card',
  templateUrl: './product-card.html',
})
export class ProductCard {
  private readonly router = inject(Router);

  book = input.required<ProductSummary>();

  readonly actions: RowAction[] = [
    { id: 'edit', label: 'Editar', icon: 'edit' },
    { id: 'inventory', label: 'Ver inventario', icon: 'inventory' },
    { id: 'view', label: 'Ver detalles', icon: 'show2' },
  ];

  handleAction(action: string): void {
    const id = this.book().id;
    if (action === 'view') this.router.navigate(['/products', id]);
    else if (action === 'edit') this.router.navigate(['/products', id, 'edit']);
    else if (action === 'inventory') this.router.navigate(['/inventory', id]);
  }
}