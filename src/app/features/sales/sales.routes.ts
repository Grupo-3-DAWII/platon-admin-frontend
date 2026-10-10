import { Routes } from '@angular/router';

export const SALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/sales-page/sales-page').then((m) => m.SalesPage),
  },
];
