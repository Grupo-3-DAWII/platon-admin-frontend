export const API_ROUTES = {
  auth: { login: '/api/v1/login' },
  roles: '/api/roles',
  accounts: {
    base: '/api/accounts',
    staff: '/api/accounts/staff',
    byId: (id: number) => `/api/accounts/${id}`,
    validateUsername: (username: string) => `/api/accounts/validate/${encodeURIComponent(username)}`,
  },
  products: '/api/products',
    inventory: '/api/inventory',
  authors: '/api/authors',
  editorials: '/api/editorials',
  genres: '/api/genres', 
} as const;
