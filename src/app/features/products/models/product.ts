import { StockStatus } from '../../../shared/models/stock-status';

interface ProductBase {
  name: string;
  isbn: string;
  publicationYear: number;
  description: string;
  purchasePrice: number;
  salePrice: number;
  active: boolean;
}

export interface ProductRequest extends ProductBase {
  authorId: number;
  editorialId: number;
  genreId: number;
  imageUrl?: string;
}

export interface ProductResponse extends ProductBase {
  id: number;
  author: AuthorResponse;
  editorial: EditorialResponse;
  genre: GenreResponse;
  imageUrl: string;
  profitMargin: number;
  stock: number;
  status: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorResponse {
  id: number;
  firstName: string;
  lastName: string;
}

export interface GenreResponse {
  id: number;
  name: string;
}

export interface EditorialResponse {
  id: number;
  name: string;
}

export const authorFullName = (a: AuthorResponse) => `${a.firstName} ${a.lastName}`;
