export function formatCurrency(value) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("de-CH").format(new Date(value));
}

export function asNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function calculateOfferTotals(offer) {
  const subtotal = offer.items
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + asNumber(item.quantity) * asNumber(item.manualPrice), 0);
  const discount = asNumber(offer.discount);
  return {
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
  };
}

export function calculateBillingTotal(rows) {
  return rows
    .filter((row) => row.billable)
    .reduce((sum, row) => sum + asNumber(row.people) * asNumber(row.hours) * asNumber(row.rate), 0);
}
