import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Icon } from '../../../../shared/components/icon/icon';
import { InventoryItem, MovementTypeDto } from '../../models/inventory';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-movement-dialog',
  imports: [ReactiveFormsModule, Icon],
  styleUrl: '../../../products/style/products.css',
  templateUrl: './movement-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class MovementDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(InventoryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly item = input.required<Pick<InventoryItem, 'id' | 'name' | 'stock'>>();
  readonly saved = output<void>();
  readonly closed = output<void>();

  readonly form = this.fb.group({
    type: ['ENTRY' as MovementTypeDto],
    quantity: [1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
    notes: ['', Validators.maxLength(500)],
  });

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  private readonly value = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  readonly exceedsStock = computed(() => {
    const { type, quantity } = this.value();
    return type === 'EXIT' && (quantity ?? 0) > this.item().stock;
  });

  save() {
    if (this.form.invalid || this.exceedsStock() || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);

    const { type, quantity, notes } = this.form.getRawValue();

    this.service
      .registerMovement(this.item().id, { type, quantity, notes: notes.trim() || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.saved.emit(),
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          this.error.set(this.errorMessage(err));
        },
      });
  }

  private errorMessage(err: HttpErrorResponse): string {
    const detail = typeof err.error?.message === 'string' ? err.error.message : null;
    switch (err.status) {
      case 400:
        return detail ?? 'Datos inválidos. Revisa la cantidad y las notas.';
      case 404:
        return 'El producto ya no existe.';
      case 409:
        return detail ?? 'El movimiento entra en conflicto con el stock actual. Recarga la lista e inténtalo de nuevo.';
      default:
        return 'No se pudo registrar el movimiento. Inténtalo de nuevo.';
    }
  }
}