export const API_ROUTES = {
  auth: { login: '/api/v1/login' },
  roles: '/api/roles',
  accounts: {
    base: '/api/accounts',
    staff: '/api/accounts/staff',
    byId: (id: number) => `/api/accounts/${id}`,
    validateUsername: (username: string) =>
      `/api/accounts/validate/${encodeURIComponent(username)}`,
  },
  products: {
    base: '/api/products',
    editorials: '/api/products/editorials',
    genres: '/api/products/genres',
    stockMovements: (productId: number) => `/api/products/${productId}/stock-movements`,
  },
  payments: {
    orders: '/api/products-sold',
    orderById: (id: number) => `/api/products-sold/${id}`,
    acceptOrder: (id: number) => `/api/products-sold/${id}/payment/accept`,
    rejectOrder: (id: number) => `/api/products-sold/${id}/payment/reject`,
    states: '/api/states-sold',
  },
} as const;
