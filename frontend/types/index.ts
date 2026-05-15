export type Role = "ADMIN" | "DEVELOPER";

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface DeveloperProfile {
  id: number;
  developer_code: string;
  full_name: string;
  email: string;
  phone: string;
  batch: number | null;
  batch_name: string | null;
  batch_start_date?: string | null;
  batch_end_date?: string | null;
  mentor_name: string | null;
  is_active: boolean;
  joined_at: string;
}

export interface AuthPayload {
  user: User;
  developer: DeveloperProfile | null;
  access: string;
  refresh: string;
}

export interface Mentor {
  id: number;
  email: string;
  username: string;
  display_name: string;
}

export interface Batch {
  id: number;
  batch_name: string;
  mentor: Mentor;
  start_date: string;
  end_date: string;
  duration_months: number;
  training_days: string[];
  attendance_target: number;
  status: string;
  created_at: string;
  total_developers?: number;
  total_sessions?: number;
  completion_percentage?: number;
}

export interface Developer {
  id: number;
  user: number;
  user_email: string;
  developer_code: string;
  full_name: string;
  email: string;
  phone: string;
  batch: number | null;
  batch_id?: number | null;
  batch_detail: {
    id: number;
    batch_name: string;
    status: string;
  } | null;
  is_active: boolean;
  joined_at: string;
  attendance_percentage: number | null;
  submitted_assignments_count: number;
}

export interface Session {
  id: number;
  batch: number;
  batch_detail: { id: number; batch_name: string; status: string };
  session_date: string;
  session_type: string;
  title: string;
  description: string;
  is_completed: boolean;
  created_at: string;
}

export interface Attendance {
  id: number;
  developer: number;
  developer_detail: Pick<
    Developer,
    "id" | "developer_code" | "full_name" | "email"
  >;
  session: number;
  session_detail: Session;
  status: string;
  marked_by: number | null;
  marked_by_detail: { id: number; email: string } | null;
  marked_at: string;
  note: string;
}

export type SubmissionStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface Assignment {
  id: number;
  batch: number;
  batch_detail: Pick<Batch, "id" | "batch_name" | "status" | "start_date" | "end_date">;
  title: string;
  description: string;
  due_date: string;
  created_by: number | null;
  created_by_detail: { id: number; email: string } | null;
  created_at: string;
  submission_count: number;
  is_submitted: boolean;
  can_submit?: boolean;
  submission_status?: SubmissionStatus | null;
  submission_is_late?: boolean | null;
  submission_id?: number | null;
}

export interface Submission {
  id: number;
  assignment: number;
  assignment_title?: string;
  assignment_due_date?: string;
  developer: number;
  developer_code: string;
  developer_name: string;
  github_link: string;
  notes: string;
  status: SubmissionStatus;
  review_note?: string;
  reviewed_at?: string | null;
  submitted_at: string;
  is_late: boolean;
}

export interface ApiError {
  detail?: string | string[];
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AdminDashboardData {
  total_batches: number;
  active_batches: number;
  total_developers: number;
  active_developers: number;
  overall_attendance_rate: number;
  assignments_submitted_rate: number;
  attendance_trend: { date: string; present: number; absent: number }[];
  batch_performance: {
    batch_name: string;
    attendance_rate: number;
    submission_rate: number;
  }[];
  recent_sessions: Session[];
  top_developers: { name: string; attendance_pct: number; submissions: number }[];
}

export interface DeveloperDashboardData {
  needs_profile_setup?: boolean;
  my_batch: {
    name: string;
    mentor: string;
    progress_percentage: number;
    start_date: string;
    end_date: string;
  } | null;
  attendance_percentage: number;
  total_present: number;
  total_absent: number;
  total_leave: number;
  attendance_trend: { date: string; status: string }[];
  upcoming_sessions: Session[];
  pending_assignments: {
    id: number;
    title: string;
    description: string;
    due_date: string;
  }[];
  submitted_assignments: {
    id: number;
    title: string;
    description: string;
    due_date: string;
    submitted_at: string;
  }[];
  recent_attendance: {
    session_date: string;
    session_title: string;
    status: string;
  }[];
  days_remaining: number | null;
}
