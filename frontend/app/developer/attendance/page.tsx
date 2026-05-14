"use client";

import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { attendanceService } from "@/services/attendance.service";
import { getProfile } from "@/services/auth.service";
import type { Attendance } from "@/types";
import { formatDate } from "@/utils/formatDate";

export default function DeveloperAttendancePage() {
  const [rows, setRows] = useState<Attendance[]>([]);
  const [pct, setPct] = useState(0);

  const load = useCallback(async () => {
    const p = await getProfile();
    if (!p.developer?.id) {
      setRows([]);
      setPct(0);
      return;
    }
    const a = await attendanceService.list({ developer: p.developer.id });
    setRows(a.results);
    const total = a.results.length;
    const present = a.results.filter((x) => x.status === "PRESENT").length;
    setPct(total ? Math.round((present / total) * 100) : 0);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader title="My attendance" />
      <Card className="flex items-center justify-center p-10">
        <div className="text-center">
          <p className="text-5xl font-bold text-indigo-600">{pct}%</p>
          <p className="text-sm text-zinc-600">Overall attendance</p>
        </div>
      </Card>
      <DataTable
        isLoading={false}
        columns={[
          {
            key: "d1",
            header: "Date",
            render: (r) => formatDate(r.session_detail?.session_date),
          },
          {
            key: "d2",
            header: "Session",
            render: (r) => r.session_detail?.title ?? "—",
          },
          {
            key: "status",
            header: "Status",
            render: (r) => <Badge>{r.status}</Badge>,
          },
        ]}
        rows={rows}
      />
    </div>
  );
}
