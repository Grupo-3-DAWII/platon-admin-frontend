// Account does not expose a status catalog. These IDs match DATABASE/init/01-create-database-schema.sql.
export const ACCOUNT_STATUSES = [
  { idStatus: 1, name: 'active' },
  { idStatus: 2, name: 'inactive' },
] as const;
