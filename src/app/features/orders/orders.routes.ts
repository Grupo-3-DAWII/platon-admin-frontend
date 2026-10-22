import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/orders-page/orders-page').then((m) => m.OrdersPage),
  },
    {
    path: ':id',
    loadComponent: () =>
      import('./pages/order-detail-page/order-detail-page').then((m) => m.OrderDetailPage),
  },
];
