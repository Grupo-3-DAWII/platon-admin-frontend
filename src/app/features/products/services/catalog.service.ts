import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/configuration/api.routes';
import { CatalogDto, CatalogItem } from '../models/product';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  getEditorials(): Observable<CatalogItem[]> {
    return this.list(API_ROUTES.products.editorials);
  }

  getGenres(): Observable<CatalogItem[]> {
    return this.list(API_ROUTES.products.genres);
  }

  private list(route: string): Observable<CatalogItem[]> {
    return this.http.get<CatalogDto[]>(`${environment.apiUrl}${route}`).pipe(
      map((items) => items.filter((item) => item.active).map(({ id, name }) => ({ id, name }))),
      catchError(() => of([])),
    );
  }
}