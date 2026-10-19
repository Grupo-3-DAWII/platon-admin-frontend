import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly mainItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard',
    },
    {
      label: 'Productos',
      route: '/products',
      icon: 'products',
    },
    {
      label: 'Inventario',
      route: '/inventory',
      icon: 'inventory',
    },
    {
      label: 'Pedidos',
      route: '/orders',
      icon: 'orders',
    },
    {
      label: 'Ventas',
      route: '/sales',
      icon: 'sales',
    },
    {
      label: 'Clientes',
      route: '/customers',
      icon: 'customers',
    },
    {
      label: 'Reportes',
      route: '/reports',
      icon: 'reports',
    },
    {
      label: 'Usuarios',
      route: '/users',
      icon: 'users',
    },
  ];

  readonly secondaryItems: SidebarItem[] = [
    {
      label: 'Centro de ayuda',
      route: '/help-center',
      icon: 'help',
    },
    {
      label: 'Configuración',
      route: '/settings',
      icon: 'settings',
    },
  ];

  logout(): void {
    this.authService.logout();

    void this.router.navigate(['/login']);
  }
}
