export const CDI_SPREAD = 0.10;
export const SELIC_TTL_DAYS = 45;

export function selicToCdi(selic: number): number {
  return Math.max(0, selic - CDI_SPREAD);
}

export function isSelicStale(updatedAt: string): boolean {
  if (!updatedAt) {
    return true;
  }
  const updated = new Date(updatedAt).getTime();
  if (!Number.isFinite(updated)) {
    return true;
  }
  const diffMs = Date.now() - updated;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > SELIC_TTL_DAYS;
}
