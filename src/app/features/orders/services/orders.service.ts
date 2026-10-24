import { FulfillmentStatus } from '../models/order-progress';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EMPTY, expand, map, Observable, reduce } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/configuration/api.routes';
import {
  Order,
  OrderDto,
  OrdersPageDto,
  OrderStateDto,
  PurchaseRequest,
  PurchaseResponseDto,
  toOrder,
} from '../models/order';

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
  updateOrderStatus(id: number, orderStatus: FulfillmentStatus): Observable<void> {
    return this.http
      .patch(`${environment.apiUrl}${API_ROUTES.payments.orderById(id)}/order-status`, {
        orderStatus,
      })
      .pipe(map(() => undefined));
  }
  acceptPayment(id: number, amount: number): Observable<void> {
    return this.http
      .post<unknown>(`${environment.apiUrl}${API_ROUTES.payments.acceptOrder(id)}`, { amount })
      .pipe(map(() => undefined));
  }

  rejectPayment(id: number): Observable<void> {
    return this.http
      .post<unknown>(`${environment.apiUrl}${API_ROUTES.payments.rejectOrder(id)}`, null)
      .pipe(map(() => undefined));
  }
  getStates(): Observable<OrderStateDto[]> {
    return this.http.get<OrderStateDto[]>(`${environment.apiUrl}${API_ROUTES.payments.states}`);
  }

  create(request: PurchaseRequest): Observable<number> {
    return this.http
      .post<PurchaseResponseDto>(`${environment.apiUrl}${API_ROUTES.payments.orders}`, request)
      .pipe(map((res) => res.idProductsSold));
  }
  private fetchPage(page: number, size: number): Observable<OrdersPageDto> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<OrdersPageDto>(`${environment.apiUrl}${API_ROUTES.payments.orders}`, {
      params,
    });
  }

  /** Trae todas las paginas para calcular reportes. */
  getAll(): Observable<Order[]> {
    return this.fetchPage(0, 100).pipe(
      expand((res, i) => (i + 1 >= res.totalPages ? EMPTY : this.fetchPage(i + 1, 100))),
      reduce((all, res) => all.concat(res.content.map(toOrder)), [] as Order[]),
    );
  }
}
