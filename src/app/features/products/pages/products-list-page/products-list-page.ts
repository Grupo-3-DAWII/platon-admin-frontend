import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
import { CollectionFilters } from '../../../../shared/components/collection-filters/collection-filters';
import { Icon } from '../../../../shared/components/icon/icon';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { STOCK_FILTERS, StockFilter } from '../../../../shared/models/stock-status';
import { CatalogList } from '../../../../shared/utils/catalog-list';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductsService } from '../../services/products.service';
@Component({
  imports: [Icon, ProductCard, FiltersBar, CollectionFilters, PageHeader, Pagination, RouterLink],
  styleUrl: '../../style/products.css',
  selector: 'app-products-list-page',
  templateUrl: './products-list-page.html',
})
export class ProductsListPage {
  private readonly service = inject(ProductsService);
  readonly list = new CatalogList(() => this.service.getAll(), 'products');
  readonly filters = STOCK_FILTERS;
  readonly pageSizeOptions = [12, 24, 48];
  readonly selectedFilter = this.list.query.filter;
  readonly search = this.list.query.search;
  readonly page = this.list.page;
  readonly pageSize = this.list.query.pageSize;
  readonly loading = this.list.loading;
  readonly error = this.list.error;
  readonly totalElements = this.list.total;
  readonly filteredProducts = this.list.paged;
  constructor() {
    this.list.query.setPageSize(12);
  }
  onSearch(term: string) {
    this.list.query.setSearch(term);
  }
  onFilterChange(filter: StockFilter) {
    this.list.query.setFilter(filter);
  }
  onPageChange(page: number) {
    this.list.query.setPage(page);
  }
  onPageSizeChange(size: number) {
    this.list.query.setPageSize(size);
  }
  retry() {
    this.list.retry();
  }
}
