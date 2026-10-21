import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { Icon } from '../../../../shared/components/icon/icon';
import { SearchInput } from '../../../../shared/components/search-input/search-input';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Icon, SearchInput],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly menuOpen = input(false);
  readonly menuToggle = output<void>();
  readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  focusMenuButton(): void { this.menuButton()?.nativeElement.focus(); }
  readonly auth = inject(AuthService);
}
