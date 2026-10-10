import { Injectable, signal } from '@angular/core';
import { salesMockup } from '../data/mockup';
import { SaleResponse } from '../models/sale';

@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly _sales = signal<SaleResponse[]>(salesMockup);
  readonly sales = this._sales.asReadonly();
}
