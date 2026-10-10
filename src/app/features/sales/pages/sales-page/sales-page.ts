import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
import { Icon } from '../../../../shared/components/icon/icon';
import { OrderStatusBadge } from '../../../../shared/components/order-status-badge/order-status-badge';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ORDER_FILTERS, OrderFilter } from '../../../../shared/models/order-status';
import { ListQuery } from '../../../../shared/utils/list-query';
import { PaymentStatusBadge } from '../../components/payment-status-badge/payment-status-badge';
import { SalesService } from '../../services/sales.service';
import { RouterLink } from '@angular/router';

@Component({
  imports: [
    RouterLink,
    CurrencyPipe,
    DataTable,
    DatePipe,
    FiltersBar,
    Icon,
    OrderStatusBadge,
    PageHeader,
    Pagination,
    PaymentStatusBadge,
  ],
  selector: 'app-sales-page',
  templateUrl: './sales-page.html',
})
export class SalesPage {
  private readonly sales = inject(SalesService).sales;

  readonly columns: TableColumn[] = [
    { key: 'id', label: '#', width: '5%' },
    { key: 'code', label: 'Venta ID', width: '11%' },
    { key: 'order', label: 'Pedido ID', width: '12%' },
    { key: 'customer', label: 'Cliente', width: '17%' },
    { key: 'date', label: 'Fecha', width: '11%' },
    { key: 'total', label: 'Total', width: '11%' },
    { key: 'payment', label: 'Pago', width: '12%' },
    { key: 'status', label: 'Estado', width: '12%' },
    { key: 'actions', label: 'Acciones', width: '9%', align: 'center' },
  ];

  readonly filters = ORDER_FILTERS;
  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly query = new ListQuery<OrderFilter>('all');

  totalCount = computed(() => this.sales().length);

  filteredSales = computed(() => {
    const filter = this.query.filter();
    const term = this.query.search().trim().toLowerCase();

    return this.sales().filter((sale) => {
      const matchesFilter = filter === 'all' || sale.status === filter;
      const matchesSearch =
        !term ||
        sale.code.toLowerCase().includes(term) ||
        sale.orderCode.toLowerCase().includes(term) ||
        sale.customerName.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  });

  pagedSales = computed(() => this.query.paginate(this.filteredSales()));

  openFilterPanel() {}

  openSortMenu() {}
}
