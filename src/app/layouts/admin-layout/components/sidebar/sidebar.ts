import { APP_DESTINATIONS } from '../../../../core/navigation/app-navigation';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { canVisitStaffPage } from '../../../../core/auth/staff.guard';
import { AuthService } from '../../../../core/auth/auth.service';
import { Icon } from '../../../../shared/components/icon/icon';

interface SidebarItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  readonly mobileOpen = input(false);
  readonly isMobile = input(false);
  readonly navigation = output<void>();
  readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');
  readonly sidebar = viewChild<ElementRef<HTMLElement>>('sidebar');
  readonly logoutDialog = viewChild<ElementRef<HTMLDialogElement>>('logoutDialog');

  constructor() {
    afterRenderEffect(() => {
      if (this.isMobile() && this.mobileOpen()) this.closeButton()?.nativeElement.focus();
    });
  }

  trapFocus(event: KeyboardEvent): void {
    if (!this.isMobile() || !this.mobileOpen() || event.key !== 'Tab') return;
    const buttons = Array.from(
      this.sidebar()!.nativeElement.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      ),
    );
    const first = buttons[0];
    const last = buttons.at(-1);
    const active = this.sidebar()!.nativeElement.ownerDocument.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly visibleItems = computed(() =>
    this.mainItems.filter((item) =>
      canVisitStaffPage(this.authService.session()?.user.role ?? '', item.route),
    ),
  );

  readonly mainItems: SidebarItem[] = APP_DESTINATIONS.slice(0, 8);

  readonly secondaryItems: SidebarItem[] = [
    {
      label: 'Centro de ayuda',
      route: '/help-center',
      icon: 'help',
    },
  ];

  logout(): void {
    this.logoutDialog()?.nativeElement.showModal();
  }
  cancelLogout(): void {
    this.logoutDialog()?.nativeElement.close();
  }
  confirmLogout(): void {
    this.logoutDialog()?.nativeElement.close();
    this.authService.logout();
    this.navigation.emit();
    void this.router.navigate(['/login']);
  }
}
