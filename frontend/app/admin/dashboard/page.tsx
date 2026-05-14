"use client";

import { CalendarCheck, ClipboardList, Layers, Users } from "lucide-react";

import { AttendanceTrendChart } from "@/components/charts/AttendanceTrendChart";
import { BatchPerformanceChart } from "@/components/charts/BatchPerformanceChart";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboard } from "@/hooks/useDashboard";
import { formatDate } from "@/utils/formatDate";

export default function AdminDashboardPage() {
  const { data, loading } = useAdminDashboard();

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of batches, developers, attendance, and assignments."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total batches"
          value={data.total_batches}
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Active developers"
          value={data.active_developers}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Overall attendance"
          value={`${data.overall_attendance_rate}%`}
          icon={CalendarCheck}
          color="orange"
        />
        <StatCard
          title="Assignment submission rate"
          value={`${data.assignments_submitted_rate}%`}
          icon={ClipboardList}
          color="purple"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance trend (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceTrendChart data={data.attendance_trend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Batch performance</CardTitle>
          </CardHeader>
          <CardContent>
            <BatchPerformanceChart data={data.batch_performance} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              isLoading={false}
              columns={[
                { key: "session_date", header: "Date", render: (r) => formatDate(r.session_date) },
                { key: "batch", header: "Batch", render: (r) => r.batch_detail?.batch_name },
                {
                  key: "session_type",
                  header: "Type",
                  render: (r) => (
                    <Badge variant="outline">{r.session_type}</Badge>
                  ),
                },
                {
                  key: "status",
                  header: "Completed",
                  render: (r) =>
                    r.is_completed ? (
                      <Badge variant="success">Yes</Badge>
                    ) : (
                      <Badge variant="warning">No</Badge>
                    ),
                },
              ]}
              rows={data.recent_sessions}
              emptyMessage="No sessions yet."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top developers</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              isLoading={false}
              columns={[
                {
                  key: "rank",
                  header: "#",
                  render: (r) => String((r as { rank: number }).rank),
                },
                { key: "name", header: "Name" },
                { key: "attendance_pct", header: "Attendance %" },
                { key: "submissions", header: "Submissions" },
              ]}
              rows={data.top_developers.map((d, i) => ({
                ...d,
                id: i,
                rank: i + 1,
              }))}
              emptyMessage="No developers yet."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
