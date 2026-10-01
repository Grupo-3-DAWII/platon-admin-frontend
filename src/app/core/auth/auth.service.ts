import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { API_ROUTES } from '../configuration/api.routes';
import { LoginRequest, LoginResponse } from './auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  // Credentials mockup
  private readonly useMock = true;

  login(request: LoginRequest): Observable<LoginResponse> {
    if (this.useMock) {
      return this.mockLogin(request);
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}${API_ROUTES.auth.login}`, request);
  }

  private mockLogin(request: LoginRequest): Observable<LoginResponse> {
    const validEmail = 'admin@platon.pe';
    const validPassword = 'Platon123';

    if (request.email === validEmail && request.password === validPassword) {
      const response: LoginResponse = {
        authenticated: true,
        user: {
          id: 1,
          name: 'Jhaser Campos',
          email: validEmail,
          role: 'ADMIN',
        },
      };

      return of(response).pipe(delay(800));
    }

    return throwError(() => new Error('Credenciales inválidas')).pipe(delay(800));
  }
}
