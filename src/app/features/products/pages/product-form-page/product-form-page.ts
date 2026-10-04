import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PLACEHOLDER_COVER, ProductsService } from '../../services/products.service';
import { Icon } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-product-form-page',
  imports: [Icon, ReactiveFormsModule, RouterLink],
  styleUrl: './product-form-page.css',
  templateUrl: './product-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly service = inject(ProductsService);
  private readonly bookId = inject(ActivatedRoute).snapshot.paramMap.get('id');

  readonly isEdit = this.bookId !== null;
  readonly publishers = this.service.publishers;
  readonly genres = this.service.genres;
  readonly imagePreview = signal<string | null>(null);

  readonly form = this.fb.group({
    title: ['', Validators.required],
    isbn: ['', Validators.required],
    author: ['', Validators.required],
    publisherId: ['', Validators.required],
    genreId: ['', Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1000)]],
    description: ['', Validators.required],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    active: true,
  });

  constructor() {
    if (this.bookId) {
      const book = this.service.getById(this.bookId);
      if (!book) {
        this.router.navigate(['/products']);
        return;
      }
      const { id, status, discountPrice, coverUrl, ...fields } = book;
      this.form.patchValue(fields);
      this.imagePreview.set(coverUrl);
    }
  }

  toggleActive() {
    const control = this.form.controls.active;
    control.setValue(!control.value);
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  save() {
    if (this.form.invalid) return;
    const data = {
      ...this.form.getRawValue(),
      coverUrl: this.imagePreview() ?? PLACEHOLDER_COVER,
    };
    if (this.bookId) {
      this.service.update(this.bookId, data);
    } else {
      this.service.create(data);
    }
    this.router.navigate(['/products']);
  }

  cancel() {
    this.router.navigate(['/products']);
  }
}
