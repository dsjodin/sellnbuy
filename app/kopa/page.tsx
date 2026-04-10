"use client";

import { useMemo, useState } from "react";
import { NumberInput } from "@/components/NumberInput";
import { ResultRow } from "@/components/ResultRow";
import { Section } from "@/components/Section";
import { calculateKalp } from "@/lib/calculations";
import type { ChildAgeGroup } from "@/lib/calculations";

interface ChildRow {
  id: number;
  group: ChildAgeGroup;
}

const CHILD_GROUP_LABELS: Record<ChildAgeGroup, string> = {
  child0_3: "0 - 3 ar",
  child4_6: "4 - 6 ar",
  child7_10: "7 - 10 ar",
  child11_14: "11 - 14 ar",
  child15_18: "15 - 18 ar",
};

export default function KopaPage() {
  const [propertyPrice, setPropertyPrice] = useState(4_000_000);
  const [ownCapital, setOwnCapital] = useState(600_000);
  const [grossAnnualIncome, setGrossAnnualIncome] = useState(900_000);
  const [netMonthlyIncome, setNetMonthlyIncome] = useState(55_000);
  const [interestRate, setInterestRate] = useState(0.04);
  const [stressRate, setStressRate] = useState(0.07);
  const [operatingCost, setOperatingCost] = useState(4_500);
  const [adults, setAdults] = useState<1 | 2>(2);
  const [children, setChildren] = useState<ChildRow[]>([]);

  const result = useMemo(
    () =>
      calculateKalp({
        propertyPrice,
        ownCapital,
        grossAnnualIncomeHousehold: grossAnnualIncome,
        netMonthlyIncomeHousehold: netMonthlyIncome,
        interestRate,
        stressRate,
        operatingCostMonthly: operatingCost,
        household: {
          adults,
          children: children.map((c) => c.group),
        },
      }),
    [
      propertyPrice,
      ownCapital,
      grossAnnualIncome,
      netMonthlyIncome,
      interestRate,
      stressRate,
      operatingCost,
      adults,
      children,
    ],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">Kopkalkyl</h1>

        <Section
          title="Bostad och kontantinsats"
          description="Bolanetaket ar 85 % av marknadsvardet. Minst 15 % maste vara egen kontantinsats."
        >
          <NumberInput
            label="Bostadens pris"
            value={propertyPrice}
            onChange={setPropertyPrice}
          />
          <NumberInput
            label="Kontantinsats / egen insats"
            value={ownCapital}
            onChange={setOwnCapital}
          />
        </Section>

        <Section title="Inkomst och ranta">
          <NumberInput
            label="Hushallets brutto arsinkomst"
            value={grossAnnualIncome}
            onChange={setGrossAnnualIncome}
            help="Anvands for att rakna skuldkvot (> 4,5x ger extra amortering)."
          />
          <NumberInput
            label="Hushallets netto manadsinkomst"
            value={netMonthlyIncome}
            onChange={setNetMonthlyIncome}
            help="Efter skatt. Ligger till grund for KALP."
          />
          <NumberInput
            label="Faktisk bolaneranta"
            value={interestRate}
            suffix="%"
            onChange={setInterestRate}
          />
          <NumberInput
            label="Stressad ranta (bankens KALP-ranta)"
            value={stressRate}
            suffix="%"
            onChange={setStressRate}
            help="Banker stresstestar vanligen med 6 - 8,5 %."
          />
          <NumberInput
            label="Manatlig driftkostnad"
            value={operatingCost}
            onChange={setOperatingCost}
            help="Avgift, el, varme, forsakring, vatten m.m."
          />
        </Section>

        <Section
          title="Hushall"
          description="Baseras pa Konsumentverkets referenskostnader (ungefarliga 2025-varden)."
        >
          <label className="block">
            <span className="block text-sm font-medium text-slate-700">
              Vuxna
            </span>
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value) as 1 | 2)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
            >
              <option value={1}>1 vuxen</option>
              <option value={2}>2 vuxna</option>
            </select>
          </label>

          {children.map((row) => (
            <div key={row.id} className="flex items-end gap-3">
              <label className="block flex-1">
                <span className="block text-sm font-medium text-slate-700">
                  Barn
                </span>
                <select
                  value={row.group}
                  onChange={(e) =>
                    setChildren((rows) =>
                      rows.map((r) =>
                        r.id === row.id
                          ? { ...r, group: e.target.value as ChildAgeGroup }
                          : r,
                      ),
                    )
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
                >
                  {(Object.keys(CHILD_GROUP_LABELS) as ChildAgeGroup[]).map(
                    (k) => (
                      <option key={k} value={k}>
                        {CHILD_GROUP_LABELS[k]}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <button
                type="button"
                onClick={() =>
                  setChildren((rows) => rows.filter((r) => r.id !== row.id))
                }
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-500 hover:border-rose-400 hover:text-rose-600"
              >
                Ta bort
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setChildren((rows) => [
                ...rows,
                { id: Date.now(), group: "child4_6" },
              ])
            }
            className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-slate-500"
          >
            Lagg till barn
          </button>
        </Section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Lan</h2>
          <div className="mt-2">
            <ResultRow label="Lan" value={result.loan} />
            <ResultRow label="Kontantinsats" value={result.downPayment} />
            <ResultRow label="Belaningsgrad" value={result.ltv} kind="%" />
            <div className="flex items-baseline justify-between border-b border-slate-100 py-2 last:border-0">
              <span className="text-sm text-slate-600">Skuldkvot</span>
              <span className="text-sm text-slate-900">
                {result.debtToIncome.toFixed(1).replace(".", ",")}x
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Manadskostnad</h2>
          <div className="mt-2">
            <ResultRow
              label={`Amortering (${(result.amortizationRate * 100).toFixed(0)} %)`}
              value={result.amortizationMonthly}
              tone="negative"
            />
            <ResultRow
              label="Faktisk ranta"
              value={result.actualInterestMonthly}
              tone="negative"
            />
            <ResultRow
              label="Stressad ranta (KALP)"
              value={result.stressedInterestMonthly}
              tone="negative"
            />
            <ResultRow
              label="Driftkostnad"
              value={result.operatingCostMonthly}
              tone="negative"
            />
            <ResultRow
              label="Levnadsschablon"
              value={result.livingCostSchablon}
              tone="negative"
            />
          </div>
        </div>

        <div
          className={`rounded-lg border p-6 shadow-sm ${
            result.approved
              ? "border-emerald-200 bg-emerald-50"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          <h2 className="text-lg font-semibold text-slate-900">
            KALP (kvar att leva pa)
          </h2>
          <p className="mt-2 text-2xl font-semibold">
            <span className={result.approved ? "text-emerald-700" : "text-rose-700"}>
              {formatKrLocal(result.kalp)}
            </span>
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {result.approved
              ? "KALP ar positiv - hushallet klarar bankens stresstest."
              : "KALP ar negativ - lanebelopp eller kostnader behover justeras."}
          </p>
        </div>
      </aside>
    </div>
  );
}

function formatKrLocal(value: number): string {
  const rounded = Math.round(value);
  const formatted = new Intl.NumberFormat("sv-SE").format(rounded);
  return `${formatted} kr`;
}
