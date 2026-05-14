"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assignmentService } from "@/services/assignment.service";
import { batchService } from "@/services/batch.service";
import type { Assignment, Batch } from "@/types";
import { formatDate } from "@/utils/formatDate";

export default function AdminAssignmentsPage() {
  const [rows, setRows] = useState<Assignment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [batchId, setBatchId] = useState("");
  const [due, setDue] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await assignmentService.list();
      setRows(d.results);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void batchService.list().then((b) => setBatches(b.results));
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await assignmentService.create({
      title,
      description,
      batch: Number(batchId),
      due_date: due,
    });
    toast.success("Assignment created");
    setOpen(false);
    setTitle("");
    setDescription("");
    setBatchId("");
    setDue("");
    void load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Assignments">
        <Button type="button" onClick={() => setOpen(true)}>
          New assignment
        </Button>
      </PageHeader>

      {open ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={create} className="max-w-lg space-y-3">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <Label>Batch</Label>
                <select
                  className="mt-1 h-10 w-full rounded-lg border px-3 text-sm"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batch_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Due date</Label>
                <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} required />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <DataTable
        isLoading={loading}
        columns={[
          { key: "title", header: "Title" },
          {
            key: "batch_detail",
            header: "Batch",
            render: (r) => r.batch_detail?.batch_name,
          },
          {
            key: "due_date",
            header: "Due",
            render: (r) => formatDate(r.due_date),
          },
          { key: "submission_count", header: "Submissions" },
        ]}
        rows={rows}
      />
    </div>
  );
}
