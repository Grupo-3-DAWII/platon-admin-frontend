import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
import { Icon } from '../../../../shared/components/icon/icon';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StockFilter } from '../../../../shared/models/stock-status';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductsService } from '../../services/products.service';

@Component({
  imports: [Icon, ProductCard, FiltersBar, PageHeader, RouterLink],
  styleUrl: '../../style/products.css',
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
