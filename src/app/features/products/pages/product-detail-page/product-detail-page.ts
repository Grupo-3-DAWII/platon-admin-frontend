import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, combineLatest, of, switchMap, tap } from 'rxjs';
import { Icon } from '../../../../shared/components/icon/icon';
import { ProductImageCard } from '../../components/product-image-card/product-image-card';
import { ProductInfoFields } from '../../components/product-info-fields/product-info-fields';
import { createProductForm, toFormValue } from '../../models/product-form';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-product-detail-page',
  imports: [Icon, RouterLink, DatePipe, ProductInfoFields, ProductImageCard],
  styleUrl: '../../style/products.css',
  templateUrl: './product-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ProductsService);

  readonly form = createProductForm(this.fb);
  readonly loading = signal(true);
  readonly error = signal(false);
  private readonly reloadTick = signal(0);

  readonly product = toSignal(
    combineLatest([this.route.paramMap, toObservable(this.reloadTick)]).pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(false);
      }),
      switchMap(([params]) => {
        const id = Number(params.get('id'));
        if (!Number.isInteger(id) || id <= 0) {
          this.router.navigate(['/products']);
          return of(null);
        }
        return this.service.getById(id).pipe(
          tap((product) => this.form.patchValue(toFormValue(product))),
          catchError((err: HttpErrorResponse) => {
            if (err.status === 404) this.router.navigate(['/products']);
            else this.error.set(true);
            return of(null);
          }),
        );
      }),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: null },
  );

  constructor() {
    this.form.disable();
  }

  retry() {
    this.reloadTick.update((n) => n + 1);
  }
}
