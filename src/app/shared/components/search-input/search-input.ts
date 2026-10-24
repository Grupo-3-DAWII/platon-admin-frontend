import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-search-input',
  standalone: true,
  host: { class: 'block min-w-0' },
  imports: [Icon],
  templateUrl: './search-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInput {
  placeholder = input('Buscar...');
  label = input<string>();
  value = input('');
  clearable = input(false);

  valueChange = output<string>();

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    this.valueChange.emit(target.value);
  }
}
