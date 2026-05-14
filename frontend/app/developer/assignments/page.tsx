"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assignmentService } from "@/services/assignment.service";
import { getProfile } from "@/services/auth.service";
import type { Assignment, Submission } from "@/types";
import { formatDate } from "@/utils/formatDate";

export default function DeveloperAssignmentsPage() {
  const [pending, setPending] = useState<Assignment[]>([]);
  const [submitted, setSubmitted] = useState<Submission[]>([]);
  const [modal, setModal] = useState<Assignment | null>(null);
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    const a = await assignmentService.list();
    setPending(a.results.filter((x) => !x.is_submitted));
    const s = await assignmentService.submissions.list();
    setSubmitted(s.results);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal) return;
    const p = await getProfile();
    if (!p.developer?.id) {
      toast.error("No developer profile");
      return;
    }
    await assignmentService.submissions.create({
      assignment: modal.id,
      github_link: link,
      notes,
    });
    toast.success("Submitted");
    setModal(null);
    setLink("");
    setNotes("");
    void load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My assignments" />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="done">Submitted</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-3 pt-4">
          {pending.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-xs text-zinc-500">Due {formatDate(a.due_date)}</p>
                </div>
                <Button type="button" size="sm" onClick={() => setModal(a)}>
                  Submit
                </Button>
              </CardContent>
            </Card>
          ))}
          {pending.length === 0 ? (
            <p className="text-sm text-zinc-500">Nothing pending.</p>
          ) : null}
        </TabsContent>
        <TabsContent value="done" className="space-y-3 pt-4">
          {submitted.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <p className="font-medium">Assignment #{s.assignment}</p>
                <p className="text-xs text-zinc-500">
                  {formatDate(s.submitted_at)} ·{" "}
                  <a
                    className="text-indigo-600"
                    href={s.github_link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Repository
                  </a>
                </p>
                {s.is_late ? <Badge variant="warning">Late</Badge> : null}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4 pt-6">
              <p className="font-semibold">{modal.title}</p>
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <Label>GitHub link</Label>
                  <Input value={link} onChange={(e) => setLink(e.target.value)} required type="url" />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Submit</Button>
                  <Button type="button" variant="outline" onClick={() => setModal(null)}>
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
