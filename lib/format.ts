const krFormatter = new Intl.NumberFormat("sv-SE", {
  maximumFractionDigits: 0,
});

const pctFormatter = new Intl.NumberFormat("sv-SE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

export function formatKr(value: number): string {
  if (!Number.isFinite(value)) return "0 kr";
  return `${krFormatter.format(Math.round(value))} kr`;
}

export function formatPct(ratio: number): string {
  if (!Number.isFinite(ratio)) return "0 %";
  return `${pctFormatter.format(ratio * 100)} %`;
}

export function parseNumber(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^\d,.-]/g, "").replace(/\s/g, "").replace(",", ".");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}
