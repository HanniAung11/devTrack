"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { batchService } from "@/services/batch.service";
import type { Batch } from "@/types";
import { STATUS_BADGE_CLASS } from "@/constants/status";
import { formatDate } from "@/utils/formatDate";

export default function AdminBatchesPage() {
  const [rows, setRows] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await batchService.list({
        search: search || undefined,
        status: status || undefined,
      });
      setRows(data.results);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 300);
    return () => window.clearTimeout(t);
  }, [load]);

  const statusClass = useMemo(() => STATUS_BADGE_CLASS, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Batches" description="Create and manage training batches.">
        <Button asChild>
          <Link href="/admin/batches/create">Create batch</Link>
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          className="h-10 rounded-lg border border-zinc-300 px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <DataTable
        isLoading={loading}
        columns={[
          { key: "batch_name", header: "Batch name" },
          {
            key: "mentor",
            header: "Mentor",
            render: (r) => r.mentor.display_name,
          },
          {
            key: "start_date",
            header: "Start",
            render: (r) => formatDate(r.start_date),
          },
          {
            key: "end_date",
            header: "End",
            render: (r) => formatDate(r.end_date),
          },
          {
            key: "total_developers",
            header: "Developers",
            render: (r) => r.total_developers ?? "—",
          },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <Badge
                className={
                  statusClass[r.status] ?? "border-zinc-200 bg-zinc-100 text-zinc-800"
                }
              >
                {r.status}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/batches/${r.id}`}>View</Link>
              </Button>
            ),
          },
        ]}
        rows={rows}
      />
    </div>
  );
}
