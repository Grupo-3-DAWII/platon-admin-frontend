import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SanitizeInput } from './sanitize-input.directive';

@Component({ selector: 'app-input-test', imports: [ReactiveFormsModule, SanitizeInput],
  template: '<input aria-label="Nombre" [formControl]="name" appSanitize="name" />' })
class InputTest { readonly name = new FormControl('', { nonNullable: true }); }

describe('Sanitized account input', () => {
  it('keeps the displayed text and form value synchronized when typing or pasting invalid characters', () => {
    const fixture = TestBed.createComponent(InputTest);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '  José123   Pérez4  ';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    expect(input.value).toBe(' José Pérez ');
    expect(fixture.componentInstance.name.value).toBe(' José Pérez ');
    input.dispatchEvent(new Event('blur'));
    expect(input.value).toBe('José Pérez');
    expect(fixture.componentInstance.name.value).toBe('José Pérez');
  });
});
