import { Component, computed, input, output } from '@angular/core';
import { Order } from '../../models/order';
import {
  FulfillmentStatus,
  progressOptions,
  progressOf,
  PROGRESS_LABELS,
} from '../../models/order-progress';

@Component({
  selector: 'app-order-progress',
  template: `
    @if (editable() && options().length) {
      <select
        class="max-w-full cursor-pointer rounded-full border border-brand/20 bg-growth-bg px-3 py-1.5 text-sm font-medium text-brand disabled:cursor-wait disabled:opacity-50"
        [attr.aria-label]="'Estado del pedido #' + order().id"
        [disabled]="disabled()"
        [value]="current()"
        (change)="choose($event)"
      >
        @if (current() === 'PREPARANDO') {
          <option value="PREPARANDO" disabled selected>Preparando</option>
        }
        @for (status of options(); track status) {
          <option [value]="status" [selected]="status === current()">{{ labels[status] }}</option>
        }
      </select>
    } @else {
      <span
        class="inline-flex rounded-full bg-surface-muted px-3 py-1.5 text-sm font-medium text-ink-muted"
        >{{ labels[current()] }}</span
      >
    }
  `,
})
export class OrderProgress {
  readonly order = input.required<Order>();
  readonly disabled = input(false);
  readonly editable = input(true);
  readonly changed = output<FulfillmentStatus>();
  readonly current = computed(() => progressOf(this.order()));
  readonly options = computed(() => progressOptions(this.order()));
  readonly labels = PROGRESS_LABELS;
  choose(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const target = select.value;
    select.value = this.current();
    if (
      !this.disabled() &&
      target !== this.current() &&
      this.options().includes(target as FulfillmentStatus)
    )
      this.changed.emit(target as FulfillmentStatus);
  }
}
