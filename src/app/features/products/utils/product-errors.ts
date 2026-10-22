import { HttpErrorResponse } from '@angular/common/http';

export function productErrorMessage(err: HttpErrorResponse): string {
  const detail = typeof err.error?.message === 'string' ? err.error.message : null;

  switch (err.status) {
    case 400:
      return detail ?? 'Hay datos inválidos. Revisa los campos e inténtalo de nuevo.';
    case 404:
      return 'El producto ya no existe.';
    case 409:
      return detail ?? 'Ya existe un producto con ese ISBN.';
    default:
      return 'No se pudo guardar el producto. Inténtalo de nuevo.';
  }
}