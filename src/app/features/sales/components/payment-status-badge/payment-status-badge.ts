import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Badge, BadgeVariant } from '../../../../shared/components/badge/badge';
import { PaymentStatus } from '../../models/sale';

const PAYMENT_STATUS_BADGE: Record<PaymentStatus, { label: string; variant: BadgeVariant }> = {
  paid: { label: 'Pagado', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  refunded: { label: 'Reembolsado', variant: 'info' },
};

@Component({
  selector: 'app-payment-status-badge',
  imports: [Badge],
  templateUrl: './payment-status-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentStatusBadge {
  status = input.required<PaymentStatus>();

  badge = computed(() => PAYMENT_STATUS_BADGE[this.status()]);
}
