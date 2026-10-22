import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inventory-page/inventory-page').then((m) => m.InventoryPage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/movement-history-page/movement-history-page').then(
        (m) => m.MovementHistoryPage,
      ),
  },
];
