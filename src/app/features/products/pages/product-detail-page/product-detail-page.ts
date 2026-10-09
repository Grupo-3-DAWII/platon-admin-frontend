import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { ProductInfoFields } from '../../components/product-info-fields/product-info-fields';
import { ProductImageCard } from '../../components/product-image-card/product-image-card';
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
  private readonly service = inject(ProductsService);
  private readonly idParam = inject(ActivatedRoute).snapshot.paramMap.get('id');

  readonly book = this.idParam ? this.service.getById(Number(this.idParam)) : undefined;
  readonly form = createProductForm(this.fb);

  constructor() {
    if (!this.book) {
      this.router.navigate(['/products']);
      return;
    }
    this.form.patchValue(toFormValue(this.book));
    this.form.disable();
  }
}
