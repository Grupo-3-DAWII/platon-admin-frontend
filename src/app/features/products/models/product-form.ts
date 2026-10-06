import { NonNullableFormBuilder, Validators } from '@angular/forms';

export function createProductForm(fb: NonNullableFormBuilder) {
  return fb.group({
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
}

export type ProductForm = ReturnType<typeof createProductForm>;
