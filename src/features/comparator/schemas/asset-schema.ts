import { z } from "zod";
import { INVESTMENT_TYPES, type InvestmentType, type YieldType } from "@/lib/enum";

const baseAsset = z.object({
  investmentType: z.enum(INVESTMENT_TYPES),
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
