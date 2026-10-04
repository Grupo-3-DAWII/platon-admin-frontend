import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/products-list-page/products-list-page').then((m) => m.ProductsListPage),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/product-form-page/product-form-page').then((m) => m.ProductFormPage),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/product-form-page/product-form-page').then((m) => m.ProductFormPage),
  },
];
