import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EMPTY, expand, map, Observable, reduce } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ROUTES } from './api.routes';

export interface AccountRecord {
  idUser: number; name: string; lastname: string; username: string; email: string;
  nro: string; direccion: string; idRole: number; role: string; idStatus: number; status: string;
  createdAt: string | null; paidOrderCount?: number; totalPurchases?: number;
}
export interface AccountPage {
  content: AccountRecord[]; page: number; size: number; totalElements: number; totalPages: number; first: boolean; last: boolean;
}
export interface AccountRole { idRole: number; name: string; }

@Injectable({ providedIn: 'root' })
export class AccountApiService {
  private readonly http = inject(HttpClient);

  getPage(page = 0, staffOnly = false): Observable<AccountPage> {
    return this.http.get<AccountPage>(`${environment.apiUrl}${staffOnly ? API_ROUTES.accounts.staff : API_ROUTES.accounts.base}`, {
      params: new HttpParams().set('page', page).set('size', 100),
    });
  }

  // The current UI searches and sorts locally, so collect every backend page before filtering.
  getAccounts(staffOnly = false): Observable<AccountRecord[]> {
    return this.getPage(0, staffOnly).pipe(
      expand((page) => page.last || page.page + 1 >= page.totalPages ? EMPTY : this.getPage(page.page + 1, staffOnly)),
      map((page) => page.content),
      reduce((accounts, page) => accounts.concat(page), [] as AccountRecord[]),
    );
  }

  getRoles(): Observable<AccountRole[]> {
    return this.http.get<AccountRole[]>(`${environment.apiUrl}${API_ROUTES.roles}`);
  }
}
