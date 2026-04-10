"use client";

import { useEffect, useState } from "react";
import { parseNumber } from "@/lib/format";

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: "kr" | "%" | "ar" | string;
  step?: number;
  min?: number;
  help?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  suffix = "kr",
  step,
  min,
  help,
}: Props) {
  const [raw, setRaw] = useState<string>(
    value === 0 ? "" : formatForEdit(value, suffix),
  );

  useEffect(() => {
    const parsed = parseNumber(raw);
    const display = suffix === "%" ? parsed / 100 : parsed;
    if (display !== value) {
      setRaw(value === 0 ? "" : formatForEdit(value, suffix));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1 flex rounded-md border border-slate-300 bg-white shadow-sm focus-within:border-slate-500">
        <input
          type="text"
          inputMode="decimal"
          value={raw}
          step={step}
          min={min}
          onChange={(e) => {
            setRaw(e.target.value);
            const parsed = parseNumber(e.target.value);
            onChange(suffix === "%" ? parsed / 100 : parsed);
          }}
          className="w-full rounded-md border-0 bg-transparent px-3 py-2 text-right text-slate-900 outline-none"
        />
        <span className="flex items-center pr-3 text-sm text-slate-500">
          {suffix}
        </span>
      </div>
      {help && <span className="mt-1 block text-xs text-slate-500">{help}</span>}
    </label>
  );
}

function formatForEdit(value: number, suffix: string): string {
  if (suffix === "%") {
    return (value * 100).toString().replace(".", ",");
  }
  return value.toString();
}
