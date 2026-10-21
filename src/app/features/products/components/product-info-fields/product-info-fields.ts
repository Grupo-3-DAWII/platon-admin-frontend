import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { map, startWith, switchMap } from 'rxjs';
import { Icon } from '../../../../shared/components/icon/icon';
import { estimateSalePrice, ProductForm } from '../../models/product-form';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-product-info-fields',
  styleUrl: './product-info-fields.css',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './product-info-fields.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ProductInfoFields {
  private readonly catalog = inject(CatalogService);

  readonly form = input.required<ProductForm>();

  readonly editorials = toSignal(this.catalog.getEditorials(), { initialValue: [] });
  readonly genres = toSignal(this.catalog.getGenres(), { initialValue: [] });

  readonly disabled = toSignal(
    toObservable(this.form).pipe(
      switchMap((form) =>
        form.statusChanges.pipe(
          startWith(form.status),
          map(() => form.disabled),
        ),
      ),
    ),
    { initialValue: false },
  );

  readonly salePrice = toSignal(
    toObservable(this.form).pipe(
      switchMap((form) =>
        form.valueChanges.pipe(
          startWith(null),
          map(() => {
            const { purchasePrice, profitMargin } = form.getRawValue();
            return estimateSalePrice(purchasePrice, profitMargin);
          }),
        ),
      ),
    ),
    { initialValue: 0 },
  );
}
