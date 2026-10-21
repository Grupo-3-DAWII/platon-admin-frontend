import { ChangeDetectionStrategy, Component, ElementRef, inject, input, OnDestroy, output, signal, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';

export interface RowAction {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
}

let nextMenuId = 0;

@Component({
  selector: 'app-row-actions',
  imports: [Icon],
  templateUrl: './row-actions.html',
  styleUrl: './row-actions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
})
export class RowActions implements OnDestroy {
  readonly label = input.required<string>();
  readonly actions = input.required<readonly RowAction[]>();
  readonly selected = output<string>();
  readonly opened = signal(false);
  readonly menuId = `row-actions-${++nextMenuId}`;
  readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  readonly menu = viewChild.required<ElementRef<HTMLDivElement>>('menu');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly closeOnViewportChange = () => this.close();
  private readonly closeOnScroll = (event: Event) => {
    if (event.target instanceof Node && this.menu().nativeElement.contains(event.target)) return;
    this.close();
  };

  toggle(): void {
    if (this.opened()) { this.close(); return; }
    const menu = this.menu().nativeElement;
    menu.showPopover();
    this.opened.set(true);
    this.position();
    this.buttons()[0]?.focus();
    const window = this.host.nativeElement.ownerDocument.defaultView;
    window?.addEventListener('resize', this.closeOnViewportChange);
    window?.addEventListener('scroll', this.closeOnScroll, true);
  }

  onToggle(event: Event): void {
    const isOpen = (event as ToggleEvent).newState === 'open';
    this.opened.set(isOpen);
    if (!isOpen) this.removeListeners();
  }

  close(restoreFocus = false): void {
    if (this.opened()) this.menu().nativeElement.hidePopover();
    this.opened.set(false);
    this.removeListeners();
    if (restoreFocus) this.trigger().nativeElement.focus();
  }

  choose(action: RowAction): void {
    if (action.disabled) return;
    this.close();
    this.selected.emit(action.id);
  }

  onTriggerKey(event: KeyboardEvent): void {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    if (!this.opened()) this.toggle();
    const buttons = this.buttons();
    (event.key === 'ArrowUp' ? buttons.at(-1) : buttons[0])?.focus();
  }

  onMenuKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') { event.preventDefault(); this.close(true); return; }
    if (event.key === 'Tab') { this.close(); return; }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const buttons = this.buttons();
    const current = buttons.indexOf(this.host.nativeElement.ownerDocument.activeElement as HTMLButtonElement);
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
      : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[index]?.focus();
  }

  ngOnDestroy(): void { this.removeListeners(); }

  private buttons(): HTMLButtonElement[] {
    return Array.from(this.menu().nativeElement.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
  }

  private position(): void {
    const window = this.host.nativeElement.ownerDocument.defaultView;
    if (!window) return;
    const trigger = this.trigger().nativeElement.getBoundingClientRect();
    const menu = this.menu().nativeElement;
    const rect = menu.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(trigger.right - rect.width, window.innerWidth - rect.width - 8))}px`;
    menu.style.top = `${Math.max(8, trigger.bottom + rect.height + 8 > window.innerHeight
      ? trigger.top - rect.height - 6 : trigger.bottom + 6)}px`;
  }

  private removeListeners(): void {
    const window = this.host.nativeElement.ownerDocument.defaultView;
    window?.removeEventListener('resize', this.closeOnViewportChange);
    window?.removeEventListener('scroll', this.closeOnScroll, true);
  }
}
