import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogList } from '../../../../shared/utils/catalog-list';
import { CollectionFilters } from '../../../../shared/components/collection-filters/collection-filters';

import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
import { Icon } from '../../../../shared/components/icon/icon';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { StockStatusBadge } from '../../../../shared/components/stock-status-badge/stock-status-badge';
import { STOCK_FILTERS, StockFilter } from '../../../../shared/models/stock-status';

import { InventoryItem } from '../../models/inventory';
import { InventoryService } from '../../services/inventory.service';
import { movementDate, movementSummary } from '../../utils/movement-format';
import { MovementDialog } from '../../components/movement-dialog/movement-dialog';

@Component({
  imports: [
    DataTable,
    FiltersBar,
    CollectionFilters,
    Icon,
    PageHeader,
    Pagination,
    StockStatusBadge,
    RouterLink,
    MovementDialog,
  ],
  selector: 'app-inventory-page',
  templateUrl: './inventory-page.html',
})
export class InventoryPage {
  private readonly service = inject(InventoryService);
  readonly list = new CatalogList(() => this.service.getAll(), 'inventory');

  readonly columns: TableColumn[] = [
    { key: 'product', label: 'Producto', width: '28%' },
    { key: 'genre', label: 'Género', width: '14%' },
    { key: 'stock', label: 'Cantidad', width: '10%' },
    { key: 'status', label: 'Estado', width: '16%' },
    { key: 'lastMovement', label: 'Último movimiento', width: '20%' },
    { key: 'actions', label: 'Acciones', width: '12%', align: 'center' },
  ];

  readonly pageSizeOptions = [5, 10, 25, 50];

  readonly movementDate = movementDate;
  readonly movementSummary = movementSummary;

  readonly filters = STOCK_FILTERS;

  readonly selectedFilter = this.list.query.filter;
  readonly search = this.list.query.search;
  readonly page = this.list.page;
  readonly pageSize = this.list.query.pageSize;
  readonly loading = this.list.loading;
  readonly error = this.list.error;
  readonly totalElements = this.list.total;
  readonly filteredItems = this.list.paged;
  readonly movementTarget = signal<InventoryItem | null>(null);
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

  openMovement(item: InventoryItem) {
    this.movementTarget.set(item);
  }

  closeMovement() {
    this.movementTarget.set(null);
  }

  onMovementSaved() {
    this.closeMovement();
    this.retry();
  }
}
