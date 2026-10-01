import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [Icon],
  templateUrl: './search-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInput {
  placeholder = input('Buscar...');

  valueChange = output<string>();

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    this.valueChange.emit(target.value);
  }
}
