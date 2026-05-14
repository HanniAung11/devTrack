"use client";

import {
  CalendarDays,
  CalendarRange,
  ClipboardList,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { logout as apiLogout } from "@/services/auth.service";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/batches", label: "Batches", icon: Layers },
  { href: "/admin/developers", label: "Developers", icon: Users },
  { href: "/admin/attendance", label: "Attendance", icon: CalendarDays },
  { href: "/admin/schedules", label: "Schedule", icon: CalendarRange },
  { href: "/admin/assignments", label: "Assignments", icon: ClipboardList },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUiStore();
  const { user, refreshToken, clearAuth } = useAuthStore();

  const signOut = async () => {
    try {
      if (refreshToken) await apiLogout(refreshToken);
    } finally {
      clearAuth();
      window.location.href = "/login";
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-3 top-3 z-40 lg:hidden"
        type="button"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-800 bg-[#0f172a] text-slate-100 transition-transform lg:static lg:translate-x-0",
          !sidebarOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center gap-2 border-b border-slate-700 px-5 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            DT
          </div>
          <div>
            <p className="text-base font-semibold">DevTrack</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-700 p-4">
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start text-slate-200 hover:bg-slate-800 hover:text-white"
            type="button"
            onClick={() => void signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
    </>
  );
}
