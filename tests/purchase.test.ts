import { describe, expect, it } from "vitest";
import {
  calculateAmortization,
  calculateKalp,
  calculateLivingCostSchablon,
  calculateLoan,
} from "@/lib/calculations";

describe("calculateLoan", () => {
  it("begransar lanet till 90 procent LTV-tak", () => {
    const result = calculateLoan(4_000_000, 200_000);
    expect(result.loan).toBe(3_600_000);
    expect(result.downPayment).toBe(400_000);
    expect(result.ltv).toBeCloseTo(0.9);
  });

  it("anvander forfragat lan nar kontantinsatsen ar stor nog", () => {
    const result = calculateLoan(4_000_000, 1_600_000);
    expect(result.loan).toBe(2_400_000);
    expect(result.ltv).toBeCloseTo(0.6);
  });
});

describe("calculateAmortization", () => {
  it("ger bara 2 procent vid LTV 85 aven med hog skuldkvot (nya regler)", () => {
    const result = calculateAmortization(3_400_000, 4_000_000, 600_000);
    expect(result.ratePerYear).toBeCloseTo(0.02);
    expect(result.monthly).toBeCloseTo(3_400_000 * 0.02 / 12);
    expect(result.debtToIncome).toBeCloseTo(3_400_000 / 600_000);
  });

  it("ger 1 procent vid LTV 60 och laga skuldkvot", () => {
    const result = calculateAmortization(2_400_000, 4_000_000, 800_000);
    expect(result.ratePerYear).toBeCloseTo(0.01);
    expect(result.monthly).toBeCloseTo(2_000);
  });

  it("ger 0 procent vid LTV under 50", () => {
    const result = calculateAmortization(1_800_000, 4_000_000, 450_000);
    expect(result.ratePerYear).toBe(0);
    expect(result.monthly).toBe(0);
  });
});

describe("calculateLivingCostSchablon", () => {
  it("summerar par plus ett barn", () => {
    const total = calculateLivingCostSchablon({
      adults: 2,
      children: ["child4_6"],
    });
    expect(total).toBe(15_900 + 3_100);
  });

  it("anvander singel nar ensam vuxen", () => {
    const total = calculateLivingCostSchablon({
      adults: 1,
      children: [],
    });
    expect(total).toBe(9_500);
  });
});

describe("calculateKalp", () => {
  it("underkanner hushall med negativ kalp", () => {
    const result = calculateKalp({
      propertyPrice: 4_000_000,
      ownCapital: 600_000,
      grossAnnualIncomeHousehold: 600_000,
      netMonthlyIncomeHousehold: 45_000,
      interestRate: 0.04,
      stressRate: 0.07,
      operatingCostMonthly: 4_500,
      household: { adults: 2, children: ["child4_6"] },
    });
    expect(result.loan).toBe(3_400_000);
    expect(result.amortizationRate).toBeCloseTo(0.02);
    // 3 400 000 * 0.02 / 12 = 5 666.67
    expect(result.amortizationMonthly).toBeCloseTo(5_666.67, 1);
    expect(result.stressedInterestMonthly).toBeCloseTo(19_833.33, 1);
    expect(result.livingCostSchablon).toBe(19_000);
    // 45 000 - 19 833.33 - 5 666.67 - 4 500 - 19 000 = -4 000
    expect(result.kalp).toBeCloseTo(-4_000, 1);
    expect(result.approved).toBe(false);
  });

  it("godkanner hushall med positiv kalp", () => {
    const result = calculateKalp({
      propertyPrice: 3_000_000,
      ownCapital: 1_200_000,
      grossAnnualIncomeHousehold: 900_000,
      netMonthlyIncomeHousehold: 60_000,
      interestRate: 0.04,
      stressRate: 0.07,
      operatingCostMonthly: 3_500,
      household: { adults: 2, children: [] },
    });
    expect(result.loan).toBe(1_800_000);
    expect(result.amortizationRate).toBeCloseTo(0.01);
    expect(result.approved).toBe(true);
    expect(result.kalp).toBeGreaterThan(0);
  });
});
