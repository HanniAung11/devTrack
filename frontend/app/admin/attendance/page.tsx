"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { attendanceService } from "@/services/attendance.service";
import { batchService } from "@/services/batch.service";
import { developerService } from "@/services/developer.service";
import { scheduleService } from "@/services/schedule.service";
import type { Batch, Developer, Session } from "@/types";
import { ATTENDANCE_STATUS } from "@/constants/status";

export default function AdminAttendancePage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchId, setBatchId] = useState<number | "">("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<number | "">("");
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [marks, setMarks] = useState<Record<number, { status: string; note: string }>>({});

  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();
  const selectedSession = sessions.find((s) => s.id === sessionId);
  const sessionIsFuture = selectedSession
    ? selectedSession.session_date > todayStr
    : false;

  useEffect(() => {
    void batchService.list().then((d) => setBatches(d.results));
  }, []);

  const loadSessions = useCallback(async () => {
    if (!batchId) return;
    const s = await scheduleService.list({ batch: batchId });
    setSessions(s.results);
  }, [batchId]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const loadDevs = useCallback(async () => {
    if (!batchId) return;
    const d = await developerService.list({ batch: batchId });
    setDevelopers(d.results);
    const next: Record<number, { status: string; note: string }> = {};
    d.results.forEach((dev) => {
      next[dev.id] = { status: ATTENDANCE_STATUS.PRESENT, note: "" };
    });
    setMarks(next);
  }, [batchId]);

  useEffect(() => {
    void loadDevs();
  }, [loadDevs]);

  const summary = () => {
    let p = 0,
      a = 0,
      l = 0;
    developers.forEach((d) => {
      const s = marks[d.id]?.status;
      if (s === ATTENDANCE_STATUS.PRESENT) p++;
      else if (s === ATTENDANCE_STATUS.ABSENT) a++;
      else if (s === ATTENDANCE_STATUS.LEAVE) l++;
    });
    return { p, a, l };
  };

  const saveAll = async () => {
    if (!sessionId) {
      toast.error("Select a session");
      return;
    }
    if (sessionIsFuture) {
      toast.error("Cannot save attendance for a future session.");
      return;
    }
    try {
      for (const dev of developers) {
        const m = marks[dev.id];
        await attendanceService.create({
          developer: dev.id,
          session: sessionId as number,
          status: m.status,
          note: m.note,
        });
      }
      toast.success("Attendance saved");
    } catch {
      toast.error("Some rows may already exist — edit individually in API");
    }
  };

  const { p, a, l } = summary();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Select batch and session, then mark all developers."
      />
      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
          <div>
            <Label>Batch</Label>
            <select
              className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm"
              value={batchId === "" ? "" : String(batchId)}
              onChange={(e) =>
                setBatchId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">Select batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Session</Label>
            <select
              className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm"
              value={sessionId === "" ? "" : String(sessionId)}
              onChange={(e) =>
                setSessionId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">Select session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.session_date} — {s.title}
                  {s.session_date > todayStr ? " (future)" : ""}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
        Summary: <span className="text-emerald-600">{p} Present</span> ·{" "}
        <span className="text-red-600">{a} Absent</span> ·{" "}
        <span className="text-amber-600">{l} Leave</span>
        {sessionIsFuture ? (
          <span className="ml-2 text-amber-700">
            · This session is in the future — marking is disabled until the session date.
          </span>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2">Developer</th>
              <th className="px-4 py-2">Present</th>
              <th className="px-4 py-2">Absent</th>
              <th className="px-4 py-2">Leave</th>
              <th className="px-4 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {developers.map((dev) => (
              <tr key={dev.id} className="border-t">
                <td className="px-4 py-2">{dev.full_name}</td>
                {[ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.ABSENT, ATTENDANCE_STATUS.LEAVE].map(
                  (st) => (
                    <td key={st} className="px-4 py-2">
                      <input
                        type="radio"
                        name={`st-${dev.id}`}
                        disabled={sessionIsFuture}
                        checked={marks[dev.id]?.status === st}
                        onChange={() =>
                          setMarks((prev) => ({
                            ...prev,
                            [dev.id]: { ...prev[dev.id], status: st },
                          }))
                        }
                      />
                    </td>
                  )
                )}
                <td className="px-4 py-2">
                  <Input
                    disabled={sessionIsFuture}
                    value={marks[dev.id]?.note ?? ""}
                    onChange={(e) =>
                      setMarks((prev) => ({
                        ...prev,
                        [dev.id]: { ...prev[dev.id], note: e.target.value },
                      }))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        type="button"
        disabled={sessionIsFuture || !sessionId}
        onClick={() => void saveAll()}
      >
        Save attendance
      </Button>
    </div>
  );
}
