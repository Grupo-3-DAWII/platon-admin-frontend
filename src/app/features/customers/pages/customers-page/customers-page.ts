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
import { CurrencyPipe, DatePipe } from '@angular/common';
import { EMPTY, finalize, switchMap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Icon } from '../../../../shared/components/icon/icon';
import { AccountApiService } from '../../../../core/configuration/account-api.service';
import { SanitizeInput } from '../../../../shared/directives/sanitize-input.directive';
import { ACCOUNT_FIELDS, accountFieldError, enableUsernameSuggestion, createAccountForm, findDuplicateAccountFields, normalizeAccountForm, passwordValidators } from '../../../../shared/utils/account-inputs';
import { RowActions, RowAction } from '../../../../shared/components/row-actions/row-actions';
import { ACCOUNT_STATUSES } from '../../../../core/configuration/account.config';
import { AuthService } from '../../../../core/auth/auth.service';
import { UsersService } from '../../../users/services/users.service';

import { Badge, BadgeVariant } from '../../../../shared/components/badge/badge';
import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { FiltersBar } from '../../../../shared/components/filters-bar/filters-bar';
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
  imports: [AccountFilters, SanitizeInput, Icon, RowActions, ReactiveFormsModule, Badge, CurrencyPipe, DatePipe, DataTable, FiltersBar, PageHeader, Pagination],
  templateUrl: './customers-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersPage implements OnInit {
  private readonly accounts = inject(AccountApiService);
  readonly openingCustomer = signal(false);
  private readonly auth = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly formError = signal('');
  readonly notice = signal('');
  readonly statuses = ACCOUNT_STATUSES;
  readonly editFields = ACCOUNT_FIELDS;
  readonly customerForm = createAccountForm(this.fb.nonNullable);

  fieldError(name: keyof typeof this.customerForm.controls): string {
    return accountFieldError(this.customerForm.controls[name], name);
  }


  canManageCustomers(): boolean { return this.auth.isAdmin(); }

  openNewCustomer(): void {
    if (!this.auth.isAdmin() || this.openingCustomer() || this.saving()) return;
    this.openingCustomer.set(true);
    this.formError.set('');
    this.accounts.getRoles().pipe(finalize(() => this.openingCustomer.set(false))).subscribe({
      next: (roles) => {
        const role = roles.find((role) => role.name.toUpperCase() === 'USER')
          ?? roles.find((role) => role.name.toUpperCase() === 'CUSTOMER');
        if (!role) { this.errorMessage.set('No se encontró el rol de cliente en Account.'); return; }
        this.selectedCustomer.set(null);
        this.customerForm.reset({ name: '', lastname: '', username: '', email: '', nro: '', direccion: '',
          idRole: role.idRole, idStatus: this.statuses.find((status) => status.name === 'active')!.idStatus, password: '' });
        this.customerForm.controls.password.setValidators(passwordValidators(true));
        this.customerForm.controls.password.updateValueAndValidity();
        this.editing.set(true);
        this.customerDialog()?.nativeElement.showModal();
      },
      error: () => this.errorMessage.set('No se pudo cargar el rol de cliente. Inténtalo nuevamente.'),
    });
  }

  customerActions(customer: Customer): RowAction[] {
    return [
      { id: 'view', label: 'Ver', icon: 'show2' },
      ...(this.auth.isAdmin() ? [{ id: 'edit', label: 'Editar', icon: 'edit' }] : []),
      ...(this.auth.isAdmin()
        ? [{ id: 'deactivate', label: 'Desactivar', icon: 'lock', danger: true,
          disabled: customer.status.toLowerCase() !== 'active' }] : []),
    ];
  }

  handleAction(action: string, customer: Customer): void {
    if (action === 'view') this.showCustomer(customer);
    else if (action === 'edit') this.editCustomer(customer);
    else if (action === 'deactivate' && this.auth.isAdmin()) {
      this.selectedCustomer.set(customer);
      this.formError.set('');
      this.deactivateDialog()?.nativeElement.showModal();
    }
  }

  editCustomer(customer: Customer): void {
    if (!this.auth.isAdmin()) return;
    this.formError.set('');
    this.usersService.getUserById(customer.id).subscribe({
      next: (account) => {
        this.selectedCustomer.set(customer);
        this.customerForm.reset({ name: account.name, lastname: account.lastname, username: account.username,
          email: account.email, nro: account.nro, direccion: account.direccion,
          idRole: account.idRole, idStatus: account.idStatus, password: '' });
        this.customerForm.controls.password.setValidators(passwordValidators());
        this.customerForm.controls.password.updateValueAndValidity();
        this.editing.set(true);
        this.customerDialog()?.nativeElement.showModal();
      },
      error: () => this.errorMessage.set('No se pudieron cargar los datos del cliente. Inténtalo nuevamente.'),
    });
  }

  saveCustomer(): void {
    if (this.saving() || !this.auth.isAdmin()) return;
    normalizeAccountForm(this.customerForm);
    this.customerForm.markAllAsTouched();
    const customer = this.selectedCustomer();
    if (this.customerForm.invalid) return;
    this.saving.set(true);
    this.formError.set('');
    const { password, ...profile } = this.customerForm.getRawValue();
    const request = { ...profile, ...(password ? { password } : {}) };
    const operation = customer ? this.usersService.updateUser(customer.id, request) : this.usersService.createUser(request);
    this.accounts.getAccounts().pipe(switchMap((accounts) => {
      const duplicates = findDuplicateAccountFields(accounts, request, customer?.id);
      if (duplicates.length) {
        for (const field of duplicates) this.customerForm.controls[field].setErrors({ duplicate: true });
        return EMPTY;
      }
      return operation;
    }), finalize(() => this.saving.set(false))).subscribe({
        next: () => {
          this.customerDialog()?.nativeElement.close();
          this.customerForm.controls.password.reset('');
          this.notice.set(customer ? 'Cliente actualizado.' : 'Cliente creado.');
          this.loadCustomers();
        },
        error: () => this.formError.set('No se pudo guardar. Inténtalo otra vez.'),
      });
  }

  readonly deactivateDialog = viewChild<ElementRef<HTMLDialogElement>>('deactivateDialog');
  closeDeactivate(event?: Event): void {
    if (this.saving()) { event?.preventDefault(); return; }
    this.deactivateDialog()?.nativeElement.close();
  }
  deactivateCustomer(): void {
    const customer = this.selectedCustomer();
    if (!customer || this.saving() || !this.auth.isAdmin()) return;
    this.saving.set(true);
    this.usersService.getUserById(customer.id).pipe(
      switchMap((account) => this.usersService.updateUser(account.idUser, {
        name: account.name, lastname: account.lastname, username: account.username,
        email: account.email, nro: account.nro, direccion: account.direccion,
        idRole: account.idRole, idStatus: this.statuses.find((status) => status.name === 'inactive')!.idStatus,
      })), finalize(() => this.saving.set(false)),
    ).subscribe({
      next: () => {
        this.deactivateDialog()?.nativeElement.close();
        this.notice.set('Cliente desactivado. Sus datos se conservaron.');
        this.loadCustomers();
      },
      error: () => this.formError.set('No se pudo desactivar al cliente. Inténtalo nuevamente.'),
    });
  }

  readonly customerDialog = viewChild<ElementRef<HTMLDialogElement>>('customerDialog');
  readonly selectedCustomer = signal<Customer | null>(null);
  showCustomer(customer: Customer): void {
    this.editing.set(false);
    this.formError.set('');
    this.selectedCustomer.set(customer);
    this.customerDialog()?.nativeElement.showModal();
  }
  closeCustomer(event?: Event): void {
    if (this.saving()) { event?.preventDefault(); return; }
    this.customerDialog()?.nativeElement.close();
    this.customerForm.controls.password.reset('');
  }

  private readonly customersService = inject(CustomersService);

  readonly customers = signal<Customer[]>([]);
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

  toggleFilterPanel(): void { this.filterPanelOpen.update((open) => !open); }
  selectFilter(filter: CustomerFilter): void {
    this.query.setFilter(filter);
    this.filterPanelOpen.set(false);
  }

  readonly sortDirection = signal<SortDirection>('asc');

  readonly filters = CUSTOMER_FILTERS;

  readonly pageSizeOptions = [5, 10, 25, 50];

  readonly query = new ListQuery<CustomerFilter>('all');

  readonly columns: TableColumn[] = [
    { key: 'id', label: '#', width: '5%' },
    { key: 'customer', label: 'Cliente', width: '23%' },
    { key: 'username', label: 'Usuario', width: '12%' },
    { key: 'createdAt', label: 'Fecha registro', width: '14%' },
    { key: 'status', label: 'Estado', width: '11%' },
    { key: 'paidOrders', label: 'Compras pagadas', width: '12%' },
    { key: 'totalPurchases', label: 'Total compras', width: '13%' },
    { key: 'actions', label: 'Acciones', width: '10%', align: 'center' },
  ];

  readonly totalCount = computed(() => this.customers().length);

  readonly filteredCustomers = computed(() => {
    const filter = this.query.filter();

    const search = this.query.search().trim().toLowerCase();

    const direction = this.sortDirection();

    const customers = this.customers().filter((customer) => {
      const status = customer.status.toLowerCase();
      const advanced = this.advancedFilters();
      if (!matchesRegistrationDate(customer.createdAt, advanced)) return false;
      if (advanced.purchases === 'with' && customer.paidOrderCount <= 0) return false;
      if (advanced.purchases === 'without' && customer.paidOrderCount > 0) return false;


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

  constructor() {
    enableUsernameSuggestion(this.customerForm, () => this.editing() && !this.selectedCustomer());
  }

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
          this.query.setPage(1);
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
    if (!date || Number.isNaN(Date.parse(date))) {
      return '—';
    }

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  }
}
