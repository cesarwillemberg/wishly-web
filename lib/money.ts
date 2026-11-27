export type MoneyTotal = { currency: string; amount: number };

export function formatMoney(value: number, currency?: string | null): string {
  const code = (currency ?? "").toUpperCase();
  switch (code) {
    case "BRL":
      return `R$ ${group(value, ".", ",")}`;
    case "EUR":
      return `€ ${group(value, ".", ",")}`;
    case "USD":
      return `US$ ${group(value, ",", ".")}`;
    case "GBP":
      return `£ ${group(value, ",", ".")}`;
    case "":
      return group(value, ".", ",");
    default:
      return `${code} ${group(value, ",", ".")}`;
  }
}

export function parseUserPrice(input: string): number | null {
  const match = /\d[\d.,]*/.exec(input.trim());
  if (!match) return null;
  let token = match[0];
  if (token.endsWith(".") || token.endsWith(",")) token = token.slice(0, -1);
  if (token.includes(",") && token.includes(".")) {
    if (token.lastIndexOf(",") > token.lastIndexOf(".")) {
      token = token.replaceAll(".", "").replaceAll(",", ".");
    } else {
      token = token.replaceAll(",", "");
    }
  } else if (token.includes(",")) {
    const bits = token.split(",");
    const tail = bits.at(-1) ?? "";
    if (tail.length <= 2) {
      token = `${bits.slice(0, -1).join("").replaceAll(".", "")}.${tail}`;
    } else {
      token = token.replaceAll(",", "");
    }
  } else if (/^\d{1,3}(\.\d{3})+$/.test(token)) {
    token = token.replaceAll(".", "");
  }
  const value = Number(token);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

function group(value: number, thousands: string, decimal: string): string {
  const negative = value < 0;
  const [digits, fraction] = Math.abs(value).toFixed(2).split(".");
  let whole = "";
  for (let index = 0; index < digits.length; index += 1) {
    if (index > 0 && (digits.length - index) % 3 === 0) whole += thousands;
    whole += digits[index];
  }
  return `${negative ? "-" : ""}${whole}${decimal}${fraction}`;
}

export function sumPrices(
  items: { price: number | null; currency: string | null }[],
): MoneyTotal[] {
  const buckets = new Map<string, number>();
  for (const item of items) {
    if (item.price == null) continue;
    const code = (item.currency ?? "").toUpperCase();
    buckets.set(code, (buckets.get(code) ?? 0) + item.price);
  }
  const keys = [...buckets.keys()].sort((a, b) => {
    if (a === "BRL") return -1;
    if (b === "BRL") return 1;
    if (a === "") return 1;
    if (b === "") return -1;
    return a.localeCompare(b);
  });
  return keys.map((currency) => ({ currency, amount: buckets.get(currency) ?? 0 }));
}
