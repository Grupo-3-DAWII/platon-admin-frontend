import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

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

  readonly email = signal('');
  readonly password = signal('');

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  login(): void {
    const email = this.email().trim();
    const password = this.password();

    if (!email || !password) {
      this.errorMessage.set('Ingresa tu correo electrónico y contraseña.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService
      .login({
        email,
        password,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);

          void this.router.navigate(['/dashboard']);
        },

        error: () => {
          this.loading.set(false);

          this.errorMessage.set('Correo o contraseña incorrectos. Verifica tus credenciales.');
        },
      });
  }
}
