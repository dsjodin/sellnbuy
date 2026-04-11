"use client";

import { useMemo, useState } from "react";
import { NumberInput } from "@/components/NumberInput";
import { ResultRow } from "@/components/ResultRow";
import { Section } from "@/components/Section";
import { TextInput } from "@/components/TextInput";
import { formatKr } from "@/lib/format";
import {
  auditImprovements,
  calculateRanteskillnad,
  calculateSale,
  calculateUppskov,
  IMPROVEMENT_CATEGORIES,
} from "@/lib/calculations";
import type {
  ImprovementCategoryId,
  ImprovementEntry,
  ImprovementIssue,
  ImprovementKind,
} from "@/lib/calculations";

interface ImprovementRow {
  id: number;
  year: number;
  amount: number;
  category: ImprovementCategoryId;
  description: string;
  hasReceipt: boolean;
}

const CATEGORY_BY_ID = new Map(
  IMPROVEMENT_CATEGORIES.map((c) => [c.id, c] as const),
);

function kindForCategory(id: ImprovementCategoryId): ImprovementKind {
  return CATEGORY_BY_ID.get(id)?.kind ?? "base";
}

const ISSUE_LABELS: Record<
  ImprovementIssue,
  { text: string; tone: "hard" | "soft" }
> = {
  repair_too_old: {
    text: "Reparation aldre an 5 ar - raknas inte med",
    tone: "hard",
  },
  below_threshold: {
    text: "Arssumma under 5 000 kr - raknas inte med",
    tone: "hard",
  },
  no_description: {
    text: "Lagg till en kort beskrivning",
    tone: "soft",
  },
  no_receipt: {
    text: "Bocka i kvitto for att vara trygg vid en revision",
    tone: "soft",
  },
};

export default function SaljaPage() {
  const currentYear = new Date().getFullYear();

  const [salePrice, setSalePrice] = useState(3_500_000);
  const [purchasePrice, setPurchasePrice] = useState(1_850_000);
  const [brokerFee, setBrokerFee] = useState(80_000);
  const [sellingCosts, setSellingCosts] = useState(60_000);
  const [originationCosts, setOriginationCosts] = useState(58_000);
  const [loanPayoff, setLoanPayoff] = useState(1_890_000);

  const [improvements, setImprovements] = useState<ImprovementRow[]>([
    {
      id: 1,
      year: currentYear - 4,
      amount: 980_000,
      category: "standard_kitchen",
      description: "Nytt kok",
      hasReceipt: true,
    },
  ]);

  const [useUppskov, setUseUppskov] = useState(false);
  const [replacementPrice, setReplacementPrice] = useState(4_000_000);

  const [useRanteskillnad, setUseRanteskillnad] = useState(false);
  const [remainingPrincipal, setRemainingPrincipal] = useState(1_500_000);
  const [currentRate, setCurrentRate] = useState(0.04);
  const [referenceRate, setReferenceRate] = useState(0.02);
  const [remainingYears, setRemainingYears] = useState(3);

  const improvementEntries = useMemo<ImprovementEntry[]>(
    () =>
      improvements.map((row) => ({
        year: row.year,
        amount: row.amount,
        kind: kindForCategory(row.category),
        category: row.category,
        description: row.description,
        hasReceipt: row.hasReceipt,
      })),
    [improvements],
  );

  const saleResult = useMemo(
    () =>
      calculateSale({
        salePrice,
        purchasePrice,
        brokerFee,
        sellingCosts,
        originationCosts,
        improvements: improvementEntries,
        currentYear,
        loanPayoff,
      }),
    [
      salePrice,
      purchasePrice,
      brokerFee,
      sellingCosts,
      originationCosts,
      improvementEntries,
      currentYear,
      loanPayoff,
    ],
  );

  const rowAudits = useMemo(
    () => auditImprovements(improvementEntries, currentYear),
    [improvementEntries, currentYear],
  );

  const includedCount = rowAudits.filter((a) => a.included).length;

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
          description="Grundforbattringar (ny-, till- eller ombyggnad, eller hojning till hogre standard) ar alltid avdragsgilla. Reparationer drar du bara av om bostaden vid forsaljningen ar i battre skick an vid kopet, och arbetet ar utfort de senaste 5 aren. Per kalenderar maste summan overstiga 5 000 kr. Spara alltid kvitton/fakturor - Skatteverket kan begara dem."
        >
          {improvements.map((row, i) => {
            const audit = rowAudits[i];
            const category = CATEGORY_BY_ID.get(row.category);
            return (
              <div
                key={row.id}
                className={`space-y-3 rounded-md border p-3 ${
                  audit && !audit.included
                    ? "border-rose-200 bg-rose-50/40"
                    : "border-slate-200 bg-slate-50/40"
                }`}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_110px_160px_40px]">
                  <label className="block">
                    <span className="block text-sm font-medium text-slate-700">
                      Kategori
                    </span>
                    <select
                      value={row.category}
                      onChange={(e) =>
                        updateRow(setImprovements, row.id, {
                          category: e.target.value as ImprovementCategoryId,
                        })
                      }
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
                    >
                      <optgroup label="Grundforbattring">
                        {IMPROVEMENT_CATEGORIES.filter(
                          (c) => c.kind === "base",
                        ).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Reparation">
                        {IMPROVEMENT_CATEGORIES.filter(
                          (c) => c.kind === "repair",
                        ).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </label>
                  <NumberInput
                    label="Ar"
                    value={row.year}
                    suffix="ar"
                    onChange={(v) =>
                      updateRow(setImprovements, row.id, {
                        year: Math.round(v),
                      })
                    }
                  />
                  <NumberInput
                    label="Belopp"
                    value={row.amount}
                    onChange={(v) =>
                      updateRow(setImprovements, row.id, { amount: v })
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImprovements((rows) =>
                        rows.filter((r) => r.id !== row.id),
                      )
                    }
                    className="self-end rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-500 hover:border-rose-400 hover:text-rose-600"
                    aria-label="Ta bort rad"
                  >
                    x
                  </button>
                </div>

                <TextInput
                  label="Beskrivning"
                  value={row.description}
                  placeholder="t.ex. Nytt kok fran IKEA, installerat Q3"
                  onChange={(v) =>
                    updateRow(setImprovements, row.id, { description: v })
                  }
                />

                <label className="flex items-start gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={row.hasReceipt}
                    onChange={(e) =>
                      updateRow(setImprovements, row.id, {
                        hasReceipt: e.target.checked,
                      })
                    }
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium text-slate-700">
                      Jag har kvitto eller faktura sparade.
                    </span>{" "}
                    {category?.hint}
                  </span>
                </label>

                {audit && audit.issues.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {audit.issues.map((issue) => {
                      const spec = ISSUE_LABELS[issue];
                      const cls =
                        spec.tone === "hard"
                          ? "bg-rose-50 text-rose-800 ring-rose-200"
                          : "bg-amber-50 text-amber-800 ring-amber-200";
                      return (
                        <span
                          key={issue}
                          className={`rounded-full px-2 py-0.5 text-xs ring-1 ${cls}`}
                        >
                          {spec.text}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() =>
              setImprovements((rows) => [
                ...rows,
                {
                  id: Date.now(),
                  year: currentYear,
                  amount: 0,
                  category: "extension",
                  description: "",
                  hasReceipt: false,
                },
              ])
            }
            className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-slate-500"
          >
            Lagg till rad
          </button>
          {improvements.length > 0 && (
            <div className="flex items-baseline justify-between border-t border-slate-200 pt-3 text-sm">
              <span className="text-slate-600">
                {includedCount} av {improvements.length} rader raknas med
              </span>
              <span className="font-semibold text-slate-900">
                {formatKr(saleResult.deductibleImprovements)}
              </span>
            </div>
          )}
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
