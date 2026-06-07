export function calculatePromotionPrice(quantity: number, unitPrice = 199000) {
  if (quantity === 2) return 378000;
  if (quantity === 3) return 557000;
  return quantity * unitPrice;
}
