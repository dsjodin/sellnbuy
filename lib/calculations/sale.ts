import {
  CAPITAL_GAIN_TAX_RATE,
  IMPROVEMENT_MIN_THRESHOLD_SEK,
  REPAIR_LOOKBACK_YEARS,
} from "./constants";
import type {
  ImprovementEntry,
  RanteskillnadInput,
  RanteskillnadResult,
  SaleInput,
  SaleResult,
  UppskovInput,
  UppskovResult,
} from "./types";

// 5000 kr/ar-regeln tillampas per kalenderar och fastighet: alla
// forbattringsposter fran samma ar summeras, och hela arets belopp
// tas med endast om summan overstiger 5000 kr. Reparationsforbattringar
// maste dessutom ligga inom de senaste 5 aren.
export function calculateDeductibleImprovements(
  entries: ImprovementEntry[],
  currentYear: number,
): number {
  const byYear = new Map<number, number>();
  for (const entry of entries) {
    if (entry.amount <= 0) continue;
    if (entry.kind === "repair") {
      if (currentYear - entry.year > REPAIR_LOOKBACK_YEARS) continue;
    }
    byYear.set(entry.year, (byYear.get(entry.year) ?? 0) + entry.amount);
  }
  let total = 0;
  for (const sum of byYear.values()) {
    if (sum > IMPROVEMENT_MIN_THRESHOLD_SEK) total += sum;
  }
  return total;
}

export function calculateSale(input: SaleInput): SaleResult {
  const deductibleImprovements = calculateDeductibleImprovements(
    input.improvements,
    input.currentYear,
  );
  const totalSellingCosts = input.brokerFee + input.sellingCosts;
  const gain =
    input.salePrice -
    totalSellingCosts -
    input.purchasePrice -
    deductibleImprovements -
    input.originationCosts;
  const taxableGain = Math.max(0, gain);
  const capitalGainsTax = Math.floor(taxableGain * CAPITAL_GAIN_TAX_RATE);
  const kvarIPlanboken =
    input.salePrice - totalSellingCosts - capitalGainsTax - input.loanPayoff;
  const kvarVidUppskov =
    input.salePrice - totalSellingCosts - input.loanPayoff;
  return {
    deductibleImprovements,
    totalSellingCosts,
    gain,
    taxableGain,
    capitalGainsTax,
    kvarIPlanboken,
    kvarVidUppskov,
  };
}

// Uppskovsbelopp vid kop av ersattningsbostad. Om ersattningen ar minst
// lika dyr som den salda bostaden kan hela vinsten skjutas upp. Ar
// ersattningen billigare minskas uppskovet proportionellt.
// Schablonintakten pa uppskov avskaffades 1 jan 2021, sa ingen arlig
// kostnad beraknas har.
export function calculateUppskov(input: UppskovInput): UppskovResult {
  if (input.taxableGain <= 0) {
    return { uppskovAmount: 0, remainingTax: 0 };
  }
  let uppskovAmount: number;
  if (input.replacementPrice >= input.originalPrice) {
    uppskovAmount = input.taxableGain;
  } else {
    const ratio = input.replacementPrice / input.originalPrice;
    uppskovAmount = Math.max(0, input.taxableGain * ratio);
  }
  const remainingTaxableGain = input.taxableGain - uppskovAmount;
  const remainingTax = Math.floor(remainingTaxableGain * CAPITAL_GAIN_TAX_RATE);
  return { uppskovAmount: Math.floor(uppskovAmount), remainingTax };
}

// Forenklad ranteskillnadsersattning enligt FI:s princip.
// Diskontering ar inte medraknad, vilket overvardera kompensationen nagot
// for bundna lan med lang aterstaende loptid. Anvands bara som indikation.
export function calculateRanteskillnad(
  input: RanteskillnadInput,
): RanteskillnadResult {
  const spread = input.currentRate - (input.referenceRate + 0.01);
  const compensation = Math.max(
    0,
    spread * input.remainingPrincipal * input.remainingYears,
  );
  return { compensation: Math.floor(compensation) };
}
