export function orderConfirmation(action: 'accept' | 'reject', id: number): string {
  return action === 'accept'
    ? `¿Confirmar el pago del pedido #${id}? Se registrará como pagado y no podrá cancelarse desde este panel.`
    : `¿Cancelar el pedido #${id}? El pedido se cancelará y se devolverá el stock reservado. Esta acción no se puede deshacer.`;
}
