import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
  signal,
  computed,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { OrderNotifications } from '../../../../core/notifications/order-notifications';
import { AuthService } from '../../../../core/auth/auth.service';
import { Icon } from '../../../../shared/components/icon/icon';
import { AppSearch } from '../../../../shared/components/app-search/app-search';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Icon, AppSearch, RouterLink],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly menuOpen = input(false);
  readonly menuToggle = output<void>();
  readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  focusMenuButton(): void {
    this.menuButton()?.nativeElement.focus();
  }
  readonly auth = inject(AuthService);
  readonly notifications = inject(OrderNotifications);
  readonly notificationsOpen = signal(false);
  readonly profileOpen = signal(false);
  readonly profileButton = viewChild<ElementRef<HTMLButtonElement>>('profileButton');
  readonly logoutDialog = viewChild<ElementRef<HTMLDialogElement>>('logoutDialog');
  private readonly router = inject(Router);
  readonly displayName = computed(() => {
    const user = this.auth.session()?.user;
    return [user?.name.trim().split(/\s+/)[0], user?.lastname.trim().split(/\s+/)[0]]
      .filter(Boolean)
      .join(' ');
  });
  toggleProfile(): void {
    this.notificationsOpen.set(false);
    this.profileOpen.update((value) => !value);
  }
  closeProfile(): void {
    this.profileOpen.set(false);
    this.profileButton()?.nativeElement.focus();
  }
  askLogout(): void {
    this.profileOpen.set(false);
    this.logoutDialog()?.nativeElement.showModal();
  }
  cancelLogout(): void {
    this.logoutDialog()?.nativeElement.close();
    this.profileButton()?.nativeElement.focus();
  }
  confirmLogout(): void {
    this.logoutDialog()?.nativeElement.close();
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
