import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OrdersService } from '../../../orders/services/orders.service';
import { Order } from '../../../orders/models/order';
import { SalesPage } from './sales-page';

const records: Order[] = Array.from({ length: 14 }, (_, index) => ({
  id: index + 1,
  customerName: index === 0 ? 'María Pérez' : 'Cliente ' + index,
  createdAt: `2026-10-${String(index + 1).padStart(2, '0')}T23:59:59`,
  total: index === 0 ? null : index === 1 ? 0 : 20,
  status: index === 13 ? 'pending' : 'paid',
  items: [],
}));

function setup(getAll = vi.fn(() => of(records))) {
  TestBed.configureTestingModule({
    imports: [SalesPage],
    providers: [provideRouter([]), { provide: OrdersService, useValue: { getAll } }],
  });
  const fixture = TestBed.createComponent(SalesPage);
  fixture.detectChanges();
  return { fixture, page: fixture.componentInstance, getAll };
}

describe('Sales list', () => {
  it('normalizes extra spaces, accents and leading zeros and clears the visible search', () => {
    const { page, fixture } = setup();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="search"]');
    input.value = '  perez   maria  ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(page.sales().map((sale) => sale.id)).toEqual([1]);
    expect(input.getAttribute('aria-label')).toBe('Buscar ventas por cliente o número');
    page.query.setSearch('#0013');
    fixture.detectChanges();
    expect(page.sales().map((sale) => sale.id)).toEqual([13]);
    const clear: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Limpiar búsqueda"]',
    );
    clear.click();
    fixture.detectChanges();
    expect(input.value).toBe('');
    expect(page.totalCount()).toBe(13);
    expect(page.query.page()).toBe(1);
  });
  it('shows paid sales, paginates and finds an exact ID beyond the visible page', () => {
    const { page } = setup();
    expect(page.totalCount()).toBe(13);
    expect(page.sales()).toHaveLength(10);
    expect(page.sales()[0].id).toBe(13);
    page.query.setPage(2);
    expect(page.sales()).toHaveLength(3);
    page.query.setSearch('#13');
    expect(page.query.page()).toBe(1);
    expect(page.sales().map((sale) => sale.id)).toEqual([13]);
    page.query.setSearch('maria perez');
    expect(page.sales()[0].id).toBe(1);
  });

  it('combines inclusive dates with search and clears dates without removing search', () => {
    const { page } = setup();
    page.query.setPage(2);
    page.query.setSearch('Cliente');
    page.dateForm.setValue({ from: '2026-10-02', to: '2026-10-03' });
    page.applyFilters();
    expect(page.sales().map((sale) => sale.id)).toEqual([3, 2]);
    expect(page.activeFilterCount()).toBe(2);
    expect(page.query.page()).toBe(1);
    page.clearFilters();
    expect(page.activeFilterCount()).toBe(0);
    expect(page.query.search()).toBe('Cliente');
    expect(page.totalCount()).toBe(12);
  });

  it('rejects reversed and invalid dates and supports a single date boundary', () => {
    const { page } = setup();
    page.dateForm.setValue({ from: '2026-10-03', to: '2026-10-02' });
    page.applyFilters();
    expect(page.invalidRange).toBe(true);
    expect(page.activeFilterCount()).toBe(0);
    page.dateForm.setValue({ from: '2026-02-30', to: '' });
    expect(page.invalidRange).toBe(true);
    page.dateForm.setValue({ from: '', to: '2026-10-02' });
    page.applyFilters();
    expect(page.totalCount()).toBe(2);
  });

  it('sorts in either direction and offers a detail menu without inventing missing amounts', () => {
    const { page, fixture } = setup();
    page.toggleSort();
    fixture.detectChanges();
    expect(page.sales()[0].id).toBe(1);
    expect(page.rowActions.map((action) => action.id)).toEqual(['view']);
    expect(fixture.nativeElement.querySelector('app-row-actions')).not.toBeNull();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    page.handleAction('view', page.sales()[0]);
    expect(navigate).toHaveBeenCalledWith(['/orders', 1]);
    page.handleAction('reject', page.sales()[0]);
    expect(navigate).toHaveBeenCalledTimes(1);
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('—');
    expect(rows[1].textContent).toContain('0.00');
    expect(fixture.nativeElement.textContent).not.toContain('Pagadas');
  });

  it('shows request errors and reloads successfully', () => {
    const getAll = vi
      .fn()
      .mockReturnValueOnce(throwError(() => new Error('offline')))
      .mockReturnValue(of(records));
    const { page } = setup(getAll);
    expect(page.error()).toBe(true);
    page.retry();
    expect(page.error()).toBe(false);
    expect(page.totalCount()).toBe(13);
    expect(getAll).toHaveBeenCalledTimes(2);
  });
});
