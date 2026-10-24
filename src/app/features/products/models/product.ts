import { StockStatus } from '../../../shared/models/stock-status';

export const PLACEHOLDER_COVER = '/images/placeholder/book-cover.png';
export const LOW_STOCK_THRESHOLD = 5;


// BACKEND
export interface ProductRequest {
  name: string;
  isbn: string;
  author: string; // Cambiar a authorId
  editorialId: number;
  genreId: number;
  publicationYear: number;
  description: string;
  image?: string; 
  purchasePrice: number;
  profitMargin: number; 
  active: boolean;
}

export interface ProductDto {
  idProduct: number;
  name: string;
  isbn: string;
  author: string;
  editorialId: number;
  editorial: string;
  genreId: number;
  genre: string;
  publicationYear: number;
  description: string;
  image: string | null;
  purchasePrice: number;
  profitMargin: number;
  salePrice: number;
  active: boolean;
  stock: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSummaryDto {
  isbn?: string;
  idProduct: number;
  name: string;
  author: string;
  editorial: string;
  genre: string;
  image: string | null;
  salePrice: number;
  stock: number;
  active: boolean;
  available: boolean;
}

export interface CatalogDto {
  id: number;
  name: string;
  active: boolean;
}

// UI
export interface CatalogItem {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  isbn: string;
  author: string;
  editorial: CatalogItem;
  genre: CatalogItem;
  publicationYear: number;
  description: string;
  imageUrl: string;
  purchasePrice: number;
  profitMargin: number;
  salePrice: number;
  active: boolean;
  stock: number;
  status: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSummary {
  isbn?: string;
  id: number;
  name: string;
  author: string;
  editorial: string;
  genre: string;
  imageUrl: string;
  salePrice: number;
  stock: number;
  active: boolean;
  status: StockStatus;
}

// Mapping
export const stockStatus = (stock: number): StockStatus =>
  stock <= 0 ? 'out' : stock <= LOW_STOCK_THRESHOLD ? 'low' : 'available';

export const toProduct = (d: ProductDto): Product => ({
  id: d.idProduct,
  name: d.name,
  isbn: d.isbn,
  author: d.author,
  editorial: { id: d.editorialId, name: d.editorial },
  genre: { id: d.genreId, name: d.genre },
  publicationYear: d.publicationYear,
  description: d.description,
  imageUrl: d.image || PLACEHOLDER_COVER,
  purchasePrice: d.purchasePrice,
  profitMargin: d.profitMargin,
  salePrice: d.salePrice,
  active: d.active,
  stock: d.stock,
  status: stockStatus(d.stock),
  createdAt: d.createdAt,
  updatedAt: d.updatedAt,
});

export const toProductSummary = (d: ProductSummaryDto): ProductSummary => ({
  isbn: d.isbn,
  id: d.idProduct,
  name: d.name,
  author: d.author,
  editorial: d.editorial,
  genre: d.genre,
  imageUrl: d.image || PLACEHOLDER_COVER,
  salePrice: d.salePrice,
  stock: d.stock,
  active: d.active,
  status: stockStatus(d.stock),
});