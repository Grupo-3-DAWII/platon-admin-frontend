import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StockStatus } from '../../models/stock-status';
import { Badge, BadgeVariant } from '../badge/badge';

const STOCK_STATUS_BADGE: Record<StockStatus, { label: string; variant: BadgeVariant }> = {
  available: { label: 'Disponible', variant: 'success' },
  low: { label: 'Poco stock', variant: 'warning' },
  out: { label: 'Agotado', variant: 'danger' },
};

@Component({
  selector: 'app-stock-status-badge',
  imports: [Badge],
  templateUrl: './stock-status-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockStatusBadge {
  status = input.required<StockStatus>();

  badge = computed(() => STOCK_STATUS_BADGE[this.status()]);
}
