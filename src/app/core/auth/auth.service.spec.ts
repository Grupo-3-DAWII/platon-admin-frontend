import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const tokenFor = (idUser = 7, exp = Math.floor(Date.now() / 1000) + 3600) =>
  `header.${btoa(JSON.stringify({ idUser, sub: 'staff', exp })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}.signature`;
const profile = { idUser: 7, username: 'staff', name: 'Staff', lastname: 'Test', role: 'SELLER', status: 'active' };

describe('Gateway JWT session', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); sessionStorage.clear(); });

  it('uses access_token and resolves the actual role from Account with Bearer authentication', () => {
    const auth = TestBed.inject(AuthService);
    const token = tokenFor();
    auth.login({ username: ' staff ', password: 'private-password' }).subscribe();
    const login = http.expectOne(`${environment.apiUrl}/api/v1/login`);
    expect(login.request.method).toBe('POST');
    expect(login.request.body).toEqual({ username: 'staff', password: 'private-password' });
    login.flush({ access_token: token });
    const account = http.expectOne(`${environment.apiUrl}/api/accounts/7`);
    expect(account.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    account.flush(profile);
    expect(auth.getAuthorization()).toBe(`Bearer ${token}`);
    expect(sessionStorage.getItem('platon-auth-session')).not.toContain('private-password');
    expect(auth.homeRoute()).toBe('/sales');
  });

  it('does not admit a customer into the internal panel', () => {
    const auth = TestBed.inject(AuthService);
    let status = 0;
    auth.login({ username: 'staff', password: 'password' }).subscribe({ error: (error) => status = error.status });
    http.expectOne(`${environment.apiUrl}/api/v1/login`).flush({ access_token: tokenFor() });
    http.expectOne(`${environment.apiUrl}/api/accounts/7`).flush({ ...profile, role: 'USER' });
    expect(status).toBe(403);
    expect(auth.session()).toBeNull();
    expect(sessionStorage.getItem('platon-auth-session')).toBeNull();
  });

  it('rejects malformed and expired gateway tokens before requesting a profile', () => {
    const auth = TestBed.inject(AuthService);
    for (const token of ['invalid-token', tokenFor(7, 1)]) {
      let status = 0;
      auth.login({ username: 'staff', password: 'password' }).subscribe({ error: (error) => status = error.status });
      http.expectOne(`${environment.apiUrl}/api/v1/login`).flush({ access_token: token });
      expect(status).toBe(401);
      expect(auth.isAuthenticated()).toBe(false);
    }
    http.expectNone(`${environment.apiUrl}/api/accounts/7`);
  });

  it('restores a valid session and clears expired or legacy sessions', () => {
    const token = tokenFor();
    const auth = TestBed.inject(AuthService);
    auth.login({ username: 'staff', password: 'password' }).subscribe();
    http.expectOne(`${environment.apiUrl}/api/v1/login`).flush({ access_token: token });
    http.expectOne(`${environment.apiUrl}/api/accounts/7`).flush({ ...profile, role: 'ADMIN' });
    expect(auth.isAdmin()).toBe(true);
    expect(auth.homeRoute()).toBe('/dashboard');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const restored = TestBed.inject(AuthService);
    expect(restored.isAdmin()).toBe(true);
    restored.session.update((session) => session && ({ ...session, expiresAt: '2020-01-01T00:00:00Z' }));
    expect(restored.getAuthorization()).toBeNull();
    expect(restored.session()).toBeNull();
  });
});
