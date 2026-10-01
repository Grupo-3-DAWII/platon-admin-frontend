import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Badge {
  variant = input<BadgeVariant>('neutral');
  showDot = input(true);
}
