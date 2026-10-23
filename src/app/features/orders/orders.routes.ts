import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/orders-page/orders-page').then((m) => m.OrdersPage),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/new-order-page/new-order-page').then((m) => m.NewOrderPage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/order-detail-page/order-detail-page').then((m) => m.OrderDetailPage),
  },
];
