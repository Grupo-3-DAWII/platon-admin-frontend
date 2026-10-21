import { ChangeDetectionStrategy, Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

export interface AccountFiltersValue {
  role: string;
  purchases: string;
  from: string;
  to: string;
}
export const EMPTY_ACCOUNT_FILTERS: AccountFiltersValue = { role: 'all', purchases: 'all', from: '', to: '' };

export function accountFilterCount(value: AccountFiltersValue): number {
  return Number(value.role !== 'all') + Number(value.purchases !== 'all') + Number(!!value.from || !!value.to);
}

export function accountFilterLabels(value: AccountFiltersValue): string[] {
  const labels: string[] = [];
  if (value.role !== 'all') labels.push(value.role === 'ADMIN' ? 'Administrador' : 'Vendedor');
  if (value.purchases !== 'all') labels.push(value.purchases === 'with' ? 'Con compras pagadas' : 'Sin compras pagadas');
  const format = (date: string) => date.split('-').reverse().join('/');
  if (value.from) labels.push(`Desde ${format(value.from)}`);
  if (value.to) labels.push(`Hasta ${format(value.to)}`);
  return labels;
}

export function matchesRegistrationDate(date: string | null, value: AccountFiltersValue): boolean {
  if (!value.from && !value.to) return true;
  if (!date) return false;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return false;
  const day = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date :
    `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  return (!value.from || day >= value.from) && (!value.to || day <= value.to);
}

@Component({
  selector: 'app-account-filters',
  imports: [ReactiveFormsModule],
  templateUrl: './account-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountFilters implements OnInit {
  readonly kind = input.required<'users' | 'customers'>();
  readonly value = input.required<AccountFiltersValue>();
  readonly applyFilters = output<AccountFiltersValue>();
  readonly dismiss = output<void>();
  readonly form = inject(FormBuilder).nonNullable.group(EMPTY_ACCOUNT_FILTERS);
  ngOnInit(): void { this.form.reset(this.value()); }
  get invalidRange(): boolean {
    const { from, to } = this.form.getRawValue();
    return !!from && !!to && from > to;
  }
  apply(): void {
    if (this.form.invalid || this.invalidRange) return;
    this.applyFilters.emit(this.form.getRawValue());
  }
  reset(): void { this.form.reset(EMPTY_ACCOUNT_FILTERS); }
}
