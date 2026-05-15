"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SUBMISSION_STATUS,
  SUBMISSION_STATUS_BADGE,
  SUBMISSION_STATUS_LABEL,
} from "@/constants/submission";
import { assignmentService } from "@/services/assignment.service";
import { formatDrfErrorMessage } from "@/services/api";
import { getProfile } from "@/services/auth.service";
import type { Assignment, Submission } from "@/types";
import { formatDate } from "@/utils/formatDate";

export default function DeveloperAssignmentsPage() {
  const [pending, setPending] = useState<Assignment[]>([]);
  const [submitted, setSubmitted] = useState<Submission[]>([]);
  const [modal, setModal] = useState<Assignment | null>(null);
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const a = await assignmentService.list();
    setPending(a.results.filter((x) => x.can_submit));
    const s = await assignmentService.submissions.list();
    setSubmitted(s.results);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openModal = (a: Assignment) => {
    setSubmitError(null);
    setModal(a);
    if (a.submission_status === SUBMISSION_STATUS.REJECTED) {
      const existing = submitted.find((s) => s.assignment === a.id);
      setLink(existing?.github_link ?? "");
      setNotes(existing?.notes ?? "");
    } else {
      setLink("");
      setNotes("");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const p = await getProfile();
      if (!p.developer?.id) {
        toast.error("Open Profile and save your details first.");
        return;
      }

      const isResubmit =
        modal.submission_status === SUBMISSION_STATUS.REJECTED &&
        modal.submission_id;

      if (isResubmit && modal.submission_id) {
        await assignmentService.submissions.update(modal.submission_id, {
          github_link: link.trim(),
          notes: notes.trim(),
        });
        toast.success("Resubmitted for review");
      } else {
        await assignmentService.submissions.create({
          assignment: modal.id,
          github_link: link.trim(),
          notes: notes.trim(),
        });
        toast.success("Submitted");
      }

      setModal(null);
      setLink("");
      setNotes("");
      void load();
    } catch (err) {
      let msg = "Submission failed.";
      if (axios.isAxiosError(err) && err.response?.data) {
        msg = formatDrfErrorMessage(err.response.data) || msg;
      }
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isResubmitModal =
    modal?.submission_status === SUBMISSION_STATUS.REJECTED;

  return (
    <div className="space-y-6">
      <PageHeader title="My assignments" />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">To do</TabsTrigger>
          <TabsTrigger value="done">My submissions</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-3 pt-4">
          {pending.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-xs text-zinc-500">Due {formatDate(a.due_date)}</p>
                  {a.submission_status === SUBMISSION_STATUS.REJECTED ? (
                    <p className="mt-1 text-xs text-red-600">
                      Denied — update and resubmit
                    </p>
                  ) : null}
                </div>
                <Button type="button" size="sm" onClick={() => openModal(a)}>
                  {a.submission_status === SUBMISSION_STATUS.REJECTED
                    ? "Resubmit"
                    : "Submit"}
                </Button>
              </CardContent>
            </Card>
          ))}
          {pending.length === 0 ? (
            <p className="text-sm text-zinc-500">Nothing to submit right now.</p>
          ) : null}
        </TabsContent>
        <TabsContent value="done" className="space-y-3 pt-4">
          {submitted.map((s) => (
            <Card key={s.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {s.assignment_title ?? `Assignment #${s.assignment}`}
                  </p>
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
                <p className="text-xs text-zinc-500">
                  Submitted {formatDate(s.submitted_at)}
                  {s.assignment_due_date ? (
                    <> · Due {formatDate(s.assignment_due_date)}</>
                  ) : null}
                </p>
                <a
                  className="text-sm text-indigo-600 underline"
                  href={s.github_link}
                  target="_blank"
                  rel="noreferrer"
                >
                  Repository
                </a>
                {s.review_note ? (
                  <p className="text-sm text-zinc-600">
                    <strong>Feedback:</strong> {s.review_note}
                  </p>
                ) : null}
                {s.status === SUBMISSION_STATUS.ACCEPTED ? (
                  <p className="text-xs text-emerald-700">Closed — no further submissions.</p>
                ) : null}
                {s.status === SUBMISSION_STATUS.PENDING ? (
                  <p className="text-xs text-amber-700">Awaiting admin review.</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
          {submitted.length === 0 ? (
            <p className="text-sm text-zinc-500">No submissions yet.</p>
          ) : null}
        </TabsContent>
      </Tabs>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4 pt-6">
              <p className="font-semibold">{modal.title}</p>
              <p className="text-xs text-zinc-500">
                Due {formatDate(modal.due_date)}
                {isResubmitModal
                  ? " · Resubmitting will mark as pending review again (late if after due date)."
                  : null}
              </p>
              {submitError ? (
                <p className="text-sm text-red-600" role="alert">
                  {submitError}
                </p>
              ) : null}
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <Label>GitHub link</Label>
                  <Input
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    required
                    type="text"
                    inputMode="url"
                    placeholder="https://github.com/…"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting
                      ? "Saving…"
                      : isResubmitModal
                        ? "Resubmit"
                        : "Submit"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setModal(null);
                      setSubmitError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
