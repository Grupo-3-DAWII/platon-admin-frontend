import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import { SanitizeInput } from '../../shared/directives/sanitize-input.directive';
import { PageHeader } from '../../shared/components/page-header/page-header';

interface ContactProfile {
  name: string;
  lastname: string;
  username: string;
  email: string;
  nro: string;
  direccion: string;
}
@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule, SanitizeInput, PageHeader],
  template: ` <app-page-header title="Mi perfil" />
    <section class="mt-5 max-w-3xl rounded-2xl border border-border bg-surface p-5 sm:p-7">
      @if (loading()) {
        <p class="text-sm text-ink-muted">Cargando perfil...</p>
      } @else if (profile(); as person) {
        <div class="mb-7 flex items-center gap-4">
          <img src="/images/avatar/user-avatar.png" alt="" class="size-14 rounded-full" />
          <div class="min-w-0">
            <h2 class="break-words text-lg font-semibold text-ink">
              {{ person.name }} {{ person.lastname }}
            </h2>
            <p class="break-all text-sm text-ink-muted">{{ person.email }}</p>
            <p class="mt-1 text-xs text-ink-muted">{{ person.username }}</p>
          </div>
        </div>
        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-5">
          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="admin-profile-phone" class="mb-2 block text-sm font-medium"
                >Teléfono</label
              ><input
                id="admin-profile-phone"
                formControlName="nro"
                appSanitize="phone"
                type="tel"
                inputmode="numeric"
                autocomplete="tel"
                maxlength="15"
                class="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-brand"
              />
              @if (form.controls.nro.touched && form.controls.nro.invalid) {
                <p class="mt-1 text-xs text-danger">Usa entre 7 y 15 dígitos.</p>
              }
            </div>
            <div>
              <label for="admin-profile-address" class="mb-2 block text-sm font-medium"
                >Dirección</label
              ><input
                id="admin-profile-address"
                formControlName="direccion"
                appSanitize="address"
                autocomplete="street-address"
                maxlength="180"
                class="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-brand"
              />
              @if (form.controls.direccion.touched && form.controls.direccion.invalid) {
                <p class="mt-1 text-xs text-danger">Ingresa una dirección válida.</p>
              }
            </div>
          </div>
          @if (saved()) {
            <p role="status" class="text-sm text-brand">Datos actualizados.</p>
          }
          <button
            type="submit"
            [disabled]="busy()"
            class="rounded-full bg-brand px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {{ busy() ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </form>
      }
      @if (error()) {
        <p role="alert" class="mt-4 text-sm text-danger">{{ error() }}</p>
        @if (!profile()) {
          <button type="button" (click)="load()" class="mt-3 text-sm text-brand underline">
            Reintentar
          </button>
        }
      }
    </section>`,
})
export class ProfilePage {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  readonly profile = signal<ContactProfile | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly saved = signal(false);
  readonly error = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({
    nro: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
    direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(180)]],
  });
  constructor() {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.http
      .get<ContactProfile>(`${environment.apiUrl}/api/accounts/${this.auth.session()!.user.idUser}`)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (person) => {
          this.profile.set(person);
          this.form.patchValue({ nro: person.nro ?? '', direccion: person.direccion ?? '' });
        },
        error: () => this.error.set('No se pudo cargar tu perfil.'),
      });
  }
  save(): void {
    if (this.busy()) return;
    this.form.controls.direccion.setValue(
      this.form.controls.direccion.value.trim().replace(/\s+/g, ' '),
    );
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.busy.set(true);
    this.saved.set(false);
    this.error.set('');
    this.http
      .put<ContactProfile>(`${environment.apiUrl}/api/accounts/me/contact`, this.form.getRawValue())
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (person) => {
          this.profile.set(person);
          this.form.patchValue({ nro: person.nro, direccion: person.direccion });
          this.form.markAsPristine();
          this.saved.set(true);
        },
        error: (err: HttpErrorResponse) =>
          this.error.set(
            err.status === 0 || err.status >= 500
              ? 'No se pudo guardar. Inténtalo nuevamente.'
              : (err.error?.message ?? 'Revisa tus datos.'),
          ),
      });
  }
}
