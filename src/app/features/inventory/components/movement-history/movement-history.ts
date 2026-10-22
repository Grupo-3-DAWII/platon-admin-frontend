import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, map, of, switchMap, tap } from 'rxjs';

import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { InventoryMovement } from '../../models/inventory';
import { InventoryService } from '../../services/inventory.service';
import { movementDate, movementSummary } from '../../utils/movement-format';

@Component({
  selector: 'app-movement-history',
  imports: [DataTable],
  styleUrl: '../../../products/style/products.css',
  templateUrl: './movement-history.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class MovementHistory {
  private readonly service = inject(InventoryService);

  readonly productId = input.required<number>();
  readonly stock = input.required<number>();

  readonly columns: TableColumn[] = [
    { key: 'movement', label: 'Movimiento', width: '18%' },
    { key: 'resulting', label: 'Stock resultante', width: '18%' },
    { key: 'date', label: 'Fecha', width: '24%' },
    { key: 'notes', label: 'Notas', width: '40%' },
  ];

  readonly movementDate = movementDate;
  readonly movementSummary = movementSummary;

  readonly loading = signal(true);
  readonly error = signal(false);
  private readonly reloadTick = signal(0);
  readonly refreshKey = input(0);

  readonly movements = toSignal(
    combineLatest([
      toObservable(this.productId),
      toObservable(this.reloadTick),
      toObservable(this.refreshKey),
    ]).pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(false);
      }),
      switchMap(([id]) =>
        this.service.getMovements(id).pipe(
          map((list) =>
            [...list].sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.id - a.id),
          ),
          catchError(() => {
            this.error.set(true);
            return of([] as InventoryMovement[]);
          }),
        ),
      ),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: [] as InventoryMovement[] },
  );

  retry() {
    this.reloadTick.update((n) => n + 1);
  }
}
