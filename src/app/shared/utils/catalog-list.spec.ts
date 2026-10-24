import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CatalogList, CatalogRow } from './catalog-list';
import { emptyCollectionFilters, validCollectionFilters } from './collection-filters';
const rows: CatalogRow[] = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1,
  name: `Libro ${index + 1}`,
  author: 'Autor',
  genre: 'Novela',
  editorial: 'Alfa',
  stock: 10,
  active: true,
  salePrice: 25,
}));
rows[1] = { ...rows[1], stock: 0 };
rows[2] = { ...rows[2], stock: 5 };
rows[3] = { ...rows[3], active: false };
rows[17] = {
  ...rows[17],
  name: 'Árboles del Perú',
  author: 'María Pérez',
  genre: 'Historia',
  editorial: 'Beta',
  stock: 3,
  salePrice: 37.5,
  isbn: '978-612-000001-8',
};
function setup(kind: 'products' | 'inventory' = 'products', data = rows) {
  TestBed.configureTestingModule({});
  const load = vi.fn(() => of(data));
  const list = TestBed.runInInjectionContext(() => new CatalogList(load, kind));
  TestBed.tick();
  return { list, load };
}
describe('Catalog lists', () => {
  it('searches all loaded rows and normalizes accents, word order, ISBN and IDs', () => {
    const { list, load } = setup();
    list.query.setPageSize(5);
    list.query.setPage(2);
    list.query.setSearch('  peru   MARIA ');
    expect(list.paged().map((item) => item.id)).toEqual([18]);
    expect(list.page()).toBe(1);
    list.query.setSearch('#00018');
    expect(list.total()).toBe(1);
    list.query.setSearch('9786120000018');
    expect(list.paged()[0].id).toBe(18);
    list.query.setSearch('');
    expect(list.total()).toBe(18);
    expect(load).toHaveBeenCalledTimes(1);
  });
  it('applies disjoint stock tabs before pagination and reports the filtered count', () => {
    const { list } = setup();
    list.query.setPageSize(1);
    list.query.setFilter('low');
    expect(list.total()).toBe(2);
    expect(list.paged()).toHaveLength(1);
    list.query.setPage(2);
    expect(list.page()).toBe(2);
    list.query.setFilter('out');
    expect(list.total()).toBe(1);
    expect(list.page()).toBe(1);
    expect(list.paged()[0].id).toBe(2);
    list.query.setFilter('available');
    expect(list.total()).toBe(15);
    expect(list.filtered().every((item) => item.stock > 5)).toBe(true);
  });
  it('combines genre, editorial, price, activity, state and search and clears only additional filters', () => {
    const { list } = setup();
    list.query.setFilter('low');
    list.query.setSearch('peru');
    list.apply({
      ...emptyCollectionFilters('products'),
      genre: 'Historia',
      editorial: 'Beta',
      min: '30',
      max: '40',
      active: 'active',
    });
    expect(list.total()).toBe(1);
    expect(list.activeCount()).toBe(5);
    list.clear();
    expect(list.activeCount()).toBe(0);
    expect(list.query.filter()).toBe('low');
    expect(list.query.search()).toBe('peru');
    expect(list.total()).toBe(1);
  });
  it('sorts the entire collection numerically before slicing pages and clamps a smaller result', () => {
    const { list } = setup();
    list.query.setPageSize(5);
    list.query.setPage(4);
    list.apply({ ...emptyCollectionFilters('products'), sortBy: 'stock' });
    expect(list.page()).toBe(1);
    expect(list.paged()[0].stock).toBe(0);
    list.toggleSort();
    expect(list.paged()[0].stock).toBe(10);
    expect(list.filtered().at(-1)?.stock).toBe(0);
    list.query.setPage(4);
    list.query.setSearch('no existe');
    expect(list.page()).toBe(1);
    expect(list.total()).toBe(0);
    expect(list.paged()).toEqual([]);
  });
  it('filters last movements with inclusive dates and keeps missing dates last in both directions', () => {
    const inventory: CatalogRow[] = rows
      .slice(0, 3)
      .map((item, index) => ({
        ...item,
        lastMovement:
          index === 2
            ? null
            : {
                type: index === 0 ? 'entry' : 'exit',
                date: index === 0 ? '2026-10-20T23:59:59' : '2026-10-21T00:00:00',
              },
      }));
    const { list } = setup('inventory', inventory);
    list.apply({
      ...emptyCollectionFilters('inventory'),
      movement: 'exit',
      from: '2026-10-21',
      to: '2026-10-21',
      min: '0',
      max: '0',
    });
    expect(list.filtered().map((item) => item.id)).toEqual([2]);
    list.apply({ ...emptyCollectionFilters('inventory'), sortBy: 'date' });
    expect(list.filtered().at(-1)?.id).toBe(3);
    list.toggleSort();
    expect(list.filtered()[0].id).toBe(2);
    expect(list.filtered().at(-1)?.id).toBe(3);
    list.apply({ ...emptyCollectionFilters('inventory'), movement: 'none' });
    expect(list.filtered().map((item) => item.id)).toEqual([3]);
  });
  it('recovers after a failed request without retaining the old error', () => {
    TestBed.configureTestingModule({});
    const load = vi
      .fn()
      .mockReturnValueOnce(throwError(() => new Error('offline')))
      .mockReturnValue(of(rows));
    const list = TestBed.runInInjectionContext(() => new CatalogList<CatalogRow>(load, 'products'));
    TestBed.tick();
    expect(list.error()).toBe(true);
    list.retry();
    TestBed.tick();
    expect(list.error()).toBe(false);
    expect(list.total()).toBe(18);
  });
  it('rejects invalid or reversed amounts and dates, allowing a genuine zero limit', () => {
    const defaults = emptyCollectionFilters('orders');
    for (const fields of [
      { min: '-1' },
      { min: '30', max: '10' },
      { min: 'abc' },
      { max: 'Infinity' },
      { min: '1.234' },
      { from: '2026-02-30' },
      { from: '2026-10-23', to: '2026-10-22' },
    ])
      expect(validCollectionFilters({ ...defaults, ...fields }, 'orders')).toBe(false);
    expect(validCollectionFilters({ ...defaults, min: '0', max: '0' }, 'orders')).toBe(true);
    expect(validCollectionFilters({ ...defaults, min: '1.5' }, 'inventory')).toBe(false);
  });
});
