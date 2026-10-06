import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PLACEHOLDER_COVER, ProductsService } from '../../services/products.service';
import { Icon } from '../../../../shared/components/icon/icon';
import { createProductForm } from '../../models/product-form';
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
  private readonly bookId = inject(ActivatedRoute).snapshot.paramMap.get('id');

  readonly isEdit = this.bookId !== null;
  // Edit returns to the book's detail page; create returns to the list
  readonly backLink = this.bookId ? ['/products', this.bookId] : ['/products'];
  readonly imagePreview = signal<string | null>(null);
  readonly form = createProductForm(this.fb);

  constructor() {
    if (!this.bookId) return;

    const book = this.service.getById(this.bookId);
    if (!book) {
      this.router.navigate(['/products']);
      return;
    }
    this.form.patchValue(book);
    this.imagePreview.set(book.coverUrl);
  }

  toggleActive() {
    const control = this.form.controls.active;
    control.setValue(!control.value);
  }

  save() {
    if (this.form.invalid) return;
    const data = {
      ...this.form.getRawValue(),
      coverUrl: this.imagePreview() ?? PLACEHOLDER_COVER,
    };
    if (this.bookId) {
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
