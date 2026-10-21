import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/configuration/api.routes';
import { PageDto } from '../../../shared/models/page';
import { InventoryItem, InventoryItemDto, toInventoryItem } from '../models/inventory';

export interface InventoryQuery {
  page?: number;
  size?: number;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}${API_ROUTES.inventory}`;

  getPage({ page = 0, size = 10, search }: InventoryQuery = {}): Observable<
    PageDto<InventoryItem>
  > {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'idProduct,desc');
    const term = search?.trim();
    if (term) params = params.set('search', term);

    return this.http
      .get<PageDto<InventoryItemDto>>(this.baseUrl, { params })
      .pipe(map((res) => ({ ...res, content: res.content.map(toInventoryItem) })));
  }
}