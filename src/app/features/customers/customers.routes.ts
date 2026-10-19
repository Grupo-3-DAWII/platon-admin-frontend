import { Routes } from '@angular/router';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/customers-page/customers-page').then((m) => m.CustomersPage),
  },
];
