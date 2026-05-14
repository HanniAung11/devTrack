"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { attendanceService } from "@/services/attendance.service";
import { developerService } from "@/services/developer.service";
import { assignmentService } from "@/services/assignment.service";
import type { Attendance, Developer, Submission } from "@/types";
import { formatDate, formatDateTime } from "@/utils/formatDate";

export default function DeveloperDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [dev, setDev] = useState<Developer | null>(null);
  const [att, setAtt] = useState<Attendance[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);

  const load = useCallback(async () => {
    if (!Number.isFinite(id)) return;
    const d = await developerService.get(id);
    setDev(d);
    const [a, s] = await Promise.all([
      attendanceService.list({ developer: id }),
      assignmentService.submissions.list({ developer: id }),
    ]);
    setAtt(a.results);
    setSubs(s.results);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!dev) return <p className="text-sm text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <PageHeader title={dev.full_name} description={dev.developer_code}>
        <Link className="text-sm text-indigo-600" href="/admin/developers">
          ← Back
        </Link>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>{dev.email}</p>
            <p>{dev.phone || "—"}</p>
            <p>Batch: {dev.batch_detail?.batch_name ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dev.attendance_percentage ?? 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dev.submitted_assignments_count}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Attendance history</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: "session_date",
                header: "Session date",
                render: (r) => formatDate(r.session_detail?.session_date),
              },
              { key: "status", header: "Status" },
            ]}
            rows={att}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: "assignment", header: "Assignment ID" },
              { key: "github_link", header: "Link" },
              {
                key: "submitted_at",
                header: "Submitted",
                render: (r) => formatDateTime(r.submitted_at),
              },
            ]}
            rows={subs}
          />
        </CardContent>
      </Card>
    </div>
  );
}
