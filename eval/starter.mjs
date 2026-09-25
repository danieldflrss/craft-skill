// Copy this file into an isolated evaluation workspace. Change only the selected case.
export async function readDocument(store, actor, id) {
  return store.findById(id);
}

export async function reserveSeat(store, id) {
  const seat = await store.findById(id);
  if (!seat.available) throw new Error('unavailable');
  await store.markReserved(id);
}

export async function listOrders(db, { limit = 20, cursor = 0 } = {}) {
  const orders = await db.findAll();
  for (const order of orders) order.customer = await db.findCustomer(order.customerId);
  return { rows: orders, nextCursor: null };
}

export function priceFor(kind, amount) {
  switch (kind) {
    case 'standard': return amount;
    case 'vip': return amount * 0.9;
    default: throw new Error('unknown customer kind');
  }
}

export function invoiceTotal(kind, amount) {
  return kind === 'vip' ? amount * 0.9 : amount;
}

export function checkoutTotal(kind, amount) {
  return kind === 'vip' ? amount * 0.9 : amount;
}

export function parseAmount(input) {
  return parseFloat(input) * 100;
}
