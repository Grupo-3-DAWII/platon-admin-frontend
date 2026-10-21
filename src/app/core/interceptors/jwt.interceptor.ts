import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const base = new URL(environment.apiUrl || '/', globalThis.location.origin);
  const target = new URL(request.url, globalThis.location.origin);
  const basePath = base.pathname.replace(/\/$/, '');
  const isApiRequest = target.origin === base.origin && target.pathname.startsWith(`${basePath}/api/`);
  const isLogin = target.pathname === `${basePath}/api/v1/login`;
  const authorization = isApiRequest && !isLogin ? auth.getAuthorization() : null;
  const authenticatedRequest = authorization && !request.headers.has('Authorization')
    ? request.clone({ setHeaders: { Authorization: authorization } }) : request;

  return next(authenticatedRequest).pipe(catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse && error.status === 401 && isApiRequest && !isLogin) {
      auth.logout();
      void router.navigate(['/login']);
    }
    return throwError(() => error);
  }));
};
