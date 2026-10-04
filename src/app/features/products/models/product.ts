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
