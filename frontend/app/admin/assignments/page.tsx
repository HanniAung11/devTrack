"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SUBMISSION_STATUS,
  SUBMISSION_STATUS_BADGE,
  SUBMISSION_STATUS_LABEL,
} from "@/constants/submission";
import { assignmentService } from "@/services/assignment.service";
import { batchService } from "@/services/batch.service";
import type { Assignment, Batch, Submission } from "@/types";
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

  const [reviewAssignment, setReviewAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});

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

  const openSubmissions = async (assignment: Assignment) => {
    setReviewAssignment(assignment);
    setSubsLoading(true);
    try {
      const res = await assignmentService.submissions.list({
        assignment: assignment.id,
      });
      setSubmissions(res.results);
      const notes: Record<number, string> = {};
      res.results.forEach((s) => {
        notes[s.id] = s.review_note ?? "";
      });
      setReviewNotes(notes);
    } catch {
      toast.error("Failed to load submissions");
      setReviewAssignment(null);
    } finally {
      setSubsLoading(false);
    }
  };

  const review = async (sub: Submission, status: "ACCEPTED" | "REJECTED") => {
    try {
      await assignmentService.submissions.review(sub.id, {
        status,
        review_note: reviewNotes[sub.id] ?? "",
      });
      toast.success(
        status === SUBMISSION_STATUS.ACCEPTED ? "Submission accepted" : "Submission rejected"
      );
      if (reviewAssignment) {
        await openSubmissions(reviewAssignment);
      }
      void load();
    } catch {
      toast.error("Could not update submission");
    }
  };

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
          {
            key: "actions",
            header: "",
            render: (r) => (
              <Button type="button" size="sm" variant="outline" onClick={() => void openSubmissions(r)}>
                View submissions
              </Button>
            ),
          },
        ]}
        rows={rows}
      />

      <Dialog
        open={reviewAssignment !== null}
        onOpenChange={(v) => !v && setReviewAssignment(null)}
      >
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Submissions — {reviewAssignment?.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-500">
            Due {reviewAssignment ? formatDate(reviewAssignment.due_date) : ""}. Late
            submissions are marked if submitted after the due date.
          </p>

          {subsLoading ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-zinc-500">No submissions yet.</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((s) => (
                <Card key={s.id}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{s.developer_name}</p>
                        <p className="text-xs text-zinc-500">{s.developer_code}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${SUBMISSION_STATUS_BADGE[s.status]}`}
                        >
                          {SUBMISSION_STATUS_LABEL[s.status]}
                        </span>
                        {s.is_late ? (
                          <Badge variant="warning">Late</Badge>
                        ) : (
                          <Badge variant="outline">On time</Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm">
                      Submitted {formatDate(s.submitted_at)}
                      {s.assignment_due_date ? (
                        <> · Due {formatDate(s.assignment_due_date)}</>
                      ) : null}
                    </p>

                    <a
                      href={s.github_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-indigo-600 underline"
                    >
                      {s.github_link}
                    </a>
                    {s.notes ? (
                      <p className="text-sm text-zinc-600">
                        <strong>Notes:</strong> {s.notes}
                      </p>
                    ) : null}

                    {s.status === SUBMISSION_STATUS.PENDING ? (
                      <>
                        <div>
                          <Label>Feedback (optional, shown on reject)</Label>
                          <Input
                            value={reviewNotes[s.id] ?? ""}
                            onChange={(e) =>
                              setReviewNotes((prev) => ({
                                ...prev,
                                [s.id]: e.target.value,
                              }))
                            }
                            placeholder="Reason if rejecting…"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void review(s, SUBMISSION_STATUS.ACCEPTED)}
                          >
                            Accept
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void review(s, SUBMISSION_STATUS.REJECTED)}
                          >
                            Deny
                          </Button>
                        </div>
                      </>
                    ) : s.review_note ? (
                      <p className="text-sm text-zinc-600">
                        <strong>Review note:</strong> {s.review_note}
                      </p>
                    ) : null}

                    {s.status === SUBMISSION_STATUS.ACCEPTED ? (
                      <p className="text-xs text-emerald-700">Submission closed — developer cannot resubmit.</p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
