import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';

import { Badge, BadgeVariant } from '../../../../shared/components/badge/badge';
import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
import { Icon } from '../../../../shared/components/icon/icon';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ListQuery } from '../../../../shared/utils/list-query';

import { CUSTOMER_FILTERS, CustomerFilter } from '../../models/customer-filter.model';
import { Customer } from '../../models/customer.model';
import { CustomersService } from '../../services/customers.service';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [Badge, DataTable, FiltersBar, Icon, PageHeader, Pagination],
  templateUrl: './customers-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersPage implements OnInit {
  private readonly customersService = inject(CustomersService);

  readonly customers = signal<Customer[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly sortDirection = signal<SortDirection>('asc');

  readonly filters = CUSTOMER_FILTERS;

  readonly pageSizeOptions = [10, 25, 50];

  readonly query = new ListQuery<CustomerFilter>('all');

  readonly columns: TableColumn[] = [
    {
      key: 'id',
      label: '#',
      width: '6%',
    },
    {
      key: 'customer',
      label: 'Cliente',
      width: '26%',
    },
    {
      key: 'username',
      label: 'Usuario',
      width: '17%',
    },
    {
      key: 'createdAt',
      label: 'Fecha de registro',
      width: '18%',
    },
    {
      key: 'status',
      label: 'Estado',
      width: '14%',
    },
    {
      key: 'actions',
      label: 'Acciones',
      width: '10%',
      align: 'center',
    },
  ];

  readonly totalCount = computed(() => this.customers().length);

  readonly filteredCustomers = computed(() => {
    const filter = this.query.filter();

    const search = this.query.search().trim().toLowerCase();

    const direction = this.sortDirection();

    const customers = this.customers().filter((customer) => {
      const status = customer.status.toLowerCase();

      const matchesFilter = filter === 'all' || status === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      return (
        customer.fullName.toLowerCase().includes(search) ||
        customer.username.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search)
      );
    });

    return [...customers].sort((first, second) => {
      const result = first.fullName.localeCompare(second.fullName, 'es', {
        sensitivity: 'base',
      });

      return direction === 'asc' ? result : -result;
    });
  });

  readonly pagedCustomers = computed(() => this.query.paginate(this.filteredCustomers()));

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.customersService
      .getCustomers()
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (customers) => {
          this.customers.set(customers);
        },

        error: () => {
          this.customers.set([]);

          this.errorMessage.set('No pudimos cargar los clientes. Inténtalo nuevamente.');
        },
      });
  }

  toggleSort(): void {
    this.sortDirection.update((direction) => (direction === 'asc' ? 'desc' : 'asc'));
  }

  getStatusLabel(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Activo';

      case 'inactive':
        return 'Inactivo';

      default:
        return status;
    }
  }

  getStatusVariant(status: string): BadgeVariant {
    return status.toLowerCase() === 'active' ? 'success' : 'neutral';
  }

  formatDate(date: string | null): string {
    if (!date) {
      return '—';
    }

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  }
}
