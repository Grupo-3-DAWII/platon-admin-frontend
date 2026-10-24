import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RowAction, RowActions } from '../../../../shared/components/row-actions/row-actions';
import { catchError, map, of, startWith, Subject, switchMap, merge, timer } from 'rxjs';
import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { Icon } from '../../../../shared/components/icon/icon';
import { SearchInput } from '../../../../shared/components/search-input/search-input';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ListQuery } from '../../../../shared/utils/list-query';
import { Order } from '../../../orders/models/order';
import { OrdersService } from '../../../orders/services/orders.service';

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

@Component({
  imports: [
    CurrencyPipe,
    DataTable,
    DatePipe,
    Icon,
    SearchInput,
    PageHeader,
    Pagination,
    ReactiveFormsModule,
    RowActions,
  ],
  selector: 'app-sales-page',
  templateUrl: './sales-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesPage {
  private readonly service = inject(OrdersService);
  private readonly router = inject(Router);
  readonly rowActions: RowAction[] = [{ id: 'view', label: 'Ver detalle', icon: 'show2' }];

  handleAction(action: string, sale: Order): void {
    if (action === 'view') this.router.navigate(['/orders', sale.id]);
  }

  private readonly reload = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  readonly query = new ListQuery<'all'>('all');
  readonly filterPanelOpen = signal(false);
  readonly dates = signal({ from: '', to: '' });
  readonly oldestFirst = signal(false);
  readonly dateForm = this.fb.nonNullable.group({ from: '', to: '' });
  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly columns: TableColumn[] = [
    { key: 'id', label: 'N.º de venta', width: '16%' },
    { key: 'customer', label: 'Cliente', width: '30%' },
    { key: 'date', label: 'Fecha del pedido', width: '22%' },
    { key: 'total', label: 'Importe', width: '18%' },
    { key: 'actions', label: 'Acciones', width: '14%', align: 'center' },
  ];
  private readonly state = toSignal(
    merge(this.reload, timer(8000, 8000)).pipe(
      startWith(undefined),
      switchMap(() =>
        this.service.getAll().pipe(
          map((orders) => ({ orders, loading: false, error: false })),
          catchError(() => of({ orders: [] as Order[], loading: false, error: true })),
        ),
      ),
    ),
    { initialValue: { orders: [] as Order[], loading: true, error: false } },
  );
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly paidSales = computed(() =>
    this.state().orders.filter((order) => order.status === 'paid'),
  );
  readonly activeFilterCount = computed(
    () => Number(!!this.dates().from) + Number(!!this.dates().to),
  );
  readonly filteredSales = computed(() => {
    const term = normalize(this.query.search());
    const id = term.replace(/^#\s*/, '').replace(/^0+(?=\d)/, '');
    const { from, to } = this.dates();
    return this.paidSales()
      .filter((sale) => {
        const day = sale.createdAt?.slice(0, 10) ?? '';
        return (
          (!term ||
            String(sale.id) === id ||
            term.split(' ').every((part) => normalize(sale.customerName).includes(part))) &&
          (!from || day >= from) &&
          (!to || (!!day && day <= to))
        );
      })
      .sort((a, b) => {
        const comparison = (a.createdAt ?? '').localeCompare(b.createdAt ?? '') || a.id - b.id;
        return this.oldestFirst() ? comparison : -comparison;
      });
  });
  readonly totalCount = computed(() => this.filteredSales().length);
  readonly sales = computed(() => this.query.paginate(this.filteredSales()));

  get invalidRange(): boolean {
    const { from, to } = this.dateForm.getRawValue();
    const valid = (value: string) =>
      !value ||
      (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
        Number.isFinite(Date.parse(value)) &&
        new Date(value).toISOString().slice(0, 10) === value);
    return !valid(from) || !valid(to) || !!(from && to && from > to);
  }
  toggleFilters(): void {
    if (!this.filterPanelOpen()) this.dateForm.reset(this.dates());
    this.filterPanelOpen.update((open) => !open);
  }
  applyFilters(): void {
    if (this.invalidRange) return;
    this.dates.set(this.dateForm.getRawValue());
    this.query.setPage(1);
    this.filterPanelOpen.set(false);
  }
  clearFilters(): void {
    this.dates.set({ from: '', to: '' });
    this.dateForm.reset({ from: '', to: '' });
    this.query.setPage(1);
  }
  toggleSort(): void {
    this.oldestFirst.update((value) => !value);
    this.query.setPage(1);
  }
  retry(): void {
    this.query.setPage(1);
    this.reload.next();
  }
}
