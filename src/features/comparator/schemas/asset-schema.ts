import { z } from "zod";

export const investmentTypeSchema = z.enum(["CDB", "LCI", "LCA"]);
export type InvestmentType = z.infer<typeof investmentTypeSchema>;

export const yieldTypeSchema = z.enum(["pre", "pos"]);
export type YieldType = z.infer<typeof yieldTypeSchema>;

const baseAsset = z.object({
  investmentType: investmentTypeSchema,
  amountCents: z.number().int().positive(),
  applicationDate: z.coerce.date(),
  redemptionDate: z.coerce.date(),
});

const preAsset = baseAsset.extend({
  yieldType: z.literal("pre"),
  preRate: z.number().positive(),
});

const posAsset = baseAsset.extend({
  yieldType: z.literal("pos"),
  cdiPercent: z.number().positive(),
});

export const assetSchema = z.discriminatedUnion("yieldType", [
  preAsset,
  posAsset,
]);
export type Asset = z.infer<typeof assetSchema>;
export type AssetWithId = Asset & { id: string };

export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  CDB: "CDB",
  LCI: "LCI",
  LCA: "LCA",
};

export const YIELD_TYPE_LABELS: Record<YieldType, string> = {
  pre: "Pré-fixado",
  pos: "Pós-fixado",
};

export function isTaxExempt(investmentType: InvestmentType): boolean {
  return investmentType === "LCI" || investmentType === "LCA";
}
