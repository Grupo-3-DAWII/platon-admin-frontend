import { findDestinations } from './app-navigation';
describe('Application navigation search', () => {
  it('finds destinations through everyday words and accents', () => {
    expect(findDestinations('existencias', 'ADMIN').map((item) => item.route)).toEqual([
      '/inventory',
    ]);
    expect(findDestinations('dirección', 'SELLER').map((item) => item.route)).toEqual(['/profile']);
  });
  it('only returns sections the current role can visit', () => {
    expect(findDestinations('reportes', 'SELLER')).toEqual([]);
    expect(findDestinations('usuarios', 'SELLER')).toEqual([]);
    expect(findDestinations('usuarios', 'ADMIN')[0].route).toBe('/users');
    expect(findDestinations('pedidos', 'USER')).toEqual([]);
  });
  it('opens exact orders and products without running a module search', () => {
    expect(findDestinations('pedido #000241', 'SELLER')[0].route).toBe('/orders/241');
    expect(findDestinations('libro 1003', 'SELLER')[0].route).toBe('/products/1003');
    expect(findDestinations('pedido 0', 'ADMIN')).toEqual([]);
    expect(findDestinations('pedido 999999999999999999999', 'ADMIN')).toEqual([]);
  });
});
