import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
import { Input } from '../../../../shared/components/input/input';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [Input],
  templateUrl: './login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly username = signal('');
  readonly password = signal('');

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  login(): void {
    const username = this.username().trim();
    const password = this.password();

    if (!username || !password) {
      this.errorMessage.set('Ingresa tu usuario y contraseña.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService
      .login({
        username,
        password,
      })
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          void this.router.navigate([this.authService.homeRoute()]);
        },

        error: (error: HttpErrorResponse) => {
          if (error.status === 403) {
            this.errorMessage.set(error.error?.message ?? 'Esta cuenta no tiene acceso al panel interno.');
            return;
          }
          if (error.status === 401) {
            this.errorMessage.set('Usuario o contraseña incorrectos.');
            return;
          }

          this.errorMessage.set('No se pudo conectar con el servidor. Inténtalo nuevamente.');
        },
      });
  }
}
