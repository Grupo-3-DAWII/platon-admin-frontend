import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export function canVisitStaffPage(role: string, url: string): boolean {
  if (role === 'ADMIN') return true;
  if (role !== 'SELLER') return false;
  const path = url.split(/[?#]/)[0];
  return /^\/(sales|orders|customers|help-center)(\/|$)/.test(path)
    || path === '/products' || /^\/products\/\d+$/.test(path);
}

export const staffGuard: CanActivateChildFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
  return canVisitStaffPage(auth.session()!.user.role, state.url) || router.createUrlTree([auth.homeRoute()]);
};
