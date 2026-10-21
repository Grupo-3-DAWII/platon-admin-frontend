import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AccountApiService } from '../../../core/configuration/account-api.service';
import { ACCOUNT_STATUSES } from '../../../core/configuration/account.config';

import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/configuration/api.routes';
import { UserRequest } from '../models/user-request.model';
import { AccountStatus, User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly accounts = inject(AccountApiService);
  private readonly apiUrl = environment.apiUrl;

  getStatuses(): Observable<AccountStatus[]> {
    return of(ACCOUNT_STATUSES.map((status) => ({ ...status })));
  }

  getUsers(): Observable<User[]> {
    return this.accounts.getAccounts(true);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}${API_ROUTES.accounts.byId(id)}`);
  }

  createUser(request: UserRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}${API_ROUTES.accounts.base}`, request);
  }

  updateUser(id: number, request: UserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}${API_ROUTES.accounts.byId(id)}`, request);
  }

  validateUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}${API_ROUTES.accounts.validateUsername(username)}`,
    );
  }
}
