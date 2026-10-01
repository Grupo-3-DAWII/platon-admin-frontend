import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Icon } from '../icon/icon';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [Icon],
  templateUrl: './input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Input {
  id = input.required<string>();

  label = input('');
  type = input<InputType>('text');
  placeholder = input('');
  value = input('');
  disabled = input(false);
  error = input('');
  autocomplete = input<string | null>(null);

  leftIcon = input<string | null>(null);
  showPasswordToggle = input(false);

  valueChange = output<string>();

  readonly passwordVisible = signal(false);

  readonly resolvedType = computed<InputType>(() => {
    if (this.type() === 'password' && this.showPasswordToggle() && this.passwordVisible()) {
      return 'text';
    }

    return this.type();
  });

  readonly passwordIcon = computed(() => (this.passwordVisible() ? 'hide' : 'show'));

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }
}
