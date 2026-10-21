import { TestBed } from '@angular/core/testing';
import { AccountFilters, EMPTY_ACCOUNT_FILTERS, matchesRegistrationDate } from './account-filters';

describe('Additional account filters', () => {
  it('includes boundary days and rejects missing or invalid dates only when a date is selected', () => {
    const range = { ...EMPTY_ACCOUNT_FILTERS, from: '2026-10-01', to: '2026-10-02' };
    expect(matchesRegistrationDate('2026-10-01', range)).toBe(true);
    expect(matchesRegistrationDate('2026-10-02T23:59:59', range)).toBe(true);
    expect(matchesRegistrationDate('2026-10-03T00:00:00', range)).toBe(false);
    expect(matchesRegistrationDate(null, range)).toBe(false);
    expect(matchesRegistrationDate('invalid', range)).toBe(false);
    expect(matchesRegistrationDate(null, EMPTY_ACCOUNT_FILTERS)).toBe(true);
  });
  it('keeps drafts unapplied, blocks reversed dates and restores defaults', () => {
    const fixture = TestBed.createComponent(AccountFilters);
    fixture.componentRef.setInput('kind', 'users');
    fixture.componentRef.setInput('value', { ...EMPTY_ACCOUNT_FILTERS, role: 'SELLER' });
    fixture.detectChanges();
    const emitted: unknown[] = [];
    fixture.componentInstance.applyFilters.subscribe((value) => emitted.push(value));
    const panel = fixture.componentInstance;
    panel.form.patchValue({ from: '2026-10-10', to: '2026-10-01' });
    panel.apply(); expect(emitted).toHaveLength(0);
    panel.form.patchValue({ to: '2026-10-10' });
    panel.apply(); expect(emitted).toHaveLength(1);
    panel.reset(); expect(panel.form.getRawValue()).toEqual(EMPTY_ACCOUNT_FILTERS);
  });
});
