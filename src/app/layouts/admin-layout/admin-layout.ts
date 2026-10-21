import { afterNextRender, ChangeDetectionStrategy, Component, inject, Injector, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './admin-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'onResize()', '(window:keydown.escape)': 'closeMenu()' },
})
export class AdminLayout {
  readonly isMobile = signal(window.innerWidth < 1024);
  readonly mobileMenuOpen = signal(false);
  private readonly injector = inject(Injector);
  private readonly header = viewChild(Header);

  toggleMenu(): void { this.mobileMenuOpen.update((open) => !open); }
  closeMenu(): void {
    if (!this.mobileMenuOpen()) return;
    this.mobileMenuOpen.set(false);
    afterNextRender(() => this.header()?.focusMenuButton(), { injector: this.injector });
  }
  onResize(): void {
    this.isMobile.set(window.innerWidth < 1024);
    if (!this.isMobile()) this.closeMenu();
  }
}
