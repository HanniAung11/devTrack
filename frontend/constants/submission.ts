export const SUBMISSION_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
} as const;

export type SubmissionStatus =
  (typeof SUBMISSION_STATUS)[keyof typeof SUBMISSION_STATUS];

export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  PENDING: "Pending review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

export const SUBMISSION_STATUS_BADGE: Record<SubmissionStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  REJECTED: "border-red-200 bg-red-50 text-red-800",
};
