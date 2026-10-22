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
    orders: '/api/v1/payments/orders',
    orderById: (id: number) => `/api/v1/payments/orders/${id}`,
    acceptOrder: (id: number) => `/api/payments/orders/${id}/payment/accept`,
    rejectOrder: (id: number) => `/api/payments/orders/${id}/payment/reject`,
  },
} as const;
