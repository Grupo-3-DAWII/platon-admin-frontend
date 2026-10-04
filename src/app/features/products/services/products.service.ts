import { Injectable, signal } from '@angular/core';
import { productsMockup } from '../data/mockup';
import { Book, Genre, NewBook, Publisher } from '../models/product';

export const PLACEHOLDER_COVER = '/images/placeholder/book-cover.png';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  readonly publishers: Publisher[] = [
    { id: 'alfaguara', name: 'Alfaguara' },
    { id: 'planeta', name: 'Planeta' },
    { id: 'fce', name: 'Fondo de Cultura Económica' },
    { id: 'penguin', name: 'Penguin Random House' },
    { id: 'anagrama', name: 'Anagrama' },
  ];

  readonly genres: Genre[] = [
    { id: 'novela', name: 'Novela' },
    { id: 'cuento', name: 'Cuento' },
    { id: 'poesia', name: 'Poesía' },
    { id: 'historia', name: 'Historia' },
    { id: 'filosofia', name: 'Filosofía' },
    { id: 'infantil', name: 'Infantil' },
    { id: 'desarrollo-personal', name: 'Desarrollo personal' },
  ];

  private readonly _books = signal<Book[]>(productsMockup);
  readonly books = this._books.asReadonly();

  getById(id: string): Book | undefined {
    return this._books().find((b) => b.id === id);
  }

  genreName(id: string): string {
    return this.genres.find((g) => g.id === id)?.name ?? '';
  }

  create(data: NewBook): void {
    const book: Book = { ...data, id: crypto.randomUUID(), status: 'out' };
    this._books.update((books) => [book, ...books]);
  }

  update(id: string, data: NewBook): void {
    this._books.update((books) => books.map((b) => (b.id === id ? { ...b, ...data } : b)));
  }
}
