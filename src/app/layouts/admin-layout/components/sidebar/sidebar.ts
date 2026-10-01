import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
}
