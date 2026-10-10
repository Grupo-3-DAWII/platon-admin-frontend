import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
import { Icon } from '../../../../shared/components/icon/icon';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ListQuery } from '../../../../shared/utils/list-query';
import { OrderStatusBadge } from '../../components/order-status-badge/order-status-badge';
import { ORDER_FILTERS, OrderFilter } from '../../models/order';
import { OrdersService } from '../../services/orders.service';

@Component({
  imports: [
    CurrencyPipe,
    DataTable,
    DatePipe,
    FiltersBar,
    Icon,
    OrderStatusBadge,
    PageHeader,
    Pagination,
  ],
  selector: 'app-orders-page',
  templateUrl: './orders-page.html',
})
export class OrdersPage {
  private readonly orders = inject(OrdersService).orders;

  readonly columns: TableColumn[] = [
    { key: 'id', label: '#', width: '5%' },
    { key: 'code', label: 'Pedido ID', width: '13%' },
    { key: 'customer', label: 'Cliente', width: '17%' },
    { key: 'product', label: 'Producto', width: '22%' },
    { key: 'date', label: 'Fecha', width: '12%' },
    { key: 'total', label: 'Total', width: '11%' },
    { key: 'status', label: 'Estado', width: '12%' },
    { key: 'actions', label: 'Acciones', width: '8%', align: 'center' },
  ];

  readonly filters = ORDER_FILTERS;
  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly query = new ListQuery<OrderFilter>('all');

  totalCount = computed(() => this.orders().length);

  filteredOrders = computed(() => {
    const filter = this.query.filter();
    const term = this.query.search().trim().toLowerCase();

    return this.orders().filter((order) => {
      const matchesFilter = filter === 'all' || order.status === filter;
      const matchesSearch =
        !term ||
        order.code.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.items.some((item) => item.productName.toLowerCase().includes(term));
      return matchesFilter && matchesSearch;
    });
  });

  pagedOrders = computed(() => this.query.paginate(this.filteredOrders()));

  openFilterPanel() {}

  openSortMenu() {}

  createOrder() {}
}
