import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { ProductInfoFields } from '../../components/product-info-fields/product-info-fields';
import { createProductForm, toFormValue, toProductRequest } from '../../models/product-form';
import { ProductsService } from '../../services/products.service';
import { ProductImageCard } from '../../components/product-image-card/product-image-card';
import { productErrorMessage } from '../../utils/product-errors';

@Component({
  selector: 'app-product-form-page',
  imports: [Icon, ReactiveFormsModule,  ProductInfoFields, ProductImageCard],
  styleUrl: '../../style/products.css',
  templateUrl: './product-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly service = inject(ProductsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly idParam = inject(ActivatedRoute).snapshot.paramMap.get('id');
  private readonly bookId = this.idParam === null ? null : Number(this.idParam);

  readonly isEdit = this.bookId !== null;
  readonly backLink = this.bookId !== null ? ['/products', this.bookId] : ['/products'];
  readonly imagePreview = signal<string | null>(null);
  readonly form = createProductForm(this.fb);

  readonly loading = signal(this.isEdit);
  readonly loadError = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  private readonly location = inject(Location);

  back() {
    this.location.back();
  }

  constructor() {
    if (this.bookId === null) return;

    if (!Number.isInteger(this.bookId) || this.bookId <= 0) {
      this.router.navigate(['/products']);
      return;
    }
    this.load(this.bookId);
  }

  retry() {
    if (this.bookId !== null) this.load(this.bookId);
  }

  toggleActive() {
    const control = this.form.controls.active;
    control.setValue(!control.value);
  }

  save() {
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);
    this.saveError.set(null);

    const request = toProductRequest(this.form.getRawValue(), this.imagePreview());
    const request$ =
      this.bookId === null
        ? this.service.create(request)
        : this.service.update(this.bookId, request);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.router.navigate(this.isEdit ? this.backLink : ['/products'], { replaceUrl: true }),
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.saveError.set(productErrorMessage(err));
      },
    });
  }

  cancel() {
    this.router.navigate(this.backLink);
  }

  private load(id: number) {
    this.loading.set(true);
    this.loadError.set(false);

    this.service
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.form.patchValue(toFormValue(product));
          this.imagePreview.set(product.imageUrl);
          this.loading.set(false);
        },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.saveError.set(productErrorMessage(err ));
      },
      });
  }
}
