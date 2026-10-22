import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/configuration/api.routes';
import { PageDto } from '../../../shared/models/page';
import {
  InventoryItem,
  InventoryItemDto,
  InventoryMovement,
  StockMovementDto,
  StockMovementRequest,
  toInventoryItem,
  toInventoryMovement,
} from '../models/inventory';

export interface InventoryQuery {
  page?: number;
  size?: number;
  search?: string;
  maxStock?: number;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}${API_ROUTES.products.base}`;

  getPage({ page = 0, size = 10, search, maxStock }: InventoryQuery = {}): Observable<
    PageDto<InventoryItem>
  > {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'idProduct,desc');
    const term = search?.trim();
    if (term) params = params.set('search', term);
    if (maxStock !== undefined) params = params.set('maxStock', maxStock);

    return this.http
      .get<PageDto<InventoryItemDto>>(this.baseUrl, { params })
      .pipe(map((res) => ({ ...res, content: res.content.map(toInventoryItem) })));
  }
  registerMovement(
    productId: number,
    request: StockMovementRequest,
  ): Observable<InventoryMovement> {
    return this.http
      .post<StockMovementDto>(
        `${environment.apiUrl}${API_ROUTES.products.stockMovements(productId)}`,
        request,
      )
      .pipe(map(toInventoryMovement));
  }

  getMovements(productId: number): Observable<InventoryMovement[]> {
    return this.http
      .get<StockMovementDto[]>(
        `${environment.apiUrl}${API_ROUTES.products.stockMovements(productId)}`,
      )
      .pipe(map((list) => list.map(toInventoryMovement)));
  }
}