import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { jwtInterceptor } from './jwt.interceptor';

describe('JWT interceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'login', children: [] }]),
      provideHttpClient(withInterceptors([jwtInterceptor])), provideHttpClientTesting()] });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    auth.session.set({ accessToken: 'header.payload.signature', tokenType: 'Bearer',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      user: { idUser: 1, username: 'admin', name: 'Admin', lastname: 'Test', role: 'ADMIN' } });
  });
  afterEach(() => { http.verify(); sessionStorage.clear(); });

  it('adds Bearer credentials only to the configured API', () => {
    client.get(`${environment.apiUrl}/api/accounts`).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/api/accounts`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer header.payload.signature');
    request.flush([]);
    client.get('https://external.example.invalid/api/accounts').subscribe();
    const external = http.expectOne('https://external.example.invalid/api/accounts');
    expect(external.request.headers.has('Authorization')).toBe(false);
    external.flush([]);
  });

  it('clears both in-memory and stored sessions after an API 401', () => {
    client.get(`${environment.apiUrl}/api/accounts`).subscribe({ error: () => undefined });
    http.expectOne(`${environment.apiUrl}/api/accounts`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.session()).toBeNull();
    expect(sessionStorage.getItem('platon-auth-session')).toBeNull();
  });

  it('does not attach an existing token to a new login request', () => {
    client.post(`${environment.apiUrl}/api/v1/login`, {}).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/api/v1/login`);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
});
