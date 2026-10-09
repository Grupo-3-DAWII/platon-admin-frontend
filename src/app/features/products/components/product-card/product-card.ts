import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { StockStatusBadge } from '../../../../shared/components/stock-status-badge/stock-status-badge';
import { authorFullName, ProductResponse } from '../../models/product';

@Component({
  imports: [StockStatusBadge, Icon, CurrencyPipe, RouterLink],
  selector: 'app-product-card',
  templateUrl: './product-card.html',
})
export class ProductCard {
  book = input.required<ProductResponse>();

  author = computed(() => authorFullName(this.book().author));
}
