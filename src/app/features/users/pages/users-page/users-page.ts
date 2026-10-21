import { AccountFilters, AccountFiltersValue, EMPTY_ACCOUNT_FILTERS, accountFilterCount, accountFilterLabels, matchesRegistrationDate } from '../../../../shared/components/account-filters/account-filters';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ElementRef,
  viewChild,
} from '@angular/core';
import { EMPTY, finalize, forkJoin, switchMap } from 'rxjs';
import { AccountApiService, AccountRole } from '../../../../core/configuration/account-api.service';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

import { SanitizeInput } from '../../../../shared/directives/sanitize-input.directive';
import { ACCOUNT_FIELDS, accountFieldError, enableUsernameSuggestion, createAccountForm, findDuplicateAccountFields, normalizeAccountForm, passwordValidators } from '../../../../shared/utils/account-inputs';
import { RowActions, RowAction } from '../../../../shared/components/row-actions/row-actions';
import { Icon } from '../../../../shared/components/icon/icon';
import { Badge, type BadgeVariant } from '../../../../shared/components/badge/badge';
import { DataTable, type TableColumn } from '../../../../shared/components/data-table/data-table';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ListQuery } from '../../../../shared/utils/list-query';

import { USER_FILTERS, type UserFilter } from '../../models/user-filter.model';
import { AccountStatus, User } from '../../models/user.model';
import { UsersService } from '../../services/users.service';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [AccountFilters, SanitizeInput, RowActions, Icon, Badge, DataTable, FiltersBar, PageHeader, Pagination, DatePipe, ReactiveFormsModule],
  templateUrl: './users-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPage implements OnInit {
  private readonly accounts = inject(AccountApiService);
  readonly roles = signal<AccountRole[]>([]);
  readonly catalogError = signal('');
  private readonly usersService = inject(UsersService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly viewDialog = viewChild<ElementRef<HTMLDialogElement>>('viewDialog');
  readonly viewedUser = signal<User | null>(null);

  userActions(user: User): RowAction[] {
    return [
      { id: 'view', label: 'Ver', icon: 'show2' },
      { id: 'edit', label: 'Editar', icon: 'edit', disabled: !!this.catalogError() },
      { id: 'deactivate', label: 'Desactivar', icon: 'lock', danger: true,
        disabled: !!this.catalogError() || user.role === 'ADMIN' || user.status.toLowerCase() !== 'active' },
    ];
  }

  handleAction(action: string, user: User): void {
    if (action === 'view') {
      this.viewedUser.set(user);
      this.viewDialog()?.nativeElement.showModal();
    } else if (action === 'edit') this.openUserDialog(user);
    else if (action === 'deactivate') this.openDeactivate(user);
  }

  closeView(): void { this.viewDialog()?.nativeElement.close(); }

  readonly userDialog = viewChild<ElementRef<HTMLDialogElement>>('userDialog');
  readonly deactivateDialog = viewChild<ElementRef<HTMLDialogElement>>('deactivateDialog');
  readonly statuses = signal<AccountStatus[]>([]);
  readonly editingUser = signal<User | null>(null);
  readonly deactivatingUser = signal<User | null>(null);
  readonly saving = signal(false);
  readonly formError = signal('');
  readonly notice = signal('');
  readonly userFields = ACCOUNT_FIELDS;
  readonly userForm = createAccountForm(this.fb.nonNullable);

  fieldError(name: keyof typeof this.userForm.controls): string {
    return accountFieldError(this.userForm.controls[name], name);
  }


  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly filterPanelOpen = signal(false);
  readonly advancedFilters = signal<AccountFiltersValue>({ ...EMPTY_ACCOUNT_FILTERS });
  readonly activeFilterLabels = computed(() => accountFilterLabels(this.advancedFilters()));
  readonly activeFilterCount = computed(() => accountFilterCount(this.advancedFilters()));
  applyAdvancedFilters(value: AccountFiltersValue): void {
    this.advancedFilters.set(value);
    this.query.setPage(1);
    this.filterPanelOpen.set(false);
  }
  clearAdvancedFilters(): void { this.applyAdvancedFilters({ ...EMPTY_ACCOUNT_FILTERS }); }

  readonly sortDirection = signal<SortDirection>('asc');

  readonly filters = USER_FILTERS;
  readonly pageSizeOptions = [5, 10, 25, 50];

  readonly query = new ListQuery<UserFilter>('all');

  readonly columns: TableColumn[] = [
    { key: 'id', label: '#', width: '5%' },
    { key: 'user', label: 'Usuario', width: '28%' },
    { key: 'contact', label: 'Contacto', width: '15%' },
    { key: 'role', label: 'Rol', width: '15%' },
    { key: 'createdAt', label: 'Fecha creación', width: '15%' },
    { key: 'status', label: 'Estado', width: '12%' },
    { key: 'actions', label: 'Acciones', width: '10%', align: 'center' },
  ];

  readonly totalCount = computed(() => this.users().length);

  readonly filteredUsers = computed(() => {
    const filter = this.query.filter();
    const search = this.query.search().trim().toLowerCase();
    const direction = this.sortDirection();

    const users = this.users().filter((user) => {
      const status = user.status.toLowerCase();
      const advanced = this.advancedFilters();
      if (!matchesRegistrationDate(user.createdAt, advanced)) return false;
      if (advanced.role !== 'all' && user.role.toUpperCase() !== advanced.role) return false;


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

  constructor() {
    enableUsernameSuggestion(this.userForm, () => !this.editingUser());
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({ users: this.usersService.getUsers(), statuses: this.usersService.getStatuses(), roles: this.accounts.getRoles() })
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: ({ users, statuses, roles }) => {
          this.users.set(users);
          this.statuses.set(statuses);
          this.roles.set(roles.filter((role) => ['ADMIN', 'SELLER'].includes(role.name.toUpperCase())));
          this.catalogError.set(users.some((user) => !statuses.some((status) => status.idStatus === user.idStatus
            && status.name === user.status.toLowerCase()))
            ? 'Los estados de estas cuentas no coinciden con la configuración del panel. Revisa account.config.ts antes de editar.' : '');
          this.query.setPage(Math.min(this.query.page(), Math.max(1, Math.ceil(users.length / this.query.pageSize()))));
        },

        error: () => {
          this.users.set([]);

          this.errorMessage.set('No pudimos cargar los usuarios. Inténtalo nuevamente.');
        },
      });
  }

  openUserDialog(user: User | null = null): void {
    this.editingUser.set(user);
    this.formError.set('');
    this.userForm.reset({
      name: user?.name ?? '', lastname: user?.lastname ?? '', username: user?.username ?? '',
      email: user?.email ?? '', nro: user?.nro ?? '', direccion: user?.direccion ?? '',
      idStatus: user?.idStatus ?? this.statuses().find((status) => status.name.toLowerCase() === 'active')?.idStatus ?? 0,
      idRole: user?.idRole ?? this.roles().find((role) => role.name.toUpperCase() === 'SELLER')?.idRole ?? 0,
      password: '',
    });
    const password = this.userForm.controls.password;
    password.setValidators(passwordValidators(!user));
    password.updateValueAndValidity();
    this.userDialog()?.nativeElement.showModal();
  }

  closeUserDialog(event?: Event): void {
    if (this.saving()) { event?.preventDefault(); return; }
    this.userDialog()?.nativeElement.close();
    this.userForm.controls.password.reset('');
  }

  saveUser(): void {
    if (this.saving() || this.catalogError()) return;
    normalizeAccountForm(this.userForm);
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid) return;
    const value = this.userForm.getRawValue();
    const request = { ...value, password: value.password || undefined };
    const editing = this.editingUser();
    const operation = editing ? this.usersService.updateUser(editing.idUser, request) : this.usersService.createUser(request);
    this.saving.set(true);
    this.formError.set('');
    this.accounts.getAccounts().pipe(switchMap((accounts) => {
      const duplicates = findDuplicateAccountFields(accounts, request, editing?.idUser);
      if (duplicates.length) {
        for (const field of duplicates) this.userForm.controls[field].setErrors({ duplicate: true });
        return EMPTY;
      }
      return operation;
    }), finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.userDialog()?.nativeElement.close();
        this.userForm.controls.password.reset('');
        if (editing && editing.idUser === this.auth.session()?.user.idUser) {
          this.auth.logout();
          void this.router.navigate(['/login']);
          return;
        }
        this.notice.set(editing ? 'Usuario actualizado.' : 'Cuenta creada. Ya puede iniciar sesión con su cuenta.');
        this.loadUsers();
      },
      error: (error: HttpErrorResponse) => this.formError.set(error.status === 409
        ? 'Datos ya registrados.' : 'No se pudo guardar. Inténtalo otra vez.'),
    });
  }

  fieldInvalid(name: keyof typeof this.userForm.controls): boolean {
    const control = this.userForm.controls[name];
    return control.touched && control.invalid;
  }

  openDeactivate(user: User): void {
    this.deactivatingUser.set(user);
    this.formError.set('');
    this.deactivateDialog()?.nativeElement.showModal();
  }

  closeDeactivate(event?: Event): void {
    if (this.saving()) { event?.preventDefault(); return; }
    this.deactivateDialog()?.nativeElement.close();
  }

  confirmDeactivate(): void {
    const user = this.deactivatingUser();
    if (!user || this.saving() || this.catalogError() || user.idUser === this.auth.session()?.user.idUser) return;
    this.saving.set(true);
    this.usersService.getUserById(user.idUser).pipe(
      switchMap((current) => this.usersService.updateUser(current.idUser, {
        name: current.name, lastname: current.lastname, username: current.username,
        email: current.email, nro: current.nro, direccion: current.direccion,
        idRole: current.idRole, idStatus: this.statuses().find((status) => status.name === 'inactive')!.idStatus,
      })), finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.deactivateDialog()?.nativeElement.close();
        this.notice.set('Usuario desactivado. Sus datos se conservaron.');
        this.loadUsers();
      },
      error: () => this.formError.set('No se pudo desactivar el usuario. Inténtalo nuevamente.'),
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
