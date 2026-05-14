"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { batchService } from "@/services/batch.service";
import { scheduleService } from "@/services/schedule.service";
import type { Batch, Session } from "@/types";
import { formatDate } from "@/utils/formatDate";

export default function AdminSchedulesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchId, setBatchId] = useState<number | "">("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void batchService.list().then((d) => setBatches(d.results));
  }, []);

  const load = useCallback(async () => {
    if (!batchId) return;
    setLoading(true);
    try {
      const s = await scheduleService.list({ batch: batchId });
      setSessions(s.results);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    void load();
  }, [load]);

  const generate = async () => {
    if (!batchId) return;
    try {
      const g = await scheduleService.generate(batchId as number);
      toast.success(`Created ${g.sessions_created} sessions`);
      void load();
    } catch {
      toast.error("Generation failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Schedule" description="Sessions per batch.">
        <div className="flex flex-wrap gap-2">
          <select
            className="h-10 rounded-lg border border-zinc-300 px-3 text-sm"
            value={batchId === "" ? "" : String(batchId)}
            onChange={(e) =>
              setBatchId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">Filter by batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batch_name}
              </option>
            ))}
          </select>
          <Button type="button" variant="secondary" onClick={() => void generate()}>
            Generate sessions
          </Button>
        </div>
      </PageHeader>
      <DataTable
        isLoading={loading}
        columns={[
          {
            key: "session_date",
            header: "Date",
            render: (r) => formatDate(r.session_date),
          },
          { key: "title", header: "Title" },
          {
            key: "session_type",
            header: "Type",
            render: (r) => <Badge variant="outline">{r.session_type}</Badge>,
          },
          {
            key: "is_completed",
            header: "Done",
            render: (r) => (r.is_completed ? "Yes" : "No"),
          },
        ]}
        rows={sessions}
      />
    </div>
  );
}
