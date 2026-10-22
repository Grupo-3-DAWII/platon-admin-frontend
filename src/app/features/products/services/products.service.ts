import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/configuration/api.routes';
import { PageDto } from '../../../shared/models/page';
import {
  Product,
  ProductDto,
  ProductRequest,
  ProductSummary,
  ProductSummaryDto,
  toProduct,
  toProductSummary,
} from '../models/product';

export interface ProductsQuery {
  page?: number;
  size?: number;
  search?: string;
  maxStock?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}${API_ROUTES.products.base}`;

  getPage({ page = 0, size = 20, search , maxStock}: ProductsQuery = {}): Observable<
    PageDto<ProductSummary>
  > {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'idProduct,desc');
    const term = search?.trim();
    if (term) params = params.set('search', term);
    if (maxStock !== undefined) params = params.set('maxStock', maxStock);

    return this.http
      .get<PageDto<ProductSummaryDto>>(this.baseUrl, { params })
      .pipe(map((res) => ({ ...res, content: res.content.map(toProductSummary) })));
  }
  count({ maxStock }: { maxStock?: number } = {}): Observable<number> {
    let params = new HttpParams().set('page', 0).set('size', 1);
    if (maxStock !== undefined) params = params.set('maxStock', maxStock);

    return this.http
      .get<PageDto<ProductSummaryDto>>(this.baseUrl, { params })
      .pipe(map((res) => res.totalElements));
  }

  getById(id: number): Observable<Product> {
    return this.http.get<ProductDto>(`${this.baseUrl}/${id}`).pipe(map(toProduct));
  }
  create(request: ProductRequest): Observable<Product> {
    return this.http.post<ProductDto>(this.baseUrl, request).pipe(map(toProduct));
  }

  update(id: number, request: ProductRequest): Observable<Product> {
    return this.http.put<ProductDto>(`${this.baseUrl}/${id}`, request).pipe(map(toProduct));
  }

}
