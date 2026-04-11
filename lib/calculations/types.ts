import type { ChildAgeGroup } from "./constants";

export type ImprovementKind = "base" | "repair";

export type ImprovementCategoryId =
  | "extension"
  | "pool"
  | "standard_kitchen"
  | "standard_bath"
  | "standard_other"
  | "paint"
  | "floor"
  | "kitchen_repair"
  | "bath_repair"
  | "windows"
  | "facade"
  | "repair_other";

export interface ImprovementEntry {
  year: number;
  amount: number;
  kind: ImprovementKind;
  category?: ImprovementCategoryId;
  description?: string;
  hasReceipt?: boolean;
}

export type ImprovementIssue =
  | "repair_too_old"
  | "below_threshold"
  | "no_description"
  | "no_receipt";

export interface ImprovementRowAudit {
  issues: ImprovementIssue[];
  included: boolean;
  yearTotal: number;
}

export interface SaleInput {
  salePrice: number;
  purchasePrice: number;
  brokerFee: number;
  sellingCosts: number;
  originationCosts: number;
  improvements: ImprovementEntry[];
  currentYear: number;
  loanPayoff: number;
}

export interface SaleResult {
  deductibleImprovements: number;
  totalSellingCosts: number;
  gain: number;
  taxableGain: number;
  capitalGainsTax: number;
  kvarIPlanboken: number;
  kvarVidUppskov: number;
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
