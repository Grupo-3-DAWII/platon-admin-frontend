import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';

import { Badge, type BadgeVariant } from '../../../../shared/components/badge/badge';
import { DataTable, type TableColumn } from '../../../../shared/components/data-table/data-table';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
import { Icon } from '../../../../shared/components/icon/icon';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ListQuery } from '../../../../shared/utils/list-query';

import { USER_FILTERS, type UserFilter } from '../../models/user-filter.model';
import { User } from '../../models/user.model';
import { UsersService } from '../../services/users.service';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [Badge, DataTable, FiltersBar, Icon, PageHeader, Pagination],
  templateUrl: './users-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPage implements OnInit {
  private readonly usersService = inject(UsersService);

  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly filterPanelOpen = signal(false);
  readonly sortDirection = signal<SortDirection>('asc');

  readonly filters = USER_FILTERS;
  readonly pageSizeOptions = [5, 10, 25, 50];

  readonly query = new ListQuery<UserFilter>('all');

  readonly columns: TableColumn[] = [
    {
      key: 'id',
      label: '#',
      width: '5%',
    },
    {
      key: 'user',
      label: 'Usuario',
      width: '22%',
    },
    {
      key: 'contact',
      label: 'Contacto',
      width: '12%',
    },
    {
      key: 'role',
      label: 'Rol',
      width: '13%',
    },
    {
      key: 'lastAccess',
      label: 'Último acceso',
      width: '14%',
    },
    {
      key: 'createdAt',
      label: 'Fecha creación',
      width: '14%',
    },
    {
      key: 'status',
      label: 'Estado',
      width: '11%',
    },
    {
      key: 'actions',
      label: 'Acciones',
      width: '9%',
      align: 'center',
    },
  ];

  readonly totalCount = computed(() => this.users().length);

  readonly filteredUsers = computed(() => {
    const filter = this.query.filter();
    const search = this.query.search().trim().toLowerCase();
    const direction = this.sortDirection();

    const users = this.users().filter((user) => {
      const status = user.status.toLowerCase();

      const matchesFilter = filter === 'all' || status === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      const fullName = this.getFullName(user).toLowerCase();

      return (
        fullName.includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.username.toLowerCase().includes(search) ||
        user.nro.toLowerCase().includes(search)
      );
    });

    return [...users].sort((a, b) => {
      const firstName = this.getFullName(a);
      const secondName = this.getFullName(b);

      const result = firstName.localeCompare(secondName, 'es', {
        sensitivity: 'base',
      });

      return direction === 'asc' ? result : -result;
    });
  });

  readonly pagedUsers = computed(() => this.query.paginate(this.filteredUsers()));

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.usersService
      .getUsers()
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (users) => {
          this.users.set(users);
        },

        error: () => {
          this.users.set([]);

          this.errorMessage.set('No pudimos cargar los usuarios. Inténtalo nuevamente.');
        },
      });
  }

  getFullName(user: User): string {
    return `${user.name} ${user.lastname}`.trim();
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
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';

      case 'inactive':
        return 'neutral';

      default:
        return 'neutral';
    }
  }

  toggleFilterPanel(): void {
    this.filterPanelOpen.update((value) => !value);
  }

  closeFilterPanel(): void {
    this.filterPanelOpen.set(false);
  }

  selectFilter(filter: UserFilter): void {
    this.query.setFilter(filter);
    this.closeFilterPanel();
  }

  toggleSort(): void {
    this.sortDirection.update((direction) => (direction === 'asc' ? 'desc' : 'asc'));
  }
}
