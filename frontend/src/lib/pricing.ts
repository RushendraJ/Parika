export type PricedLine = { price: number; quantity: number };

/** Order total in whole rupees. Delivery is free. */
export function orderTotal(lines: PricedLine[]): number {
  return lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
}

export function discountPercent(price: number, mrp: number | null | undefined): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
