import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.html',
  host: {
    class: 'inline-flex shrink-0 items-center justify-center align-middle leading-none',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  name = input.required<string>();
  size = input(20);

  readonly iconUrl = computed(() => `url("/icons/hicon/${this.name()}.svg")`);
}
