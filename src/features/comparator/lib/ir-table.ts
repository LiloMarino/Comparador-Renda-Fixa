export function getIrRate(calendarDays: number): number {
  if (calendarDays <= 180) return 22.5;
  if (calendarDays <= 360) return 20.0;
  if (calendarDays <= 720) return 17.5;
  return 15.0;
}
