import { formatKr, formatPct } from "@/lib/format";

interface Props {
  label: string;
  value: number;
  kind?: "kr" | "%";
  emphasize?: boolean;
  tone?: "positive" | "negative" | "neutral";
}

export function ResultRow({
  label,
  value,
  kind = "kr",
  emphasize,
  tone = "neutral",
}: Props) {
  const formatted = kind === "%" ? formatPct(value) : formatKr(value);
  const toneClass =
    tone === "positive"
      ? "text-emerald-700"
      : tone === "negative"
        ? "text-rose-700"
        : "text-slate-900";
  return (
    <div className="flex items-baseline justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span
        className={`${emphasize ? "text-lg font-semibold" : "text-sm"} ${toneClass}`}
      >
        {formatted}
      </span>
    </div>
  );
}
