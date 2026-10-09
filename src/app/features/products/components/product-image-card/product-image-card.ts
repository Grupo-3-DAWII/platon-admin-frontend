import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { PLACEHOLDER_COVER } from '../../services/products.service';

@Component({
  selector: 'app-product-image-card',
  imports: [Icon],
  styleUrl: './product-image-card.css',
  templateUrl: './product-image-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ProductImageCard {
  readonly src = input<string | null>(null);
  readonly disabled = input(false);
  readonly imageChange = output<string>();

  protected readonly placeholder = PLACEHOLDER_COVER;
  protected readonly dragging = signal(false);

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.readFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    const zone = event.currentTarget as HTMLElement;
    if (!zone.contains(event.relatedTarget as Node | null)) {
      this.dragging.set(false);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file?.type.startsWith('image/')) this.readFile(file);
  }

  private readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => this.imageChange.emit(reader.result as string);
    reader.readAsDataURL(file);
  }
}
