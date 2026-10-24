import { canVisitStaffPage } from '../auth/staff.guard';
import { normalizeSearch } from '../../shared/utils/collection-filters';

export interface AppDestination {
  label: string;
  route: string;
  icon: string;
  keywords: string;
}
export const APP_DESTINATIONS: AppDestination[] = [
  {
    label: 'Dashboard',
    route: '/dashboard',
    icon: 'dashboard',
    keywords: 'inicio resumen actividad',
  },
  { label: 'Productos', route: '/products', icon: 'products', keywords: 'libros catalogo' },
  {
    label: 'Inventario',
    route: '/inventory',
    icon: 'inventory',
    keywords: 'stock existencias movimientos',
  },
  {
    label: 'Pedidos',
    route: '/orders',
    icon: 'orders',
    keywords: 'ordenes compras preparacion entrega despachos',
  },
  { label: 'Ventas', route: '/sales', icon: 'sales', keywords: 'pagos cobros' },
  { label: 'Clientes', route: '/customers', icon: 'customers', keywords: 'compradores cuentas' },
  { label: 'Reportes', route: '/reports', icon: 'reports', keywords: 'informes estadisticas' },
  { label: 'Usuarios', route: '/users', icon: 'users', keywords: 'personal vendedores equipo' },
  { label: 'Centro de ayuda', route: '/help-center', icon: 'help', keywords: 'soporte preguntas' },
  {
    label: 'Mi perfil',
    route: '/profile',
    icon: 'users',
    keywords: 'mis datos telefono direccion contacto',
  },
  { label: 'Nuevo pedido', route: '/orders/new', icon: 'add', keywords: 'crear registrar orden' },
];
export function findDestinations(query: string, role: string): AppDestination[] {
  const normalized = normalizeSearch(query).trim();
  if (!normalized) return [];
  const direct = /^(pedido|orden|producto|libro)\s*#?\s*0*(\d+)$/.exec(normalized);
  if (direct) {
    const id = Number(direct[2]);
    if (!Number.isSafeInteger(id) || id < 1) return [];
    const order = ['pedido', 'orden'].includes(direct[1]);
    const entry = {
      label: `${order ? 'Pedido' : 'Producto'} #${id}`,
      route: `/${order ? 'orders' : 'products'}/${id}`,
      icon: order ? 'orders' : 'products',
      keywords: '',
    };
    return canVisitStaffPage(role, entry.route) ? [entry] : [];
  }
  const words = normalized.split(/\s+/);
  return APP_DESTINATIONS.filter(
    (entry) =>
      canVisitStaffPage(role, entry.route) &&
      words.every((word) => normalizeSearch(entry.label + ' ' + entry.keywords).includes(word)),
  ).slice(0, 6);
}
