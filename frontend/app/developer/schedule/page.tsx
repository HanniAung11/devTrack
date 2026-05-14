"use client";

import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getProfile } from "@/services/auth.service";
import { scheduleService } from "@/services/schedule.service";
import type { Session } from "@/types";
import { formatDate } from "@/utils/formatDate";

export default function DeveloperSchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  const load = useCallback(async () => {
    const p = await getProfile();
    const bid = p.developer?.batch;
    if (!bid) {
      setSessions([]);
      return;
    }
    const s = await scheduleService.list({ batch: bid });
    setSessions(s.results);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My schedule"
        description="Sessions for your current batch."
      />
      <div className="grid gap-3">
        {sessions.length === 0 ? (
          <Card className="p-6 text-sm text-zinc-500">No sessions yet.</Card>
        ) : (
          sessions.map((s) => (
            <Card key={s.id} className="flex flex-wrap items-center justify-between p-4">
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-zinc-500">{formatDate(s.session_date)}</p>
              </div>
              <Badge variant="outline">{s.session_type}</Badge>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
