export const ROUTES = {
  login: "/login",
  register: "/register",
  admin: {
    dashboard: "/dashboard",
    batches: "/batches",
    developers: "/developers",
    attendance: "/attendance",
    schedule: "/schedules",
    assignments: "/assignments",
  },
  developer: {
    dashboard: "/dashboard",
    schedule: "/schedule",
    attendance: "/attendance",
    assignments: "/assignments",
    profile: "/profile",
  },
} as const;
