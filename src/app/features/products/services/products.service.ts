import { Injectable, signal } from '@angular/core';
import { AUTHORS, EDITORIALS, GENRES, productsMockup } from '../data/mockup';
import { StockStatus } from '../../../shared/models/stock-status';
import { ProductRequest, ProductResponse } from '../models/product';

export const PLACEHOLDER_COVER = '/images/placeholder/book-cover.png';

// --- Mock backend logic: delete this block when the real API is connected ---
const LOW_STOCK_THRESHOLD = 5;

const statusFor = (stock: number): StockStatus =>
  stock <= 0 ? 'out' : stock <= LOW_STOCK_THRESHOLD ? 'low' : 'available';

const marginFor = (purchase: number, sale: number) =>
  Math.round(((sale - purchase) / purchase) * 10000) / 100;
// ---------------------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class ProductsService {
  readonly authors = Object.values(AUTHORS);
  readonly editorials = Object.values(EDITORIALS);
  readonly genres = Object.values(GENRES);

  private readonly _books = signal<ProductResponse[]>(
    productsMockup.map((p) => ({ ...p, status: statusFor(p.stock), updatedAt: p.createdAt })),
  );
  readonly books = this._books.asReadonly();

  getById(id: number): ProductResponse | undefined {
    return this._books().find((b) => b.id === id);
  }

  create(data: ProductRequest): ProductResponse {
    const now = new Date().toISOString();
    const book: ProductResponse = {
      ...this.resolve(data),
      id: Math.max(0, ...this._books().map((b) => b.id)) + 1,
      stock: 0,
      status: statusFor(0),
      createdAt: now,
      updatedAt: now,
    };
    this._books.update((books) => [book, ...books]);
    return book;
  }

  update(id: number, data: ProductRequest): void {
    this._books.update((books) =>
      books.map((b) =>
        b.id === id ? { ...b, ...this.resolve(data), updatedAt: new Date().toISOString() } : b,
      ),
    );
  }

  private resolve(data: ProductRequest) {
    const { authorId, editorialId, genreId, imageUrl, ...rest } = data;
    return {
      ...rest,
      profitMargin: marginFor(data.purchasePrice, data.salePrice),
      imageUrl: imageUrl ?? PLACEHOLDER_COVER,
      author: this.authors.find((a) => a.id === authorId)!,
      editorial: this.editorials.find((e) => e.id === editorialId)!,
      genre: this.genres.find((g) => g.id === genreId)!,
    };
  }
}
