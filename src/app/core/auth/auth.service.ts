import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ROUTES } from '../configuration/api.routes';
import { AuthSession, LoginRequest } from './auth.models';

interface TokenClaims { idUser: number; sub: string; exp: number; }
interface AccountProfile {
  idUser: number; username: string; name: string; lastname: string; role: string; status: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionKey = 'platon-auth-session';
  readonly session = signal<AuthSession | null>(this.loadSession());

  login(request: LoginRequest): Observable<void> {
    this.logout();
    return this.http.post<{ access_token: string }>(`${environment.apiUrl}${API_ROUTES.auth.login}`, {
      username: request.username.trim(), password: request.password,
    }).pipe(
      switchMap(({ access_token }) => {
        const claims = this.readClaims(access_token);
        return this.http.get<AccountProfile>(`${environment.apiUrl}${API_ROUTES.accounts.byId(claims.idUser)}`, {
          headers: { Authorization: `Bearer ${access_token}` },
        }).pipe(map((account): AuthSession => {
          const role = account.role?.toUpperCase();
          if (!['ADMIN', 'SELLER'].includes(role)) {
            throw new HttpErrorResponse({ status: 403, error: { message: 'Esta cuenta es de cliente. Inicia sesión desde la tienda de Platón.' } });
          }
          if (account.idUser !== claims.idUser || account.username !== claims.sub || account.status?.toLowerCase() !== 'active') {
            throw new HttpErrorResponse({ status: 401 });
          }
          return {
            accessToken: access_token, tokenType: 'Bearer', expiresAt: new Date(claims.exp * 1000).toISOString(),
            user: { idUser: account.idUser, username: account.username, name: account.name,
              lastname: account.lastname, role: role as 'ADMIN' | 'SELLER' },
          };
        }));
      }),
      tap((session) => {
        sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
        this.session.set(session);
      }),
      map(() => undefined),
      catchError((error: unknown) => { this.logout(); return throwError(() => error); }),
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.sessionKey);
    this.session.set(null);
  }

  isAuthenticated(): boolean {
    const session = this.session();
    if (session && ['ADMIN', 'SELLER'].includes(session.user.role) && Date.parse(session.expiresAt) > Date.now()) return true;
    this.logout();
    return false;
  }

  isAdmin(): boolean {
    return this.isAuthenticated() && this.session()?.user.role === 'ADMIN';
  }

  homeRoute(): string { return this.isAdmin() ? '/dashboard' : '/sales'; }

  getAuthorization(): string | null {
    return this.isAuthenticated() ? `Bearer ${this.session()!.accessToken}` : null;
  }

  getUsername(): string | null { return this.session()?.user.username ?? null; }

  private readClaims(token: string): TokenClaims {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token');
      const encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')), (char) => char.charCodeAt(0));
      const claims: TokenClaims = JSON.parse(new TextDecoder().decode(bytes));
      if (!Number.isSafeInteger(claims.idUser) || claims.idUser < 1 || typeof claims.sub !== 'string'
        || !Number.isFinite(claims.exp) || claims.exp * 1000 <= Date.now()) throw new Error('Invalid token');
      return claims;
    } catch { throw new HttpErrorResponse({ status: 401, error: { message: 'La sesión recibida no es válida.' } }); }
  }

  private loadSession(): AuthSession | null {
    try {
      const raw = sessionStorage.getItem(this.sessionKey);
      if (!raw) return null;
      const session: AuthSession = JSON.parse(raw);
      const claims = this.readClaims(session.accessToken);
      if (session.tokenType === 'Bearer' && claims.idUser === session.user.idUser && claims.sub === session.user.username
        && claims.exp * 1000 === Date.parse(session.expiresAt) && ['ADMIN', 'SELLER'].includes(session.user.role)) return session;
    } catch { sessionStorage.removeItem(this.sessionKey); }
    sessionStorage.removeItem(this.sessionKey);
    return null;
  }
}
