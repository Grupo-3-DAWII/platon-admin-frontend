import { Injectable, signal } from '@angular/core';
import { ordersMockup } from '../data/mockup';
import { OrderResponse } from '../models/order';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly _orders = signal<OrderResponse[]>(ordersMockup);
  readonly orders = this._orders.asReadonly();
}
