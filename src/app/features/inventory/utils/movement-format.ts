import { InventoryMovement, MovementType } from '../models/inventory';

const MOVEMENT_LABEL: Record<MovementType, string> = {
  entry: 'Ingreso',
  exit: 'Salida',
  adjustment: 'Ajuste',
};

const pad = (n: number) => String(n).padStart(2, '0');
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function movementSummary(movement: InventoryMovement): string {
  const sign = movement.quantity > 0 ? '+' : '';
  return `${MOVEMENT_LABEL[movement.type]} ${sign}${movement.quantity}`;
}

export function movementDate(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const hours = date.getHours();
  const time = `${hours % 12 || 12}:${pad(date.getMinutes())} ${hours < 12 ? 'am' : 'pm'}`;

  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (daysAgo === 0) return `Hoy ${time}`;
  if (daysAgo === 1) return `Ayer ${time}`;

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${time}`;
}
