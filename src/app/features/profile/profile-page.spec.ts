import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProfilePage } from './profile-page';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
describe('Staff contact profile', () => {
  it('only submits contact fields and keeps account identity read-only', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { session: () => ({ user: { idUser: 1 } }) } },
      ],
    });
    const fixture = TestBed.createComponent(ProfilePage);
    const http = TestBed.inject(HttpTestingController);
    const person = {
      name: 'Ana',
      lastname: 'Rojas',
      username: 'ana',
      email: 'ana@platon.test',
      nro: '950000001',
      direccion: 'Calle Los Olivos 123',
    };
    http.expectOne(`${environment.apiUrl}/api/accounts/1`).flush(person);
    fixture.componentInstance.form.setValue({
      nro: '980000001',
      direccion: '  Calle   Nueva 123  ',
    });
    fixture.componentInstance.save();
    const request = http.expectOne(`${environment.apiUrl}/api/accounts/me/contact`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ nro: '980000001', direccion: 'Calle Nueva 123' });
    request.flush({ ...person, nro: '980000001', direccion: 'Calle Nueva 123' });
    expect(fixture.componentInstance.saved()).toBe(true);
    fixture.componentInstance.form.controls.nro.setValue('123');
    fixture.componentInstance.save();
    http.expectNone(`${environment.apiUrl}/api/accounts/me/contact`);
    http.verify();
  });
});
