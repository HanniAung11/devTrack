export function attendanceColorClass(pct: number | null | undefined): string {
  if (pct == null) return "text-zinc-500";
  if (pct >= 75) return "text-emerald-600 font-medium";
  if (pct >= 50) return "text-amber-600 font-medium";
  return "text-red-600 font-medium";
}
