"use client";

import { useMemo, useState } from "react";
import { NumberInput } from "@/components/NumberInput";
import { ResultRow } from "@/components/ResultRow";
import { Section } from "@/components/Section";
import { formatKr } from "@/lib/format";
import {
  calculateRanteskillnad,
  calculateSale,
  calculateUppskov,
} from "@/lib/calculations";
import type { ImprovementEntry } from "@/lib/calculations";

interface ImprovementRow {
  id: number;
  year: number;
  amount: number;
  kind: "base" | "repair";
}

export default function SaljaPage() {
  const currentYear = new Date().getFullYear();

  const [salePrice, setSalePrice] = useState(3_500_000);
  const [purchasePrice, setPurchasePrice] = useState(1_850_000);
  const [brokerFee, setBrokerFee] = useState(80_000);
  const [sellingCosts, setSellingCosts] = useState(60_000);
  const [originationCosts, setOriginationCosts] = useState(58_000);
  const [loanPayoff, setLoanPayoff] = useState(1_890_000);

  const [improvements, setImprovements] = useState<ImprovementRow[]>([
    { id: 1, year: currentYear - 4, amount: 980_000, kind: "base" },
  ]);

  const [useUppskov, setUseUppskov] = useState(false);
  const [replacementPrice, setReplacementPrice] = useState(4_000_000);

  const [useRanteskillnad, setUseRanteskillnad] = useState(false);
  const [remainingPrincipal, setRemainingPrincipal] = useState(1_500_000);
  const [currentRate, setCurrentRate] = useState(0.04);
  const [referenceRate, setReferenceRate] = useState(0.02);
  const [remainingYears, setRemainingYears] = useState(3);

  const saleResult = useMemo(() => {
    const entries: ImprovementEntry[] = improvements.map((row) => ({
      year: row.year,
      amount: row.amount,
      kind: row.kind,
    }));
    return calculateSale({
      salePrice,
      purchasePrice,
      brokerFee,
      sellingCosts,
      originationCosts,
      improvements: entries,
      currentYear,
      loanPayoff,
    });
  }, [
    salePrice,
    purchasePrice,
    brokerFee,
    sellingCosts,
    originationCosts,
    improvements,
    currentYear,
    loanPayoff,
  ]);

  const uppskovResult = useMemo(
    () =>
      calculateUppskov({
        taxableGain: saleResult.taxableGain,
        originalPrice: salePrice,
        replacementPrice,
      }),
    [saleResult.taxableGain, salePrice, replacementPrice],
  );

  const ranteskillnadResult = useMemo(
    () =>
      calculateRanteskillnad({
        remainingPrincipal,
        currentRate,
        referenceRate,
        remainingYears,
      }),
    [remainingPrincipal, currentRate, referenceRate, remainingYears],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">Saljkalkyl</h1>

        <Section title="Forsaljning">
          <NumberInput
            label="Forsaljningspris"
            value={salePrice}
            onChange={setSalePrice}
          />
          <NumberInput
            label="Inkopspris"
            value={purchasePrice}
            onChange={setPurchasePrice}
          />
          <NumberInput
            label="Maklararvode"
            value={brokerFee}
            onChange={setBrokerFee}
          />
          <NumberInput
            label="Ovriga forsaljningskostnader (styling, homestaging, m.m.)"
            value={sellingCosts}
            onChange={setSellingCosts}
          />
          <NumberInput
            label="Pantbrev / lagfart"
            value={originationCosts}
            onChange={setOriginationCosts}
            help="Ursprungskostnader vid kopet. Avdragsgilla fran vinsten."
          />
          <NumberInput
            label="Skuld att losa vid tilltradet"
            value={loanPayoff}
            onChange={setLoanPayoff}
            help="Dras av fran kvar i planboken men inte fran vinstberakningen."
          />
        </Section>

        <Section
          title="Forbattringsutgifter (renoveringar)"
          description="Grundforbattringar ar alltid avdragsgilla. Reparationsforbattringar endast inom de senaste 5 aren. Per kalenderar maste summan overstiga 5 000 kr."
        >
          {improvements.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr_180px_40px]"
            >
              <NumberInput
                label="Ar"
                value={row.year}
                suffix="ar"
                onChange={(v) =>
                  updateRow(setImprovements, row.id, { year: Math.round(v) })
                }
              />
              <NumberInput
                label="Belopp"
                value={row.amount}
                onChange={(v) =>
                  updateRow(setImprovements, row.id, { amount: v })
                }
              />
              <label className="block">
                <span className="block text-sm font-medium text-slate-700">
                  Typ
                </span>
                <select
                  value={row.kind}
                  onChange={(e) =>
                    updateRow(setImprovements, row.id, {
                      kind: e.target.value as "base" | "repair",
                    })
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
                >
                  <option value="base">Grundforbattring</option>
                  <option value="repair">Reparationsforbattring</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() =>
                  setImprovements((rows) => rows.filter((r) => r.id !== row.id))
                }
                className="self-end rounded-md border border-slate-300 px-2 py-2 text-sm text-slate-500 hover:border-rose-400 hover:text-rose-600"
                aria-label="Ta bort rad"
              >
                x
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setImprovements((rows) => [
                ...rows,
                {
                  id: Date.now(),
                  year: currentYear,
                  amount: 0,
                  kind: "base",
                },
              ])
            }
            className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-slate-500"
          >
            Lagg till rad
          </button>
        </Section>

        <Section title="Uppskov">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={useUppskov}
              onChange={(e) => setUseUppskov(e.target.checked)}
            />
            Jag koper en ersattningsbostad och vill rakna pa uppskov
          </label>
          {useUppskov && (
            <>
              <NumberInput
                label="Pris pa ersattningsbostaden"
                value={replacementPrice}
                onChange={setReplacementPrice}
              />
              <p className="text-xs text-slate-500">
                Schablonintakten pa uppskov avskaffades 1 januari 2021. Ingen
                arlig kostnad tas ut pa uppskovsbeloppet.
              </p>
            </>
          )}
        </Section>

        <Section title="Ranteskillnadsersattning">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={useRanteskillnad}
              onChange={(e) => setUseRanteskillnad(e.target.checked)}
            />
            Jag har ett bundet lan som loses i forskott
          </label>
          {useRanteskillnad && (
            <>
              <NumberInput
                label="Aterstaende skuld"
                value={remainingPrincipal}
                onChange={setRemainingPrincipal}
              />
              <NumberInput
                label="Min bundna ranta"
                value={currentRate}
                suffix="%"
                onChange={setCurrentRate}
              />
              <NumberInput
                label="Referensranta (bankens jamforelseranta)"
                value={referenceRate}
                suffix="%"
                onChange={setReferenceRate}
              />
              <NumberInput
                label="Aterstaende bindningstid"
                value={remainingYears}
                suffix="ar"
                onChange={setRemainingYears}
              />
              <p className="text-xs text-slate-500">
                Forenklad FI-formel utan diskontering. Riktar sig som
                indikation - begar exakt besked fran banken.
              </p>
            </>
          )}
        </Section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Resultat</h2>

          <div className="mt-4">
            <ResultRow label="Bolan" value={loanPayoff} />
            <ResultRow label="Forsaljningspris" value={salePrice} />
            <ResultRow label="Inkopspris" value={purchasePrice} />
            <ResultRow
              label="Renoveringskostnader"
              value={saleResult.deductibleImprovements}
            />
            <ResultRow
              label="Forsaljningskostnader"
              value={saleResult.totalSellingCosts}
            />
            <ResultRow label="Pantbrev / lagfart" value={originationCosts} />
          </div>

          <div className="mt-4 border-t-2 border-slate-300 pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold uppercase tracking-wide text-slate-900">
                Vinst
              </span>
              <span
                className={`text-lg font-semibold ${
                  saleResult.gain >= 0 ? "text-slate-900" : "text-rose-700"
                }`}
              >
                {formatKr(saleResult.gain)}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <ResultRow
              label="Vinstskatt att betala (22 %)"
              value={saleResult.capitalGainsTax}
              tone="negative"
            />
          </div>

          <div className="mt-4 space-y-2 rounded-md bg-amber-100 p-3 ring-1 ring-amber-200">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-900">
                Kvar i planboken
              </span>
              <span
                className={`text-lg font-bold ${
                  saleResult.kvarIPlanboken >= 0
                    ? "text-slate-900"
                    : "text-rose-700"
                }`}
              >
                {formatKr(saleResult.kvarIPlanboken)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm italic text-slate-900">
                Kvar vid uppskov
              </span>
              <span
                className={`text-base italic ${
                  saleResult.kvarVidUppskov >= 0
                    ? "text-slate-900"
                    : "text-rose-700"
                }`}
              >
                {formatKr(saleResult.kvarVidUppskov)}
              </span>
            </div>
          </div>
        </div>

        {useUppskov && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Uppskov</h3>
            <div className="mt-2">
              <ResultRow
                label="Uppskovsbelopp"
                value={uppskovResult.uppskovAmount}
              />
              <ResultRow
                label="Skatt att betala nu"
                value={uppskovResult.remainingTax}
                tone="negative"
              />
            </div>
          </div>
        )}

        {useRanteskillnad && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Ranteskillnad
            </h3>
            <div className="mt-2">
              <ResultRow
                label="Uppskattad ersattning"
                value={ranteskillnadResult.compensation}
                tone="negative"
              />
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function updateRow<T extends { id: number }>(
  setRows: React.Dispatch<React.SetStateAction<T[]>>,
  id: number,
  patch: Partial<T>,
) {
  setRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
}
