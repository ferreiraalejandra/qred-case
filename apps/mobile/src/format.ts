export function formatMoney(amount: number, currency: 'SEK'): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency', currency, maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  // Use the UTC calendar part of a date or timestamp so it cannot shift a day locally.
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${date.slice(0, 10)}T12:00:00Z`));
}

export function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(timestamp));
}
