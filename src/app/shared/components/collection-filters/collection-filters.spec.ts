import { TestBed } from '@angular/core/testing';
import { CollectionFilters } from './collection-filters';
import { emptyCollectionFilters } from '../../utils/collection-filters';
describe('Additional collection filters', () => {
  it('discards unapplied changes on reopening and blocks invalid ranges', () => {
    TestBed.configureTestingModule({ imports: [CollectionFilters] });
    const fixture = TestBed.createComponent(CollectionFilters);
    fixture.componentRef.setInput('kind', 'orders');
    fixture.componentRef.setInput('value', {
      ...emptyCollectionFilters('orders'),
      min: '10',
      sortBy: 'total',
    });
    fixture.detectChanges();
    const apply = vi.spyOn(fixture.componentInstance.applyFilters, 'emit');
    fixture.componentInstance.form.patchValue({ min: '20', max: '10' });
    fixture.componentInstance.apply();
    expect(apply).not.toHaveBeenCalled();
    fixture.componentInstance.reset();
    fixture.componentInstance.apply();
    expect(apply).toHaveBeenCalledWith(emptyCollectionFilters('orders'));
  });
});
