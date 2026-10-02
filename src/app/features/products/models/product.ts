export type ProductStatus = 'available' | 'low' | 'out';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  price: number;
  discountPrice?: number;
  status: ProductStatus;
}
