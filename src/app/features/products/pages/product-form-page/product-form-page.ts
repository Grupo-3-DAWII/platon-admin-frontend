import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { Icon } from '../../../../shared/components/icon/icon';
import { createProductForm, toFormValue } from '../../models/product-form';
import { ProductRequest } from '../../models/product';
import { ProductInfoFields } from '../../components/product-info-fields/product-info-fields';
import { ProductImageCard } from '../../components/product-image-card/product-image-card';

@Component({
  selector: 'app-product-form-page',
  imports: [Icon, ReactiveFormsModule, RouterLink, ProductInfoFields, ProductImageCard],
  styleUrl: '../../style/products.css',
  templateUrl: './product-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly service = inject(ProductsService);
  private readonly idParam = inject(ActivatedRoute).snapshot.paramMap.get('id');
  private readonly bookId = this.idParam === null ? null : Number(this.idParam);

  readonly isEdit = this.bookId !== null;
  readonly backLink = this.bookId !== null ? ['/products', this.bookId] : ['/products'];
  readonly imagePreview = signal<string | null>(null);
  readonly form = createProductForm(this.fb);

  constructor() {
    if (this.bookId === null) return;

    const book = this.service.getById(this.bookId);
    if (!book) {
      this.router.navigate(['/products']);
      return;
    }
    this.form.patchValue(toFormValue(book));
    this.imagePreview.set(book.imageUrl);
  }

  toggleActive() {
    const control = this.form.controls.active;
    control.setValue(!control.value);
  }

  save() {
    if (this.form.invalid) return;
    const data: ProductRequest = {
      ...this.form.getRawValue(),
      imageUrl: this.imagePreview() ?? undefined,
    };
    if (this.bookId !== null) {
      this.service.update(this.bookId, data);
      this.router.navigate(this.backLink);
    } else {
      this.service.create(data);
      this.router.navigate(['/products']);
    }
  }

  cancel() {
    this.router.navigate(this.backLink);
  }
}
