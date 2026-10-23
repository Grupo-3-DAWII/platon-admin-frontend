import { CurrencyPipe, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';

import { Customer } from '../../../customers/models/customer.model';
import { CustomersService } from '../../../customers/services/customers.service';
import { ProductSummary } from '../../../products/models/product';
import { ProductsService } from '../../../products/services/products.service';
import { OrderStateDto, STATE_BY_FILTER } from '../../models/order';
import { OrdersService } from '../../services/orders.service';
import { Icon } from '../../../../shared/components/icon/icon';

interface NewOrderLine {
  product: ProductSummary;
  quantity: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

@Component({
  selector: 'app-new-order-page',
  imports: [CurrencyPipe, Icon, RouterLink],
  templateUrl: './new-order-page.html',
})
export class NewOrderPage {
  private readonly router = inject(Router);
  private readonly orders = inject(OrdersService);
  private readonly productsService = inject(ProductsService);
  private readonly search$ = new Subject<string>();
  private readonly location = inject(Location);

  readonly customers = toSignal(
    inject(CustomersService)
      .getCustomers()
      .pipe(catchError(() => of([] as Customer[]))),
    { initialValue: [] as Customer[] },
  );

  readonly states = toSignal(
    this.orders.getStates().pipe(catchError(() => of([] as OrderStateDto[]))),
    { initialValue: [] as OrderStateDto[] },
  );

  readonly results = toSignal(
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith(''),
      switchMap((term) =>
        this.productsService.getPage({ size: 8, search: term }).pipe(
          map((page) => page.content),
          catchError(() => of([] as ProductSummary[])),
        ),
      ),
    ),
    { initialValue: [] as ProductSummary[] },
  );

  readonly customerId = signal<number | null>(null);
  readonly lines = signal<NewOrderLine[]>([]);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  // Los pedidos nuevos siempre nacen en PENDIENTE
  readonly selectedStateId = computed(
    () =>
      this.states().find((s) => s.nameState.toUpperCase() === STATE_BY_FILTER.pending)
        ?.idStateSold ?? null,
  );

  readonly total = computed(() =>
    round2(this.lines().reduce((sum, l) => sum + l.product.salePrice * l.quantity, 0)),
  );

  readonly canSubmit = computed(
    () =>
      this.customerId() !== null &&
      this.selectedStateId() !== null &&
      this.lines().length > 0 &&
      !this.submitting(),
  );

  onSearch(event: Event) {
    this.search$.next((event.target as HTMLInputElement).value.trim());
  }

  selectCustomer(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.customerId.set(value ? Number(value) : null);
  }

  add(product: ProductSummary) {
    this.lines.update((lines) =>
      lines.some((l) => l.product.id === product.id)
        ? lines.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l))
        : [...lines, { product, quantity: 1 }],
    );
  }

  setQuantity(productId: number, event: Event) {
    const quantity = Math.max(1, Math.floor(Number((event.target as HTMLInputElement).value)) || 1);
    this.lines.update((lines) =>
      lines.map((l) => (l.product.id === productId ? { ...l, quantity } : l)),
    );
  }

  remove(productId: number) {
    this.lines.update((lines) => lines.filter((l) => l.product.id !== productId));
  }

  submit() {
    const idUser = this.customerId();
    const idStateSold = this.selectedStateId();
    if (!this.canSubmit() || idUser === null || idStateSold === null) return;

    this.submitting.set(true);
    this.error.set(null);

    this.orders
      .create({
        idUser,
        idStateSold,
        products: this.lines().map((l) => ({ idProducts: l.product.id, numberSold: l.quantity })),
        totalAmount: this.total(),
      })
      .subscribe({
        next: (id) => void this.router.navigate(['/orders', id], { replaceUrl: true }),
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.error.set(
            typeof err.error?.message === 'string'
              ? err.error.message
              : 'No se pudo crear el pedido. Inténtalo de nuevo.',
          );
        },
      });
  }
  back() {
    this.location.back();
  }
}
