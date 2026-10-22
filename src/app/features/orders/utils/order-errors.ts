import { HttpErrorResponse } from '@angular/common/http';

export function orderErrorMessage(err: HttpErrorResponse): string {
  const detail = typeof err.error?.message === 'string' ? err.error.message : null;
  if (err.status === 409) {
    return detail ?? 'El pago ya fue resuelto o el pedido no se puede procesar.';
  }
  if (err.status === 404) return 'El pedido ya no existe.';
  return detail ?? 'No se pudo completar la acción. Inténtalo de nuevo.';
}