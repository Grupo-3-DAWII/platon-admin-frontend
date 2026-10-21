import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { PLACEHOLDER_COVER, Product, ProductRequest } from './product';

export function createProductForm(fb: NonNullableFormBuilder) {
  return fb.group({
    name: ['', [Validators.required, Validators.maxLength(160)]],
    isbn: ['', [Validators.required, Validators.maxLength(20)]],
    author: ['', [Validators.required, Validators.maxLength(160)]],
    editorialId: [0, Validators.min(1)],
    genreId: [0, Validators.min(1)],
    publicationYear: [
      new Date().getFullYear(),
      [Validators.required, Validators.min(1000), Validators.max(3000)],
    ],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    purchasePrice: [0, [Validators.required, Validators.min(0)]],
    profitMargin: [0, [Validators.required, Validators.min(0)]],
    active: true,
  });
}

export type ProductForm = ReturnType<typeof createProductForm>;
export type ProductFormValue = ReturnType<ProductForm['getRawValue']>;

export function toFormValue(p: Product): ProductFormValue {
  return {
    name: p.name,
    isbn: p.isbn,
    author: p.author,
    editorialId: p.editorial.id,
    genreId: p.genre.id,
    publicationYear: p.publicationYear,
    description: p.description,
    purchasePrice: p.purchasePrice,
    profitMargin: p.profitMargin,
    active: p.active,
  };
}

export function toProductRequest(value: ProductFormValue, image: string | null): ProductRequest {
  return {
    ...value,
    image: image && image !== PLACEHOLDER_COVER ? image : undefined,
  };
}

export const estimateSalePrice = (purchasePrice: number, profitMargin: number): number =>
  Math.round(purchasePrice * (1 + profitMargin / 100) * 100) / 100;