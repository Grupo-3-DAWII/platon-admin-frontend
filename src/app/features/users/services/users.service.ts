import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/configuration/api.routes';
import { UserRequest } from '../models/user-request.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}${API_ROUTES.accounts.base}`);
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

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${API_ROUTES.accounts.byId(id)}`);
  }

  validateUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}${API_ROUTES.accounts.validateUsername(username)}`,
    );
  }
}
