import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { SearchInput } from '../../../../shared/components/search-input/search-input';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Icon, SearchInput],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {}
