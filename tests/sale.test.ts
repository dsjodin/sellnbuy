import { describe, expect, it } from "vitest";
import {
  auditImprovements,
  calculateDeductibleImprovements,
  calculateRanteskillnad,
  calculateSale,
  calculateUppskov,
} from "@/lib/calculations";

describe("calculateSale", () => {
  it("raknar ut vinstskatt pa grundfall", () => {
    const result = calculateSale({
      salePrice: 3_500_000,
      purchasePrice: 2_000_000,
      brokerFee: 80_000,
      sellingCosts: 0,
      originationCosts: 0,
      improvements: [],
      currentYear: 2025,
      loanPayoff: 0,
    });
    expect(result.gain).toBe(1_420_000);
    expect(result.taxableGain).toBe(1_420_000);
    expect(result.capitalGainsTax).toBe(312_400);
    expect(result.kvarIPlanboken).toBe(3_500_000 - 80_000 - 312_400);
  });

  it("ger 0 kr i skatt vid negativ vinst", () => {
    const result = calculateSale({
      salePrice: 2_000_000,
      purchasePrice: 2_500_000,
      brokerFee: 50_000,
      sellingCosts: 0,
      originationCosts: 0,
      improvements: [],
      currentYear: 2025,
      loanPayoff: 0,
    });
    expect(result.gain).toBeLessThan(0);
    expect(result.taxableGain).toBe(0);
    expect(result.capitalGainsTax).toBe(0);
  });

  it("drar loseskuld fran kvar-i-planboken", () => {
    const result = calculateSale({
      salePrice: 3_000_000,
      purchasePrice: 2_000_000,
      brokerFee: 60_000,
      sellingCosts: 0,
      originationCosts: 0,
      improvements: [],
      currentYear: 2025,
      loanPayoff: 1_500_000,
    });
    expect(result.kvarIPlanboken).toBe(
      3_000_000 - 60_000 - result.capitalGainsTax - 1_500_000,
    );
  });

  it("matchar anvandarens referensuppstallning med pantbrev och uppskov", () => {
    const result = calculateSale({
      salePrice: 3_500_000,
      purchasePrice: 1_850_000,
      brokerFee: 80_000,
      sellingCosts: 60_000,
      originationCosts: 58_000,
      improvements: [
        { year: 2020, amount: 980_000, kind: "base" },
      ],
      currentYear: 2026,
      loanPayoff: 1_890_000,
    });
    expect(result.totalSellingCosts).toBe(140_000);
    expect(result.deductibleImprovements).toBe(980_000);
    expect(result.gain).toBe(472_000);
    expect(result.capitalGainsTax).toBe(103_840);
    expect(result.kvarIPlanboken).toBe(1_366_160);
    expect(result.kvarVidUppskov).toBe(1_470_000);
  });
});

describe("calculateDeductibleImprovements", () => {
  it("exkluderar ar med mindre an 5000 kr total", () => {
    const deductible = calculateDeductibleImprovements(
      [
        { year: 2022, amount: 4_000, kind: "base" },
        { year: 2023, amount: 6_000, kind: "base" },
      ],
      2025,
    );
    expect(deductible).toBe(6_000);
  });

  it("summerar poster inom samma ar mot troskeln", () => {
    const deductible = calculateDeductibleImprovements(
      [
        { year: 2023, amount: 3_000, kind: "base" },
        { year: 2023, amount: 4_000, kind: "base" },
      ],
      2025,
    );
    expect(deductible).toBe(7_000);
  });

  it("exkluderar reparationsforbattringar aldre an 5 ar", () => {
    const deductible = calculateDeductibleImprovements(
      [
        { year: 2019, amount: 20_000, kind: "repair" },
        { year: 2020, amount: 10_000, kind: "repair" },
      ],
      2025,
    );
    expect(deductible).toBe(10_000);
  });

  it("inkluderar grundforbattringar oavsett alder", () => {
    const deductible = calculateDeductibleImprovements(
      [{ year: 2005, amount: 50_000, kind: "base" }],
      2025,
    );
    expect(deductible).toBe(50_000);
  });
});

describe("calculateUppskov", () => {
  it("tillater fullt uppskov nar ersattningen ar minst lika dyr", () => {
    const result = calculateUppskov({
      taxableGain: 500_000,
      originalPrice: 3_000_000,
      replacementPrice: 3_500_000,
    });
    expect(result.uppskovAmount).toBe(500_000);
    expect(result.remainingTax).toBe(0);
  });

  it("proportionerar uppskovet vid billigare ersattning", () => {
    const result = calculateUppskov({
      taxableGain: 500_000,
      originalPrice: 4_000_000,
      replacementPrice: 2_000_000,
    });
    expect(result.uppskovAmount).toBe(250_000);
    // Kvar taxableGain = 250 000, skatt = 55 000
    expect(result.remainingTax).toBe(55_000);
  });

  it("ger noll uppskov om ingen skattepliktig vinst finns", () => {
    const result = calculateUppskov({
      taxableGain: 0,
      originalPrice: 2_000_000,
      replacementPrice: 2_500_000,
    });
    expect(result.uppskovAmount).toBe(0);
    expect(result.remainingTax).toBe(0);
  });
});

describe("calculateRanteskillnad", () => {
  it("raknar forenklad ersattning", () => {
    const result = calculateRanteskillnad({
      remainingPrincipal: 2_000_000,
      currentRate: 0.04,
      referenceRate: 0.02,
      remainingYears: 3,
    });
    // (0.04 - (0.02 + 0.01)) * 2 000 000 * 3 = 60 000
    expect(result.compensation).toBe(60_000);
  });

  it("ger 0 nar aktuell ranta ar lagre an referens", () => {
    const result = calculateRanteskillnad({
      remainingPrincipal: 1_000_000,
      currentRate: 0.02,
      referenceRate: 0.04,
      remainingYears: 3,
    });
    expect(result.compensation).toBe(0);
  });
});

describe("auditImprovements", () => {
  it("flaggar reparation aldre an 5 ar som exkluderad", () => {
    const audits = auditImprovements(
      [
        {
          year: 2018,
          amount: 50_000,
          kind: "repair",
          description: "Ommalning",
          hasReceipt: true,
        },
      ],
      2025,
    );
    expect(audits[0].included).toBe(false);
    expect(audits[0].issues).toContain("repair_too_old");
  });

  it("flaggar arssumma under 5 000 kr som exkluderad", () => {
    const audits = auditImprovements(
      [
        {
          year: 2024,
          amount: 2_000,
          kind: "base",
          description: "Liten justering",
          hasReceipt: true,
        },
        {
          year: 2024,
          amount: 2_500,
          kind: "base",
          description: "Annan justering",
          hasReceipt: true,
        },
      ],
      2025,
    );
    expect(audits[0].included).toBe(false);
    expect(audits[1].included).toBe(false);
    expect(audits[0].issues).toContain("below_threshold");
    expect(audits[1].issues).toContain("below_threshold");
    expect(audits[0].yearTotal).toBe(4_500);
  });

  it("markerar saknad beskrivning som mjuk varning", () => {
    const audits = auditImprovements(
      [
        {
          year: 2024,
          amount: 80_000,
          kind: "base",
          hasReceipt: true,
        },
      ],
      2025,
    );
    expect(audits[0].included).toBe(true);
    expect(audits[0].issues).toContain("no_description");
  });

  it("markerar saknat kvitto som mjuk varning", () => {
    const audits = auditImprovements(
      [
        {
          year: 2024,
          amount: 80_000,
          kind: "base",
          description: "Nytt kok",
          hasReceipt: false,
        },
      ],
      2025,
    );
    expect(audits[0].included).toBe(true);
    expect(audits[0].issues).toContain("no_receipt");
  });

  it("inkluderar grundforbattring aldre an 5 ar utan issue", () => {
    const audits = auditImprovements(
      [
        {
          year: 2005,
          amount: 200_000,
          kind: "base",
          description: "Tillbyggnad",
          hasReceipt: true,
        },
      ],
      2025,
    );
    expect(audits[0].included).toBe(true);
    expect(audits[0].issues).toEqual([]);
  });
});
