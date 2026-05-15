"use client";

import Link from "next/link";
import { BookOpen, ClipboardList, TrendingUp, UserCheck } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeveloperDashboard } from "@/hooks/useDashboard";
import { formatDate } from "@/utils/formatDate";

export default function DeveloperDashboardPage() {
  const { data, loading, error, reload } = useDeveloperDashboard();

  if (error && !data) {
    return (
      <div className="space-y-4">
        <PageHeader title="My dashboard" />
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
        <p className="text-sm text-zinc-600">
          Make sure the Django API is running on port 8000, then try again.
        </p>
        <div className="flex gap-2">
          <Button type="button" onClick={() => void reload()}>
            Retry
          </Button>
          <Button variant="outline" asChild>
            <Link href="/developer/profile">Open profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const trendData = data.attendance_trend.map((t) => ({
    date: t.date.slice(5),
    ok: t.status === "PRESENT" ? 1 : 0,
    bad: t.status === "ABSENT" ? 1 : 0,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="My dashboard"
        description="Your attendance, batch progress, and assignments."
      />

      {data.needs_profile_setup ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <p className="text-sm text-amber-900">
              Complete your profile so DevTrack can load your batch and assignments.
            </p>
            <Button size="sm" asChild>
              <Link href="/developer/profile">Go to profile</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Attendance"
          value={`${data.attendance_percentage}%`}
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Present"
          value={data.total_present}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Absent"
          value={data.total_absent}
          icon={BookOpen}
          color="orange"
        />
        <StatCard
          title="Pending assignments"
          value={data.pending_assignments.length}
          icon={ClipboardList}
          color="purple"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance trend (30 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="ok" name="Present" fill="#22c55e" />
                <Bar dataKey="bad" name="Absent" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My batch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.my_batch ? (
              <>
                <p className="text-lg font-semibold">{data.my_batch.name}</p>
                <p className="text-sm text-zinc-600">
                  Mentor: {data.my_batch.mentor || "—"}
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${data.my_batch.progress_percentage}%` }}
                  />
                </div>
                <p className="text-sm text-zinc-600">
                  Progress: {data.my_batch.progress_percentage}% ·{" "}
                  {data.days_remaining != null
                    ? `${data.days_remaining} days left in batch`
                    : "Batch ended"}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatDate(data.my_batch.start_date)} —{" "}
                  {formatDate(data.my_batch.end_date)}
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-600">
                You are not assigned to a batch yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcoming_sessions.length === 0 ? (
              <p className="text-sm text-zinc-500">No upcoming sessions.</p>
            ) : (
              data.upcoming_sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 p-3"
                >
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-xs text-zinc-500">
                      {formatDate(s.session_date)}
                    </p>
                  </div>
                  <Badge variant="outline">{s.session_type}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.pending_assignments.length === 0 ? (
              <p className="text-sm text-zinc-500">All caught up.</p>
            ) : (
              data.pending_assignments.map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-zinc-100 p-3"
                >
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-zinc-500">
                    Due {formatDate(a.due_date)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
