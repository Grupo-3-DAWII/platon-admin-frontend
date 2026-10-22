import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, combineLatest, map, of, switchMap, tap } from 'rxjs';

import { Icon } from '../../../../shared/components/icon/icon';
import { StockStatusBadge } from '../../../../shared/components/stock-status-badge/stock-status-badge';
import { ProductsService } from '../../../products/services/products.service';
import { MovementHistory } from '../../components/movement-history/movement-history';
import { MovementDialog } from '../../components/movement-dialog/movement-dialog';
import { Location } from '@angular/common';

@Component({
  selector: 'app-movement-history-page',
  imports: [Icon, RouterLink, StockStatusBadge, MovementHistory, MovementDialog],
  styleUrl: '../../../products/style/products.css',
  templateUrl: './movement-history-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovementHistoryPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly products = inject(ProductsService);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly reloadTick = signal(0);
  readonly movementOpen = signal(false);
  private readonly location = inject(Location);

  back() {
    this.location.back();
  }

  readonly product = toSignal(
    combineLatest([
      this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
      toObservable(this.reloadTick),
    ]).pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(false);
      }),
      switchMap(([id]) => {
        if (!Number.isInteger(id) || id <= 0) {
          this.router.navigate(['/inventory']);
          return of(null);
        }
        return this.products.getById(id).pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.status === 404) this.router.navigate(['/inventory']);
            else this.error.set(true);
            return of(null);
          }),
        );
      }),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: null },
  );

  retry() {
    this.reloadTick.update((n) => n + 1);
  }
  onMovementSaved() {
    this.movementOpen.set(false);
    this.retry();
  }
}
