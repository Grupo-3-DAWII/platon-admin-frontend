import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  CollectionFiltersValue,
  emptyCollectionFilters,
  ListKind,
  validCollectionFilters,
} from '../../utils/collection-filters';
@Component({
  selector: 'app-collection-filters',
  imports: [ReactiveFormsModule],
  templateUrl: './collection-filters.html',
})
export class CollectionFilters implements OnInit {
  readonly kind = input.required<ListKind>();
  readonly value = input.required<CollectionFiltersValue>();
  readonly genres = input<string[]>([]);
  readonly editorials = input<string[]>([]);
  readonly applyFilters = output<CollectionFiltersValue>();
  readonly dismiss = output<void>();
  readonly form = inject(FormBuilder).nonNullable.group(emptyCollectionFilters('products'));
  ngOnInit() {
    this.form.reset(this.value());
  }
  get invalidRange() {
    return !validCollectionFilters(this.form.getRawValue(), this.kind());
  }
  apply() {
    if (!this.invalidRange) this.applyFilters.emit(this.form.getRawValue());
  }
  reset() {
    this.form.reset(emptyCollectionFilters(this.kind()));
  }
}
