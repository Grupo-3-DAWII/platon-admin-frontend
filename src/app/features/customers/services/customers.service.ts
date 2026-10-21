import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AccountApiService, AccountRecord } from '../../../core/configuration/account-api.service';
import { Customer } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly accounts = inject(AccountApiService);
  getCustomers(): Observable<Customer[]> {
    return this.accounts.getAccounts().pipe(map((accounts) => accounts
      .filter((account) => ['USER', 'CUSTOMER'].includes(account.role.toUpperCase()))
      .map((account) => this.toCustomer(account))));
  }
  private toCustomer(account: AccountRecord): Customer {
    return {
      id: account.idUser, idRole: account.idRole, idStatus: account.idStatus, fullName: `${account.name} ${account.lastname}`.trim(),
      username: account.username, email: account.email, role: 'CUSTOMER', status: account.status,
      createdAt: account.createdAt, contact: account.nro, address: account.direccion,
      paidOrderCount: account.paidOrderCount ?? 0, totalPurchases: account.totalPurchases ?? 0,
    };
  }
}
