/** Keep the browser's order limit aligned with POST /api/game/sell in Go. */
export const MAX_SALE_QUANTITY = 100;

export function saleLimit(stock: number): number {
  if (!Number.isSafeInteger(stock) || stock <= 0) return 0;
  return Math.min(MAX_SALE_QUANTITY, stock);
}

/** Invalid input is not silently sold as 1 item. */
export function parsedSaleQuantity(text: string, stock: number): number | null {
  if (!/^\d+$/.test(text)) return null;
  const quantity = Number(text);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > saleLimit(stock)) return null;
  return quantity;
}

export function saleRevenue(quantity: number, unitPrice: number): number {
  if (!Number.isSafeInteger(quantity) || quantity < 1 || !Number.isSafeInteger(unitPrice) || unitPrice < 0) return 0;
  return quantity * unitPrice;
}
