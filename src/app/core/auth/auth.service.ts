import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { API_ROUTES } from '../configuration/api.routes';
import { AuthSession, LoginRequest } from './auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;
  private readonly sessionKey = 'platon-auth-session';

  readonly session = signal<AuthSession | null>(this.loadSession());

  login(request: LoginRequest): Observable<void> {
    const username = request.username.trim();

    const authorization = `Basic ${btoa(`${username}:${request.password}`)}`;

    const headers = new HttpHeaders({
      Authorization: authorization,
    });

    return this.http.get<unknown>(`${this.apiUrl}${API_ROUTES.accounts.base}`, { headers }).pipe(
      tap(() => {
        const session: AuthSession = {
          username,
          authorization,
        };

        sessionStorage.setItem(this.sessionKey, JSON.stringify(session));

        this.session.set(session);
      }),
      map(() => undefined),
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.sessionKey);
    this.session.set(null);
  }

  isAuthenticated(): boolean {
    return this.session() !== null;
  }

  getAuthorization(): string | null {
    return this.session()?.authorization ?? null;
  }

  getUsername(): string | null {
    return this.session()?.username ?? null;
  }

  private loadSession(): AuthSession | null {
    const storedSession = sessionStorage.getItem(this.sessionKey);

    if (!storedSession) {
      return null;
    }

    try {
      return JSON.parse(storedSession) as AuthSession;
    } catch {
      sessionStorage.removeItem(this.sessionKey);
      return null;
    }
  }
}
