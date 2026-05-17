import { differenceInBusinessDays, differenceInCalendarDays } from "date-fns";
import {
  isTaxExempt,
  type Asset,
} from "@/features/comparator/schemas/asset-schema";
import { getIrRate } from "@/features/comparator/lib/ir-table";

export type ComputedAsset = {
  calendarDays: number;
  businessDays: number;
  annualRate: number;
  grossAmount: number;
  grossYield: number;
  grossTotalRate: number;
  irRate: number;
  irAmount: number;
  netAmount: number;
  netYield: number;
  netDailyRate: number;
  netMonthlyRate: number;
  netYearlyRate: number;
  netTotalRate: number;
  cdiEquivPercent: number;
};

export function computeAssetValueAt(
  asset: Asset,
  cdi: number,
  asOfDate: Date,
  mode: "gross" | "net",
): number {
  const principal = asset.amountCents / 100;

  const clamped =
    asOfDate < asset.applicationDate
      ? asset.applicationDate
      : asOfDate > asset.redemptionDate
        ? asset.redemptionDate
        : asOfDate;

  const calendarDays = Math.max(
    0,
    differenceInCalendarDays(clamped, asset.applicationDate),
  );
  const businessDays = Math.max(
    0,
    differenceInBusinessDays(clamped, asset.applicationDate),
  );

  const annualRate =
    asset.yieldType === "pre"
      ? asset.preRate / 100
      : (cdi / 100) * (asset.cdiPercent / 100);

  const grossAmount = principal * Math.pow(1 + annualRate, businessDays / 252);

  if (mode === "gross") return grossAmount;

  const grossYield = grossAmount - principal;
  const irRate = isTaxExempt(asset.investmentType)
    ? 0
    : getIrRate(calendarDays);
  const irAmount = grossYield * (irRate / 100);
  return grossAmount - irAmount;
}

export function computeAsset(asset: Asset, cdi: number): ComputedAsset {
  const principal = asset.amountCents / 100;

  const calendarDays = Math.max(
    0,
    differenceInCalendarDays(asset.redemptionDate, asset.applicationDate),
  );
  const businessDays = Math.max(
    0,
    differenceInBusinessDays(asset.redemptionDate, asset.applicationDate),
  );

  const annualRate =
    asset.yieldType === "pre"
      ? asset.preRate / 100
      : (cdi / 100) * (asset.cdiPercent / 100);

  const safeBusinessDays = businessDays > 0 ? businessDays : 1;
  const grossFactor = Math.pow(1 + annualRate, safeBusinessDays / 252);
  const grossAmount = principal * grossFactor;
  const grossYield = grossAmount - principal;
  const grossTotalRate = grossFactor - 1;

  const irRate = isTaxExempt(asset.investmentType)
    ? 0
    : getIrRate(calendarDays);
  const irAmount = grossYield * (irRate / 100);
  const netAmount = grossAmount - irAmount;
  const netYield = netAmount - principal;

  const netFactor = netAmount / principal;
  const netDailyRate =
    netFactor > 0 ? Math.pow(netFactor, 1 / safeBusinessDays) - 1 : 0;
  const netMonthlyRate = Math.pow(1 + netDailyRate, 21) - 1;
  const netYearlyRate = Math.pow(1 + netDailyRate, 252) - 1;
  const netTotalRate = netFactor - 1;

  const cdiEquivPercent = cdi > 0 ? (netYearlyRate / (cdi / 100)) * 100 : 0;

  return {
    calendarDays,
    businessDays,
    annualRate,
    grossAmount,
    grossYield,
    grossTotalRate,
    irRate,
    irAmount,
    netAmount,
    netYield,
    netDailyRate,
    netMonthlyRate,
    netYearlyRate,
    netTotalRate,
    cdiEquivPercent,
  };
}
