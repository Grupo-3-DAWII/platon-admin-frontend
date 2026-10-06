export type ProductStatus = 'available' | 'low' | 'out';

export interface Publisher {
  id: string;
  name: string;
}
export interface Genre {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  isbn: string;
  author: string;
  publisherId: string;
  genreId: string;
  year: number;
  description: string;
  costPrice: number;
  salePrice: number;
  discountPrice?: number;
  coverUrl: string;
  active: boolean;
  status: ProductStatus;
}

export type NewBook = Omit<Book, 'id' | 'status' | 'discountPrice'>;

interface ProductBase {
  name: string;
  isbn: string;
  publicationYear: number;
  description: string;
  purchasePrice: number;
  salePrice: number;
  profitMargin: number;
  active: boolean;
  stock: number;
  createdAt: Date;
}
export interface ProductRequest extends ProductBase {
  authorId: number;
  editorialId: number;
  genreId: number;
  imageUrl?: string;
  imageContentType?: string;
}
export interface ProductResponse extends ProductBase {
  id: number;
  author: AuthorResponse;
  editorial: EditorialResponse;
  genre: GenreResponse;
  imageUrl: string;
}
export interface AuthorResponse {
  id: number;
  firstName: String;
  lastName: String;
}
export interface GenreResponse {
  id: number;
  name: String;
}
export interface EditorialResponse {
  id: number;
  name: String;
}
