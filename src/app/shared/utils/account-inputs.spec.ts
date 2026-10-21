import { FormBuilder } from '@angular/forms';
import { accountFieldError, createAccountForm, findDuplicateAccountFields, normalizeAccountForm, passwordByteLimit, sanitizeAccountInput, suggestedUsername } from './account-inputs';

describe('Account input prevention', () => {
  it('combines the first name and first surname without random suffixes or added characters', () => {
    expect(suggestedUsername('José Luis', 'Pérez García')).toBe('joseperez');
    expect(suggestedUsername('María-José', 'D’Ávila')).toBe('mariajosedavila');
    expect(suggestedUsername('José', '')).toBe('');
  });
  it('removes digits and extra spaces while preserving accents and real name separators', () => {
    expect(sanitizeAccountInput('  Mari\u0301a23   D’Ávila4  ', 'name', true)).toBe('María D’Ávila');
    expect(sanitizeAccountInput("Jean-Luc O'Connor", 'name', true)).toBe("Jean-Luc O'Connor");
  });
  it('cleans pasted usernames, emails, contacts and invisible characters', () => {
    expect(sanitizeAccountInput('  juan .perez! ', 'username', true)).toBe('juan.perez');
    expect(sanitizeAccountInput(' user @example.com ', 'email', true)).toBe('user@example.com');
    expect(sanitizeAccountInput('+51 999abc 123-456', 'phone', true)).toBe('+51 999 123-456');
    expect(sanitizeAccountInput('Av. Perú\u200b   123, Dpto. 4', 'address', true)).toBe('Av. Perú 123, Dpto. 4');
  });
  it('rejects numeric names even if values bypass the input directive', () => {
    const form = createAccountForm(new FormBuilder().nonNullable);
    form.controls.name.setValue('Juan123');
    expect(form.controls.name.invalid).toBe(true);
    expect(accountFieldError(form.controls.name, 'name')).toBe('Solo letras.');
    form.controls.name.setValue('María-José');
    expect(form.controls.name.valid).toBe(true);
  });
  it('normalizes whitespace-only required fields and gives short, specific errors', () => {
    const form = createAccountForm(new FormBuilder().nonNullable);
    form.controls.name.setValue('   ');
    form.controls.email.setValue('user@invalid');
    normalizeAccountForm(form);
    expect(accountFieldError(form.controls.name, 'name')).toBe('Campo obligatorio.');
    expect(accountFieldError(form.controls.email, 'email')).toBe('Correo inválido.');
    form.controls.nro.setValue('123');
    expect(accountFieldError(form.controls.nro, 'nro')).toBe('Usa 7 a 15 dígitos.');
    form.controls.username.setValue('ab');
    expect(accountFieldError(form.controls.username, 'username')).toBe('Mínimo 3 caracteres.');
  });
  it('checks duplicate identity fields across staff and customer accounts, excluding the edited account', () => {
    const account = { idUser: 1, username: 'Admin', email: 'ADMIN@example.com', nro: '+51 999-123-456' };
    const request = { username: ' admin ', email: 'admin@example.com', nro: '+51999123456' };
    expect(findDuplicateAccountFields([account], request)).toEqual(['username', 'email', 'nro']);
    expect(findDuplicateAccountFields([account], request, 1)).toEqual([]);
  });
  it('does not trim passwords and catches the BCrypt byte limit for Unicode passwords', () => {
    const form = createAccountForm(new FormBuilder().nonNullable);
    form.controls.password.setValue('  Password123!  ');
    normalizeAccountForm(form);
    expect(form.controls.password.value).toBe('  Password123!  ');
    form.controls.password.setValue('🔒'.repeat(20));
    expect(passwordByteLimit(form.controls.password)).toEqual({ passwordBytes: true });
    expect(accountFieldError(form.controls.password, 'password')).toBe('Contraseña demasiado larga.');
  });
});
