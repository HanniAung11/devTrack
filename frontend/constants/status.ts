export const BATCH_STATUS = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  UPCOMING: "UPCOMING",
} as const;

export const SESSION_TYPES = {
  CLASS: "CLASS",
  ASSIGNMENT: "ASSIGNMENT",
  EXAM: "EXAM",
  HOLIDAY: "HOLIDAY",
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LEAVE: "LEAVE",
} as const;

export const ROLE = {
  ADMIN: "ADMIN",
  DEVELOPER: "DEVELOPER",
} as const;

export const STATUS_BADGE_CLASS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-zinc-200 text-zinc-700",
  UPCOMING: "bg-sky-100 text-sky-800",
};
