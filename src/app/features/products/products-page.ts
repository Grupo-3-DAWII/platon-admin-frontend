import { Component, computed, signal } from '@angular/core';
import { ProductCard } from './components/product-card/product-card';
import { Icon } from '../../shared/components/icon/icon';
import { FiltersBar, StockFilter } from './components/filters-bar/filters-bar';
import { Book } from './models/product';
import { productsMockup } from './data/mockup';

@Component({
  imports: [Icon, ProductCard, FiltersBar],
  selector: 'app-products-page',
  templateUrl: './products-page.html',
})
export class ProductsPage {
  products = signal<Book[]>(productsMockup);

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
