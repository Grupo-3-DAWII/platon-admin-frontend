import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { ProductCard } from '../../components/product-card/product-card';
import { FiltersBar, StockFilter } from '../../components/filters-bar/filters-bar';
import { ProductsService } from '../../services/products.service';

@Component({
  imports: [Icon, ProductCard, FiltersBar, RouterLink],
  selector: 'app-products-list-page',
  templateUrl: './products-list-page.html',
})
export class ProductsListPage {
  products = inject(ProductsService).books;

  selectedFilter = signal<StockFilter>('all');

  filteredProducts = computed(() => {
    const filter = this.selectedFilter();
    const all = this.products();
    return filter === 'all' ? all : all.filter((p) => p.status === filter);
  });

  onFilterChange(filter: StockFilter) {
    this.selectedFilter.set(filter);
  }

  openFilterPanel() {}
  openSortMenu() {}
}
