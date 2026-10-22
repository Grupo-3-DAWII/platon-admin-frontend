import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/configuration/api.routes';
import { Order, OrderDto, OrdersPageDto, toOrder } from '../models/order';

export interface OrdersQuery {
  page?: number;
  size?: number;
  state?: string;
  search?: string;
}

export interface OrdersResult {
  content: Order[];
  totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);

  getPage({ page = 0, size = 10, state, search }: OrdersQuery = {}): Observable<OrdersResult> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (state) params = params.set('state', state);
    const term = search?.trim();
    if (term) params = params.set('search', term);

    return this.http
      .get<OrdersPageDto>(`${environment.apiUrl}${API_ROUTES.payments.orders}`, { params })
      .pipe(
        map((res) => ({ content: res.content.map(toOrder), totalElements: res.totalElements })),
      );
  }
  getById(id: number): Observable<Order> {
    return this.http
      .get<OrderDto>(`${environment.apiUrl}${API_ROUTES.payments.orderById(id)}`)
      .pipe(map(toOrder));
  }
  acceptPayment(id: number): Observable<Order> {
    return this.http
      .post<OrderDto>(`${environment.apiUrl}${API_ROUTES.payments.acceptOrder(id)}`, null)
      .pipe(map(toOrder));
  }

  rejectPayment(id: number): Observable<Order> {
    return this.http
      .post<OrderDto>(`${environment.apiUrl}${API_ROUTES.payments.rejectOrder(id)}`, null)
      .pipe(map(toOrder));
  }
}