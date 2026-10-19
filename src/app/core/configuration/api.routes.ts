export const API_ROUTES = {
  accounts: {
    base: '/api/accounts',

    byId: (id: number) => `/api/accounts/${id}`,

    validateUsername: (username: string) => `/api/accounts/validate/${username}`,
  },
} as const;
