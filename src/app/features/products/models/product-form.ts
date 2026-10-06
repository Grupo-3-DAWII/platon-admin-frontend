import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ProductResponse } from './product';

export function createProductForm(fb: NonNullableFormBuilder) {
  return fb.group({
    name: ['', Validators.required],
    isbn: ['', Validators.required],
    authorId: [0, Validators.min(1)],
    editorialId: [0, Validators.min(1)],
    genreId: [0, Validators.min(1)],
    publicationYear: [new Date().getFullYear(), [Validators.required, Validators.min(1000)]],
    description: ['', Validators.required],
    purchasePrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    active: true,
  });
}

export type ProductForm = ReturnType<typeof createProductForm>;

export function toFormValue(p: ProductResponse): ReturnType<ProductForm['getRawValue']> {
  return {
    name: p.name,
    isbn: p.isbn,
    authorId: p.author.id,
    editorialId: p.editorial.id,
    genreId: p.genre.id,
    publicationYear: p.publicationYear,
    description: p.description,
    purchasePrice: p.purchasePrice,
    salePrice: p.salePrice,
    active: p.active,
  };
}
