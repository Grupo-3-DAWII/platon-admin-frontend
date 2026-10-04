import { Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Badge, BadgeVariant } from '../../../../shared/components/badge/badge';
import { Icon } from '../../../../shared/components/icon/icon';
import { Book, ProductStatus } from '../../models/product';
import { ProductsService } from '../../services/products.service';
import { RouterLink } from '@angular/router';

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
  private readonly service = inject(ProductsService);

  book = input.required<Book>();

  badge = computed(() => STATUS_BADGE[this.book().status]);
  genre = computed(() => this.service.genreName(this.book().genreId));
}
