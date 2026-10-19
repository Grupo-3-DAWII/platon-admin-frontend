import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/configuration/api.routes';
import { Customer } from '../models/customer.model';

interface AccountResponse {
  idUser: number;

  name?: string;
  lastname?: string;
  fullName?: string;

  username: string;
  email: string;

  status?: string;

  role?: string;
  roleName?: string;

  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  getCustomers(): Observable<Customer[]> {
    return this.http
      .get<AccountResponse[]>(`${this.apiUrl}${API_ROUTES.accounts.base}`)
      .pipe(
        map((accounts) =>
          accounts
            .filter((account) => this.getRole(account) === 'CUSTOMER')
            .map((account) => this.toCustomer(account)),
        ),
      );
  }

  private toCustomer(account: AccountResponse): Customer {
    return {
      id: account.idUser,

      fullName: account.fullName ?? `${account.name ?? ''} ${account.lastname ?? ''}`.trim(),

      username: account.username,
      email: account.email,

      role: this.getRole(account),

      status: account.status ?? 'unknown',

      createdAt: account.createdAt ?? null,
    };
  }

  private getRole(account: AccountResponse): string {
    return (account.role ?? account.roleName ?? '').toUpperCase();
  }
}
