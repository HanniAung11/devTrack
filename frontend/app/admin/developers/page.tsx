"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { developerService } from "@/services/developer.service";
import type { Developer } from "@/types";
import { attendanceColorClass } from "@/utils/calcAttendance";
export default function AdminDevelopersPage() {
  const [rows, setRows] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await developerService.list({
        search: search || undefined,
      });
      setRows(data.results);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 300);
    return () => window.clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader title="Developers" description="Trainee profiles and batch assignment.">
        <Button asChild>
          <Link href="/admin/developers/create">Add developer</Link>
        </Button>
      </PageHeader>
      <Input
        placeholder="Search name, email, code..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <DataTable
        isLoading={loading}
        columns={[
          { key: "developer_code", header: "Code" },
          { key: "full_name", header: "Name" },
          { key: "email", header: "Email" },
          {
            key: "batch_detail",
            header: "Batch",
            render: (r) => r.batch_detail?.batch_name ?? "—",
          },
          {
            key: "attendance_percentage",
            header: "Attendance %",
            className: "[&]:font-medium",
            render: (r) => (
              <span
                className={attendanceColorClass(r.attendance_percentage)}
              >
                {r.attendance_percentage ?? "—"}%
              </span>
            ),
          },
          {
            key: "is_active",
            header: "Active",
            render: (r) => (r.is_active ? "Yes" : "No"),
          },
          {
            key: "actions",
            header: "",
            render: (r) => (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/developers/${r.id}`}>View</Link>
              </Button>
            ),
          },
        ]}
        rows={rows}
      />
    </div>
  );
}
