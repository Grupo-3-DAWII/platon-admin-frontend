import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { Sidebar } from './sidebar';
import { AuthService } from '../../../../core/auth/auth.service';

describe('Sidebar logout confirmation', () => {
  const logout = vi.fn();
  beforeEach(() => {
    logout.mockClear();
    TestBed.configureTestingModule({ imports: [Sidebar], providers: [provideRouter([]),
      { provide: AuthService, useValue: { session: signal({ user: { role: 'ADMIN' } }), logout } },
    ] });
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
    HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  });
  it('keeps the session when opening or cancelling confirmation', () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    fixture.componentInstance.logout();
    expect(dialog.open).toBe(true);
    expect(logout).not.toHaveBeenCalled();
    fixture.componentInstance.cancelLogout();
    expect(dialog.open).toBe(false);
    expect(logout).not.toHaveBeenCalled();
  });
  it('clears the session and navigates to login only after confirmation', () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.componentInstance.logout();
    fixture.componentInstance.confirmLogout();
    expect(logout).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(['/login']);
    expect(fixture.nativeElement.querySelector('dialog').open).toBe(false);
  });
});
