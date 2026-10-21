import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { UsersPage } from './users-page';
import { environment } from '../../../../../environments/environment';

const seller = { idUser: 7, name: 'Seller', lastname: 'Test', username: 'seller',
  email: 'seller@example.com', nro: '900000003', direccion: 'Lima', idRole: 37, role: 'SELLER',
  idStatus: 1, status: 'active', createdAt: null };

describe('Staff account forms', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [UsersPage], providers: [
      provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
    ] });
    http = TestBed.inject(HttpTestingController);
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
    HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  });
  afterEach(() => http.verify());
  function flushLists() {
    http.expectOne(`${environment.apiUrl}/api/accounts/staff?page=0&size=100`).flush({
      content: [seller], page: 0, totalPages: 1, last: true,
    });
    http.expectOne(`${environment.apiUrl}/api/roles`).flush([{ idRole: 11, name: 'ADMIN' }, { idRole: 37, name: 'SELLER' }]);
  }
  it('creates a seller with the catalog role ID and preserves a password when editing it blank', async () => {
    const fixture = TestBed.createComponent(UsersPage);
    fixture.detectChanges(); flushLists(); fixture.detectChanges();
    const page = fixture.componentInstance;
    page.openUserDialog();
    expect(page.userForm.controls.idRole.value).toBe(37);
    page.userForm.patchValue({ name: 'Seller', lastname: 'Test', username: 'seller',
      email: 'seller@example.com', nro: '900000003', direccion: 'Lima', password: 'Testing123!' });
    page.saveUser();
    http.expectOne(`${environment.apiUrl}/api/accounts?page=0&size=100`).flush({ content: [], page: 0, totalPages: 1, last: true });
    const create = http.expectOne(`${environment.apiUrl}/api/accounts`);
    expect(create.request.method).toBe('POST');
    expect(create.request.body.idRole).toBe(37);
    expect(create.request.body.password).toBe('Testing123!');
    create.flush(seller); flushLists(); fixture.detectChanges();
    page.openUserDialog(seller); page.saveUser();
    http.expectOne(`${environment.apiUrl}/api/accounts?page=0&size=100`).flush({ content: [seller], page: 0, totalPages: 1, last: true });
    const update = http.expectOne(`${environment.apiUrl}/api/accounts/7`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body.password).toBeUndefined();
    expect(update.request.body.idRole).toBe(37);
    update.flush(seller); flushLists();
    await fixture.whenStable();
  });
  it('suggests usernames only for new accounts and respects manual overrides', () => {
    const fixture = TestBed.createComponent(UsersPage);
    fixture.detectChanges(); flushLists(); fixture.detectChanges();
    const page = fixture.componentInstance;
    page.openUserDialog();
    page.userForm.patchValue({ name: 'José Luis', lastname: 'Pérez García' });
    expect(page.userForm.controls.username.value).toBe('joseperez');
    page.userForm.controls.name.setValue('Pedro');
    expect(page.userForm.controls.username.value).toBe('pedroperez');
    page.userForm.controls.username.markAsDirty();
    page.userForm.controls.username.setValue('mi_usuario');
    page.userForm.controls.name.setValue('Pedro');
    expect(page.userForm.controls.username.value).toBe('mi_usuario');
    page.openUserDialog(seller);
    page.userForm.controls.name.setValue('Otro');
    expect(page.userForm.controls.username.value).toBe('seller');
  });

  it('deactivates by updating the existing account rather than deleting it', () => {
    const fixture = TestBed.createComponent(UsersPage);
    fixture.detectChanges(); flushLists(); fixture.detectChanges();
    const page = fixture.componentInstance;
    page.openDeactivate(seller); page.confirmDeactivate();
    const detail = http.expectOne(`${environment.apiUrl}/api/accounts/7`);
    expect(detail.request.method).toBe('GET'); detail.flush(seller);
    const update = http.expectOne(`${environment.apiUrl}/api/accounts/7`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body.idStatus).toBe(2);
    expect(update.request.body.idRole).toBe(37);
    expect(update.request.body.password).toBeUndefined();
    update.flush({ ...seller, idStatus: 2, status: 'inactive' }); flushLists();
    expect(page.notice()).toContain('datos se conservaron');
  });
  it('combines role, inclusive registration dates, state and search and resets pagination', () => {
    const page = TestBed.createComponent(UsersPage).componentInstance;
    page.users.set([
      { ...seller, createdAt: '2026-10-01T12:00:00' },
      { ...seller, idUser: 8, role: 'ADMIN', createdAt: '2026-10-01T12:00:00' },
      { ...seller, idUser: 9, status: 'inactive', createdAt: '2026-10-01T12:00:00' },
      { ...seller, idUser: 10, createdAt: null },
      { ...seller, idUser: 11, createdAt: '2026-09-30T12:00:00' },
    ]);
    page.query.setFilter('active'); page.query.setSearch('seller'); page.query.setPage(3);
    page.applyAdvancedFilters({ role: 'SELLER', purchases: 'all', from: '2026-10-01', to: '2026-10-01' });
    expect(page.filteredUsers().map((user) => user.idUser)).toEqual([7]);
    expect(page.activeFilterCount()).toBe(2);
    expect(page.query.page()).toBe(1);
    page.clearAdvancedFilters();
    expect(page.query.filter()).toBe('active');
    expect(page.query.search()).toBe('seller');
    expect(page.filteredUsers()).toHaveLength(4);
  });

});
