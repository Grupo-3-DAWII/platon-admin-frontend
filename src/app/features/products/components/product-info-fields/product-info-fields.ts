import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { map, startWith, switchMap } from 'rxjs';
import { Icon } from '../../../../shared/components/icon/icon';
import { ProductForm } from '../../models/product-form';
import { ProductsService } from '../../services/products.service';
import { authorFullName } from '../../models/product';

@Component({
  selector: 'app-product-info-fields',
  styleUrl: './product-info-fields.css',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './product-info-fields.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ProductInfoFields {
  private readonly service = inject(ProductsService);

  readonly form = input.required<ProductForm>();

  readonly authors = this.service.authors;
  readonly editorials = this.service.editorials;
  readonly genres = this.service.genres;
  protected readonly authorFullName = authorFullName;

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
}
