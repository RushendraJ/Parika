/** Order total in whole rupees. Delivery is free. */
export const orderTotal = (lines) => lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
