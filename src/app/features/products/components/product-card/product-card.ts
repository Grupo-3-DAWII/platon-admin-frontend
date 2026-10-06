import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Badge, BadgeVariant } from '../../../../shared/components/badge/badge';
import { Icon } from '../../../../shared/components/icon/icon';
import { authorFullName, ProductResponse, ProductStatus } from '../../models/product';

const STATUS_BADGE: Record<ProductStatus, { label: string; variant: BadgeVariant }> = {
  available: { label: 'Disponible', variant: 'success' },
  low: { label: 'Poco stock', variant: 'warning' },
  out: { label: 'Agotado', variant: 'danger' },
};

@Component({
  imports: [Badge, Icon, CurrencyPipe, RouterLink],
  selector: 'app-product-card',
  templateUrl: './product-card.html',
})
export class ProductCard {
  book = input.required<ProductResponse>();

  badge = computed(() => STATUS_BADGE[this.book().status]);
  author = computed(() => authorFullName(this.book().author));
}
