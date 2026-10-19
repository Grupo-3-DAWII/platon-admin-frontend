import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthSession } from '../auth/auth.models';

export const basicAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);

  const storedSession = sessionStorage.getItem('platon-auth-session');

  let session: AuthSession | null = null;

  if (storedSession) {
    try {
      session = JSON.parse(storedSession) as AuthSession;
    } catch {
      sessionStorage.removeItem('platon-auth-session');
    }
  }

  const isApiRequest = request.url.startsWith(environment.apiUrl);

  const authenticatedRequest =
    session && isApiRequest && !request.headers.has('Authorization')
      ? request.clone({
          setHeaders: {
            Authorization: session.authorization,
          },
        })
      : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && session) {
        sessionStorage.removeItem('platon-auth-session');

        void router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
