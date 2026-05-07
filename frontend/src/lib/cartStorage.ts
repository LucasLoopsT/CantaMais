const KEY = "canta_cart";

export type CartExtra = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export type CartLine = {
  lineId: string;
  id: number;
  name: string;
  price: number;
  img: string;
  quantity: number;
  extras: CartExtra[];
  available: boolean;
  observacao?: string | null;
};

function normalize(lines: unknown): CartLine[] {
  if (!Array.isArray(lines)) return [];
  return lines.map((raw) => {
    const o = raw as Record<string, unknown>;
    const id = Number(o.id);
    const price = Number(o.price);
    const quantity = Math.max(1, Number(o.quantity) || 1);
    const extras = Array.isArray(o.extras)
      ? (o.extras as CartExtra[]).map((e) => ({
          id: Number(e.id),
          name: String(e.name ?? ""),
          price: Number(e.price) || 0,
          quantity: Math.max(1, Number(e.quantity) || 1),
        }))
      : [];
    const obsRaw = o.observacao;
    const observacao =
      typeof obsRaw === "string"
        ? obsRaw.slice(0, 500)
        : obsRaw === null
          ? null
          : undefined;
    return {
      lineId:
        typeof o.lineId === "string" && o.lineId
          ? o.lineId
          : `legacy-${id}-${Math.random().toString(36).slice(2, 11)}`,
      id: Number.isFinite(id) ? id : 0,
      name: String(o.name ?? ""),
      price: Number.isFinite(price) ? price : 0,
      img: String(o.img ?? ""),
      quantity,
      extras,
      available: o.available !== false,
      observacao,
    };
  });
}

export function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return normalize(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveCart(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
}

export function appendCartLine(line: CartLine) {
  const prev = loadCart();
  saveCart([...prev, line]);
}
