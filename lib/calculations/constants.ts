// Referensvarden 2026. Kontrollera mot Skatteverket, FI och Konsumentverket
// fore viktiga beslut. Amorteringsreglerna nedan speglar reformen som
// tradde i kraft 1 april 2026: bolanetaket hojt till 90 % och det
// skarpta amorteringskravet (skuldkvot > 4,5x) slopat.

export const CAPITAL_GAIN_TAX_RATE = 0.22; // 22/30 av 30 % kapitalskatt
export const IMPROVEMENT_MIN_THRESHOLD_SEK = 5000; // per kalenderar och fastighet
export const REPAIR_LOOKBACK_YEARS = 5;

export const FI_LTV_CAP = 0.9;
export const FI_AMORT_HIGH_LTV = 0.02; // LTV > 70 %
export const FI_AMORT_MID_LTV = 0.01; // LTV 50-70 %
export const FI_AMORT_LOW_LTV = 0.0; // LTV <= 50 %
export const FI_LTV_HIGH_THRESHOLD = 0.7;
export const FI_LTV_MID_THRESHOLD = 0.5;

// Skuldkvot behalls som referens for visning. Extra amortering
// kopplad till skuldkvot > 4,5x avskaffades 1 april 2026.
export const FI_DTI_THRESHOLD = 4.5;

export const STRESS_INTEREST_DEFAULT = 0.07;

// Ungefarliga schablonbelopp per manad. Disclaimer visas i UI.
export const KONSUMENTVERKET_2025 = {
  singleAdult: 9500,
  couple: 15900,
  child0_3: 2700,
  child4_6: 3100,
  child7_10: 3800,
  child11_14: 4400,
  child15_18: 5000,
} as const;

export type ChildAgeGroup = keyof Omit<
  typeof KONSUMENTVERKET_2025,
  "singleAdult" | "couple"
>;
