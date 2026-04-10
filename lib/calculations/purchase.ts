import {
  FI_AMORT_HIGH_LTV,
  FI_AMORT_LOW_LTV,
  FI_AMORT_MID_LTV,
  FI_DTI_EXTRA,
  FI_DTI_THRESHOLD,
  FI_LTV_CAP,
  FI_LTV_HIGH_THRESHOLD,
  FI_LTV_MID_THRESHOLD,
  KONSUMENTVERKET_2025,
} from "./constants";
import type { Household, PurchaseInput, PurchaseResult } from "./types";

export function calculateLoan(propertyPrice: number, ownCapital: number): {
  loan: number;
  downPayment: number;
  ltv: number;
} {
  const maxLoanByCap = propertyPrice * FI_LTV_CAP;
  const requested = propertyPrice - ownCapital;
  const loan = Math.max(0, Math.min(requested, maxLoanByCap));
  const downPayment = propertyPrice - loan;
  const ltv = propertyPrice > 0 ? loan / propertyPrice : 0;
  return { loan, downPayment, ltv };
}

export function calculateAmortization(
  loan: number,
  propertyValue: number,
  grossAnnualIncome: number,
): { ratePerYear: number; monthly: number; debtToIncome: number } {
  const ltv = propertyValue > 0 ? loan / propertyValue : 0;
  let rate: number;
  if (ltv > FI_LTV_HIGH_THRESHOLD) rate = FI_AMORT_HIGH_LTV;
  else if (ltv > FI_LTV_MID_THRESHOLD) rate = FI_AMORT_MID_LTV;
  else rate = FI_AMORT_LOW_LTV;

  const debtToIncome =
    grossAnnualIncome > 0 ? loan / grossAnnualIncome : 0;
  if (debtToIncome > FI_DTI_THRESHOLD) rate += FI_DTI_EXTRA;

  const monthly = (loan * rate) / 12;
  return { ratePerYear: rate, monthly, debtToIncome };
}

export function calculateLivingCostSchablon(household: Household): number {
  const adults =
    household.adults === 2
      ? KONSUMENTVERKET_2025.couple
      : KONSUMENTVERKET_2025.singleAdult;
  const children = household.children.reduce(
    (sum, group) => sum + KONSUMENTVERKET_2025[group],
    0,
  );
  return adults + children;
}

export function calculateKalp(input: PurchaseInput): PurchaseResult {
  const { loan, downPayment, ltv } = calculateLoan(
    input.propertyPrice,
    input.ownCapital,
  );
  const { ratePerYear, monthly: amortizationMonthly, debtToIncome } =
    calculateAmortization(
      loan,
      input.propertyPrice,
      input.grossAnnualIncomeHousehold,
    );
  const stressedInterestMonthly = (loan * input.stressRate) / 12;
  const actualInterestMonthly = (loan * input.interestRate) / 12;
  const livingCostSchablon = calculateLivingCostSchablon(input.household);
  const kalp =
    input.netMonthlyIncomeHousehold -
    stressedInterestMonthly -
    amortizationMonthly -
    input.operatingCostMonthly -
    livingCostSchablon;
  return {
    downPayment,
    loan,
    ltv,
    amortizationRate: ratePerYear,
    amortizationMonthly,
    stressedInterestMonthly,
    actualInterestMonthly,
    livingCostSchablon,
    operatingCostMonthly: input.operatingCostMonthly,
    kalp,
    approved: kalp >= 0,
    debtToIncome,
  };
}
