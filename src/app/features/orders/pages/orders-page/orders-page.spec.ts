import { ConfirmationService } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { OrdersPage } from './orders-page';
import { OrdersService } from '../../services/orders.service';
import { Order } from '../../models/order';

const pending: Order = {
  id: 10,
  customerName: 'Cliente',
  status: 'pending',
  total: 153,
  createdAt: '2026-10-22',
  items: [],
};

function setup() {
  const service = {
    getAll: () => of([pending]),
    acceptPayment: vi.fn(() => of(undefined)),
    rejectPayment: vi.fn(() => of(undefined)),
  };
  TestBed.configureTestingModule({
    imports: [OrdersPage],
    providers: [provideRouter([]), { provide: OrdersService, useValue: service }],
  });
  const fixture = TestBed.createComponent(OrdersPage);
  fixture.detectChanges();
  return { fixture, page: fixture.componentInstance, service };
}

describe('Order row actions', () => {
  afterEach(() => vi.restoreAllMocks());

  it('offers one menu per row and only valid actions for each state', () => {
    const { page, fixture } = setup();
    expect(page.actionsFor(pending).map((action) => action.id)).toEqual(['view', 'reject']);
    for (const status of ['paid', 'cancelled', 'unknown'] as const) {
      expect(page.actionsFor({ ...pending, status }).map((action) => action.id)).toEqual(['view']);
    }
    expect(fixture.nativeElement.querySelectorAll('app-row-actions')).toHaveLength(2);
    expect(fixture.nativeElement.querySelectorAll('app-data-table app-row-actions')).toHaveLength(
      1,
    );
    expect(fixture.nativeElement.querySelector('a[title="Ver detalle"]')).toBeNull();
  });

  it('opens the selected detail without initiating a payment', () => {
    const { page, service } = setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    page.handleAction('view', pending);
    expect(navigate).toHaveBeenCalledWith(['/orders', 10]);
    expect(service.rejectPayment).not.toHaveBeenCalled();
  });

  it('ignores unsupported actions and decisions on finalized orders', () => {
    const { page, service } = setup();
    const confirm = vi.spyOn(TestBed.inject(ConfirmationService), 'ask').mockResolvedValue(true);
    page.handleAction('edit', pending);
    page.handleAction('accept', { ...pending, status: 'paid' });
    page.handleAction('reject', { ...pending, status: 'cancelled' });
    expect(confirm).not.toHaveBeenCalled();
    expect(service.acceptPayment).not.toHaveBeenCalled();
    expect(service.rejectPayment).not.toHaveBeenCalled();
  });

  it('keeps confirmation before a pending payment decision', async () => {
    const { page, service } = setup();
    const confirm = vi.spyOn(TestBed.inject(ConfirmationService), 'ask').mockResolvedValue(false);
    await page.handleAction('reject', pending);
    expect(service.rejectPayment).not.toHaveBeenCalled();
    confirm.mockResolvedValue(true);
    await page.handleAction('reject', pending);
    expect(confirm).toHaveBeenLastCalledWith(
      expect.stringContaining('Cancelar pedido #10'),
      expect.stringContaining('se devolverá el stock reservado'),
      'Cancelar pedido',
      true,
    );
    expect(service.rejectPayment).toHaveBeenCalledWith(10);
    page.handleAction('accept', pending);
    expect(service.acceptPayment).not.toHaveBeenCalled();
  });
});
