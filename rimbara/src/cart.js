export const products = {
  embun: {
    name: "Embun Rimba",
    image: "embun",
    price: 890000,
    notes: "Neroli · Bergamot · Vetiver",
    description:
      "Pagi setelah hujan, dalam sebuah botol. Citrus yang jernih membuka jalan bagi neroli, sebelum menetap dalam vetiver yang hijau dan membumi.",
  },
  iris: {
    name: "Teduh Iris",
    image: "iris-product",
    price: 940000,
    notes: "Iris · Violet · Soft musk",
    description:
      "Ruang untuk melambat. Iris yang lembut berpadu dengan violet dan musk, menghadirkan aroma berbedak yang intim dan tenang.",
  },
  senja: {
    name: "Senja Kayu",
    image: "senja",
    price: 960000,
    notes: "Cedar · Amber · Sandalwood",
    description:
      "Sisa hangat matahari di penghujung hari. Cedar kering bertemu amber dan sandalwood dalam jejak kayu yang lembut.",
  },
};
export const money = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
export function priceFor(id, size) {
  return (
    Math.round(
      (products[id].price * { 30: 0.67, 50: 1, 100: 1.65 }[size]) / 10000,
    ) * 10000
  );
}
export function validCart(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item) =>
        item &&
        Object.hasOwn(products, item.id) &&
        [30, 50, 100].includes(item.size) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= 20,
    )
    .map(({ id, size, quantity }) => ({ id, size, quantity }));
}
export function addItem(cart, id, size, quantity) {
  const next = cart.map((item) => ({ ...item }));
  const existing = next.find((item) => item.id === id && item.size === size);
  if (existing) existing.quantity = Math.min(20, existing.quantity + quantity);
  else next.push({ id, size, quantity: Math.min(20, quantity) });
  return validCart(next);
}
