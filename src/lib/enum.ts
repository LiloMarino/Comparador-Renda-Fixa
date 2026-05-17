export const INVESTMENT_TYPES = ["CDB", "LCI", "LCA"] as const;
export type InvestmentType = (typeof INVESTMENT_TYPES)[number];

export const YIELD_TYPES = ["pre", "pos"] as const;
export type YieldType = (typeof YIELD_TYPES)[number];

export const REDEMPTION_INPUT_MODES = ["date", "term"] as const;
export type RedemptionInputMode = (typeof REDEMPTION_INPUT_MODES)[number];
