import { Routes } from '@angular/router';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/authentication/pages/login-page/login-page').then((m) => m.LoginPage),
      },
    ],
  },

  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
      },

      {
        path: 'inventory',
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then((m) => m.INVENTORY_ROUTES),
      },

      {
        path: 'orders',
        loadChildren: () => import('./features/orders/orders.routes').then((m) => m.ORDERS_ROUTES),
      },
      {
        path: 'sales',
        loadChildren: () => import('./features/sales/sales.routes').then((m) => m.SALES_ROUTES),
      },
      {
        path: 'help-center',
        loadComponent: () =>
          import('./features/help-center/help-center-page').then((m) => m.HelpCenterPage),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
