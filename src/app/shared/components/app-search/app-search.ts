import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AppDestination, findDestinations } from '../../../core/navigation/app-navigation';
import { Icon } from '../icon/icon';
import { SearchInput } from '../search-input/search-input';

@Component({
  selector: 'app-app-search',
  imports: [Icon, SearchInput],
  host: { class: 'block min-w-0' },
  template: ` <button
      type="button"
      class="flex size-10 items-center justify-center rounded-full hover:bg-surface-muted md:hidden"
      aria-label="Buscar en la aplicación"
      [attr.aria-expanded]="mobileOpen()"
      (click)="openMobile()"
    >
      <app-icon name="search" [size]="20" />
    </button>
    @if (open() || mobileOpen()) {
      <button
        type="button"
        tabindex="-1"
        class="fixed inset-0 z-40 cursor-default"
        aria-label="Cerrar búsqueda de navegación"
        (click)="close()"
      ></button>
    }
    <div
      #searchArea
      tabindex="-1"
      [class]="
        mobileOpen()
          ? 'fixed inset-x-4 top-20 z-50 rounded-2xl border border-border bg-surface p-3 shadow-lg md:relative md:inset-auto md:top-auto md:border-0 md:p-0 md:shadow-none'
          : 'relative z-50 hidden w-full max-w-[400px] md:block'
      "
      (keydown)="onKey($event)"
    >
      <app-search-input
        placeholder="Ir a una sección o pedido…"
        label="Buscar secciones o ir a un pedido"
        [value]="query()"
        [clearable]="true"
        (valueChange)="search($event)"
        (focusin)="open.set(true)"
      />
      @if (open() && query().trim()) {
        <section
          aria-label="Resultados de navegación"
          class="absolute inset-x-0 top-full mt-2 max-h-[65vh] overflow-y-auto rounded-2xl border border-border bg-surface py-2 shadow-lg"
        >
          @for (item of results(); track item.route; let index = $index) {
            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-ink hover:bg-surface-muted"
              [class.bg-surface-muted]="index === selected()"
              (click)="choose(item)"
            >
              <app-icon [name]="item.icon" [size]="18" />{{ item.label }}
            </button>
          } @empty {
            <p role="status" class="px-4 py-3 text-sm text-ink-muted">
              No se encontraron secciones.
            </p>
          }
          <p class="border-t border-border px-4 pt-2 text-xs text-ink-muted">
            También puedes escribir «pedido 123».
          </p>
        </section>
      }
    </div>`,
})
export class AppSearch {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly area = viewChild<ElementRef<HTMLElement>>('searchArea');
  readonly query = signal('');
  readonly open = signal(false);
  readonly mobileOpen = signal(false);
  readonly selected = signal(0);
  readonly results = computed(() =>
    findDestinations(this.query(), this.auth.session()?.user.role ?? ''),
  );
  search(query: string): void {
    this.query.set(query);
    this.selected.set(0);
    this.open.set(true);
  }
  openMobile(): void {
    this.mobileOpen.set(true);
    this.open.set(true);
    afterNextRender(() => this.area()?.nativeElement.querySelector('input')?.focus(), {
      injector: this.injector,
    });
  }
  close(): void {
    this.open.set(false);
    this.mobileOpen.set(false);
  }
  choose(item: AppDestination): void {
    this.close();
    this.query.set('');
    void this.router.navigateByUrl(item.route);
  }
  onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
    if (['ArrowDown', 'ArrowUp'].includes(event.key) && this.results().length) {
      event.preventDefault();
      this.open.set(true);
      this.selected.update(
        (index) =>
          (index + (event.key === 'ArrowDown' ? 1 : -1) + this.results().length) %
          this.results().length,
      );
    }
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      const item = this.results()[this.selected()];
      if (item) this.choose(item);
    }
  }
}
