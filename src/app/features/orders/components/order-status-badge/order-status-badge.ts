import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Badge, BadgeVariant } from '../../../../shared/components/badge/badge';
import { OrderStatus } from '../../models/order';

const ORDER_STATUS_BADGE: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  delivered: { label: 'Entregado', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
};

@Component({
  selector: 'app-order-status-badge',
  imports: [Badge],
  templateUrl: './order-status-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusBadge {
  status = input.required<OrderStatus>();

  badge = computed(() => ORDER_STATUS_BADGE[this.status()]);
}
