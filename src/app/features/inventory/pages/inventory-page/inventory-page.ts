import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
import { Icon } from '../../../../shared/components/icon/icon';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { StockStatusBadge } from '../../../../shared/components/stock-status-badge/stock-status-badge';
import { StockFilter } from '../../../../shared/models/stock-status';
import { authorFullName } from '../../../products/models/product';
import { InventoryService } from '../../services/inventory.service';
import { movementDate, movementSummary } from '../../utils/movement-format';

@Component({
  imports: [DataTable, FiltersBar, Icon, PageHeader, Pagination, StockStatusBadge, RouterLink],
  selector: 'app-inventory-page',
  templateUrl: './inventory-page.html',
})
export class InventoryPage {
  private readonly items = inject(InventoryService).items;

  readonly columns: TableColumn[] = [
    { key: 'product', label: 'Producto', width: '28%' },
    { key: 'genre', label: 'Género', width: '14%' },
    { key: 'stock', label: 'Cantidad', width: '10%' },
    { key: 'status', label: 'Estado', width: '16%' },
    { key: 'lastMovement', label: 'Último movimiento', width: '20%' },
    { key: 'actions', label: 'Acciones', width: '12%', align: 'center' },
  ];

  readonly pageSizeOptions = [5, 10, 25, 50];

  readonly authorFullName = authorFullName;
  readonly movementDate = movementDate;
  readonly movementSummary = movementSummary;

  totalCount = computed(() => this.items().length);

  selectedFilter = signal<StockFilter>('all');
  searchTerm = signal('');
  page = signal(1);
  pageSize = signal(10);

  filteredItems = computed(() => {
    const filter = this.selectedFilter();
    const term = this.searchTerm().trim().toLowerCase();

    return this.items().filter(({ product }) => {
      const matchesFilter = filter === 'all' || product.status === filter;
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        authorFullName(product.author).toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  });

  pagedItems = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredItems().slice(start, start + this.pageSize());
  });

  onFilterChange(filter: StockFilter) {
    this.selectedFilter.set(filter);
    this.page.set(1);
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.page.set(1);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.page.set(1);
  }

  openFilterPanel() {}

  openSortMenu() {}

  registerMovement() {}
}
