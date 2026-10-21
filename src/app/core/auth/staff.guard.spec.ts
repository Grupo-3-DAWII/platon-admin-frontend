import { canVisitStaffPage } from './staff.guard';

describe('Staff navigation by role', () => {
  it('allows the administrator to manage the panel', () => {
    for (const url of ['/users', '/reports', '/inventory', '/products/new']) expect(canVisitStaffPage('ADMIN', url)).toBe(true);
  });
  it('allows seller work while blocking administration and product mutations through direct URLs', () => {
    for (const url of ['/sales', '/orders', '/customers', '/products', '/products/12']) expect(canVisitStaffPage('SELLER', url)).toBe(true);
    for (const url of ['/users', '/reports', '/dashboard', '/inventory', '/products/new', '/products/12/edit']) expect(canVisitStaffPage('SELLER', url)).toBe(false);
  });
  it('does not expose the internal panel to customer or unknown roles', () => {
    for (const role of ['USER', 'CUSTOMER', '']) expect(canVisitStaffPage(role, '/sales')).toBe(false);
  });
});
