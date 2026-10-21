import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AccountApiService, AccountRecord } from './account-api.service';
import { CustomersService } from '../../features/customers/services/customers.service';
import { UsersService } from '../../features/users/services/users.service';
import { environment } from '../../../environments/environment';

const account = (id: number, role: string): AccountRecord => ({
  idUser: id, name: 'Test', lastname: 'Account', username: `user${id}`, email: 'test@example.com',
  nro: '999111222', direccion: 'Lima', idRole: id, role, idStatus: 1, status: 'active',
  createdAt: null, paidOrderCount: 5, totalPurchases: 125.5,
});

describe('Current Account API contract', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads every staff page instead of treating the paginated response as an array', () => {
    const service = TestBed.inject(AccountApiService);
    let result: AccountRecord[] = [];
    service.getAccounts(true).subscribe((value) => result = value);
    const first = http.expectOne(`${environment.apiUrl}/api/accounts/staff?page=0&size=100`);
    first.flush({ content: [account(1, 'ADMIN')], page: 0, totalPages: 2, last: false });
    http.expectOne(`${environment.apiUrl}/api/accounts/staff?page=1&size=100`)
      .flush({ content: [account(3, 'SELLER')], page: 1, totalPages: 2, last: true });
    expect(result.map((item) => item.role)).toEqual(['ADMIN', 'SELLER']);
  });

  it('maps backend USER to customer and preserves purchase counts and totals', () => {
    const service = TestBed.inject(CustomersService);
    let count = 0;
    service.getCustomers().subscribe((customers) => {
      count = customers.length;
      expect(customers[0].role).toBe('CUSTOMER');
      expect(customers[0].paidOrderCount).toBe(5);
      expect(customers[0].totalPurchases).toBe(125.5);
    });
    http.expectOne(`${environment.apiUrl}/api/accounts?page=0&size=100`).flush({
      content: [account(1, 'ADMIN'), account(2, 'USER'), account(3, 'SELLER')], page: 0, totalPages: 1, last: true,
    });
    expect(count).toBe(1);
  });

  it('updates the role and status without sending a delete request or an empty password', () => {
    const service = TestBed.inject(UsersService);
    const request = { name: 'Test', lastname: 'Account', username: 'seller', email: 'test@example.com',
      nro: '999111222', direccion: 'Lima', idRole: 3, idStatus: 2 };
    service.updateUser(3, request).subscribe();
    const update = http.expectOne(`${environment.apiUrl}/api/accounts/3`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual(request);
    expect(update.request.body.password).toBeUndefined();
    update.flush(account(3, 'SELLER'));
  });
});
