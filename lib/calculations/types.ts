import type { ChildAgeGroup } from "./constants";

export type ImprovementKind = "base" | "repair";

export interface ImprovementEntry {
  year: number;
  amount: number;
  kind: ImprovementKind;
  label?: string;
}

export interface SaleInput {
  salePrice: number;
  purchasePrice: number;
  brokerFee: number;
  sellingCosts: number;
  improvements: ImprovementEntry[];
  currentYear: number;
  loanPayoff: number;
}

export interface SaleResult {
  deductibleImprovements: number;
  gain: number;
  taxableGain: number;
  capitalGainsTax: number;
  netProceeds: number;
}

export interface UppskovInput {
  taxableGain: number;
  originalPrice: number;
  replacementPrice: number;
}

export interface UppskovResult {
  uppskovAmount: number;
  remainingTax: number;
}

export interface RanteskillnadInput {
  remainingPrincipal: number;
  currentRate: number;
  referenceRate: number;
  remainingYears: number;
}

export interface RanteskillnadResult {
  compensation: number;
}

export interface Household {
  adults: 1 | 2;
  children: ChildAgeGroup[];
}

export interface PurchaseInput {
  propertyPrice: number;
  ownCapital: number;
  grossAnnualIncomeHousehold: number;
  netMonthlyIncomeHousehold: number;
  interestRate: number;
  stressRate: number;
  operatingCostMonthly: number;
  household: Household;
}

export interface PurchaseResult {
  downPayment: number;
  loan: number;
  ltv: number;
  amortizationRate: number;
  amortizationMonthly: number;
  stressedInterestMonthly: number;
  actualInterestMonthly: number;
  livingCostSchablon: number;
  operatingCostMonthly: number;
  kalp: number;
  approved: boolean;
  debtToIncome: number;
}
