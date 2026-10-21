import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CustomersPage } from './customers-page';
import { AuthService } from '../../../../core/auth/auth.service';
import { environment } from '../../../../../environments/environment';

const account = { idUser: 2, name: 'Customer', lastname: 'Test', username: 'customer',
  email: 'customer@example.com', nro: '900000002', direccion: 'Lima', idRole: 92, role: 'USER',
  idStatus: 1, status: 'active', createdAt: null, paidOrderCount: 4, totalPurchases: 90 };

describe('Customer account actions', () => {
  let http: HttpTestingController;
  let administrator = true;
  beforeEach(() => {
    administrator = true;
    TestBed.configureTestingModule({ imports: [CustomersPage], providers: [
      provideHttpClient(), provideHttpClientTesting(),
      { provide: AuthService, useValue: { isAdmin: () => administrator } },
    ] });
    http = TestBed.inject(HttpTestingController);
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
    HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  });
  afterEach(() => http.verify());
  function flushList() {
    http.expectOne(`${environment.apiUrl}/api/accounts?page=0&size=100`).flush({
      content: [account], page: 0, totalPages: 1, last: true,
    });
  }
  it('creates a customer using the actual USER role returned by Account', () => {
    const fixture = TestBed.createComponent(CustomersPage);
    fixture.detectChanges(); flushList(); fixture.detectChanges();
    const page = fixture.componentInstance;
    page.openNewCustomer();
    http.expectOne(`${environment.apiUrl}/api/roles`).flush([
      { idRole: 11, name: 'ADMIN' }, { idRole: 92, name: 'USER' }, { idRole: 37, name: 'SELLER' },
    ]);
    fixture.detectChanges();
    page.customerForm.patchValue({ name: 'Customer', lastname: 'Test', username: 'customer',
      email: 'customer@example.com', nro: '900000002', direccion: 'Lima', password: 'Customer123!' });
    page.saveCustomer();
    http.expectOne(`${environment.apiUrl}/api/accounts?page=0&size=100`).flush({ content: [], page: 0, totalPages: 1, last: true });
    const create = http.expectOne(`${environment.apiUrl}/api/accounts`);
    expect(create.request.method).toBe('POST');
    expect(create.request.body.idRole).toBe(92);
    expect(create.request.body.idStatus).toBe(1);
    expect(create.request.body.password).toBe('Customer123!');
    expect(create.request.body.createdAt).toBeUndefined();
    expect(create.request.body.totalPurchases).toBeUndefined();
    create.flush(account); flushList();
    expect(page.notice()).toBe('Cliente creado.');
    expect(page.customerForm.controls.password.value).toBe('');
  });

  it('edits only writable fields, preserving the actual customer role and password', () => {
    const fixture = TestBed.createComponent(CustomersPage);
    fixture.detectChanges(); flushList(); fixture.detectChanges();
    const page = fixture.componentInstance;
    const customer = page.customers()[0];
    page.editCustomer(customer);
    http.expectOne(`${environment.apiUrl}/api/accounts/2`).flush(account);
    fixture.detectChanges();
    page.customerForm.controls.direccion.setValue('Nueva dirección');
    page.saveCustomer();
    http.expectOne(`${environment.apiUrl}/api/accounts?page=0&size=100`).flush({ content: [account], page: 0, totalPages: 1, last: true });
    const update = http.expectOne(`${environment.apiUrl}/api/accounts/2`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body.idRole).toBe(92);
    expect(update.request.body.direccion).toBe('Nueva dirección');
    for (const field of ['password', 'createdAt', 'totalPurchases', 'paidOrderCount', 'role']) {
      expect(update.request.body[field]).toBeUndefined();
    }
    update.flush(account); flushList();
  });
  it('deactivates without deleting the customer or changing the role', () => {
    const fixture = TestBed.createComponent(CustomersPage);
    fixture.detectChanges(); flushList(); fixture.detectChanges();
    const page = fixture.componentInstance;
    page.handleAction('deactivate', page.customers()[0]);
    page.deactivateCustomer();
    const detail = http.expectOne(`${environment.apiUrl}/api/accounts/2`);
    expect(detail.request.method).toBe('GET'); detail.flush(account);
    const update = http.expectOne(`${environment.apiUrl}/api/accounts/2`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body.idStatus).toBe(2);
    expect(update.request.body.idRole).toBe(92);
    expect(update.request.body.password).toBeUndefined();
    update.flush(account); flushList();
  });
  it('stops duplicate identity fields before sending an update', () => {
    const fixture = TestBed.createComponent(CustomersPage);
    fixture.detectChanges(); flushList(); fixture.detectChanges();
    const page = fixture.componentInstance;
    page.editCustomer(page.customers()[0]);
    http.expectOne(`${environment.apiUrl}/api/accounts/2`).flush(account);
    fixture.detectChanges();
    page.customerForm.controls.email.setValue('other@example.com');
    page.saveCustomer();
    http.expectOne(`${environment.apiUrl}/api/accounts?page=0&size=100`).flush({
      content: [account, { ...account, idUser: 99, username: 'other', email: 'OTHER@example.com', nro: '900000099' }],
      page: 0, totalPages: 1, last: true,
    });
    http.expectNone((request) => request.method === 'PUT' || request.method === 'POST');
    expect(page.customerForm.controls.email.hasError('duplicate')).toBe(true);
    expect(page.fieldError('email')).toBe('Ya registrado.');
    expect(page.saving()).toBe(false);
  });

  it('keeps seller access to customers read-only', () => {
    administrator = false;
    const fixture = TestBed.createComponent(CustomersPage);
    fixture.detectChanges(); flushList(); fixture.detectChanges();
    const page = fixture.componentInstance;
    const customer = page.customers()[0];
    expect(page.customerActions(customer).map((action) => action.id)).toEqual(['view']);
    page.editCustomer(customer);
    http.expectNone(`${environment.apiUrl}/api/accounts/2`);
  });
  it('combines paid purchases, dates, state and search without losing filters when clearing extras', () => {
    const page = TestBed.createComponent(CustomersPage).componentInstance;
    const base = { id: 2, fullName: 'Customer Test', username: 'customer', email: 'customer@example.com',
      idRole: 92, idStatus: 1, contact: '900000002', address: 'Lima', role: 'CUSTOMER',
      status: 'active', paidOrderCount: 2, totalPurchases: 90, createdAt: '2026-10-01T12:00:00' };
    page.customers.set([base, { ...base, id: 3, paidOrderCount: 0 },
      { ...base, id: 4, status: 'inactive' }, { ...base, id: 5, createdAt: null }]);
    page.query.setFilter('active'); page.query.setSearch('customer'); page.query.setPage(3);
    page.applyAdvancedFilters({ role: 'all', purchases: 'with', from: '2026-10-01', to: '2026-10-01' });
    expect(page.filteredCustomers().map((customer) => customer.id)).toEqual([2]);
    expect(page.query.page()).toBe(1);
    page.applyAdvancedFilters({ role: 'all', purchases: 'without', from: '', to: '' });
    expect(page.filteredCustomers().map((customer) => customer.id)).toEqual([3]);
    page.clearAdvancedFilters();
    expect(page.filteredCustomers()).toHaveLength(3);
    expect(page.query.filter()).toBe('active');
    expect(page.query.search()).toBe('customer');
    expect(page.activeFilterCount()).toBe(0);
  });

});
