import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { PLACEHOLDER_COVER } from '../../models/product';

const IMAGE_URL = /^https?:\/\/\S+$/i;
const MAX_URL_LENGTH = 1000;

@Component({
  selector: 'app-product-image-card',
  styleUrls: ['./product-image-card.css', '../product-info-fields/product-info-fields.css'],
  templateUrl: './product-image-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ProductImageCard {
  readonly src = input<string | null>(null);
  readonly disabled = input(false);
  readonly imageChange = output<string>();

  protected readonly placeholder = PLACEHOLDER_COVER;
  protected readonly invalid = signal(false);

  onUrlInput(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();
    const valid = value === '' || (IMAGE_URL.test(value) && value.length <= MAX_URL_LENGTH);

    this.invalid.set(!valid);
    if (valid) this.imageChange.emit(value);
  }
}