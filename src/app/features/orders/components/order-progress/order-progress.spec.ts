import { TestBed } from '@angular/core/testing';
import { OrderProgress } from './order-progress';
import { Order } from '../../models/order';
describe('Inline delivery selector', () => {
  it('keeps the confirmed state selected when the operator chooses a different state', () => {
    const fixture = TestBed.createComponent(OrderProgress);
    const order: Order = {
      id: 1,
      customerName: 'Ana',
      items: [],
      total: 10,
      status: 'paid',
      createdAt: '2026-10-23',
      orderStatus: 'PENDIENTE',
    };
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    const updates: string[] = [];
    fixture.componentInstance.changed.subscribe((value) => updates.push(value));
    select.value = 'ENTREGADO';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(updates).toEqual(['ENTREGADO']);
    expect(select.value).toBe('PENDIENTE');
    fixture.componentRef.setInput('order', { ...order, orderStatus: 'ENTREGADO' });
    fixture.detectChanges();
    expect(select.value).toBe('ENTREGADO');
    expect(Array.from(select.options).map((option) => option.value)).toEqual([
      'PENDIENTE',
      'EN_CAMINO',
      'ENTREGADO',
    ]);
  });
});
