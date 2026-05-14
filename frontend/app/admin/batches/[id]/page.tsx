// "use client";

// import Link from "next/link";
// import { useParams } from "next/navigation";
// import { useCallback, useEffect, useState } from "react";
// import { toast } from "sonner";

// import { PageHeader } from "@/components/layout/PageHeader";
// import { DataTable } from "@/components/tables/DataTable";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { developerService } from "@/services/developer.service";
// import { batchService } from "@/services/batch.service";
// import { scheduleService } from "@/services/schedule.service";
// import { assignmentService } from "@/services/assignment.service";
// import type { Assignment, Batch, Developer, Session } from "@/types";
// import { formatDate } from "@/utils/formatDate";

// export default function BatchDetailPage() {
//   const params = useParams();
//   const id = Number(params.id);
//   const [batch, setBatch] = useState<Batch | null>(null);
//   const [devs, setDevs] = useState<Developer[]>([]);
//   const [sessions, setSessions] = useState<Session[]>([]);
//   const [assigns, setAssigns] = useState<Assignment[]>([]);
//   const [loading, setLoading] = useState(true);

//   const load = useCallback(async () => {
//     if (!Number.isFinite(id)) return;
//     setLoading(true);
//     try {
//       const [b, d, s, a] = await Promise.all([
//         batchService.get(id),
//         developerService.list({ batch: id }),
//         scheduleService.list({ batch: id }),
//         assignmentService.list({ batch: id }),
//       ]);
//       setBatch(b);
//       setDevs(d.results);
//       setSessions(s.results);
//       setAssigns(a.results);
//     } catch {
//       toast.error("Failed to load batch");
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     void load();
//   }, [load]);

//   if (!batch) {
//     return loading ? (
//       <p className="text-sm text-zinc-500">Loading…</p>
//     ) : (
//       <p>Batch not found</p>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <PageHeader
//         title={batch.batch_name}
//         description={`${formatDate(batch.start_date)} — ${formatDate(batch.end_date)} · Mentor: ${batch.mentor.display_name}`}
//       >
//         <Badge>{batch.status}</Badge>
//         <Button variant="outline" asChild>
//           <Link href="/admin/batches">All batches</Link>
//         </Button>
//       </PageHeader>

//       <Tabs defaultValue="overview">
//         <TabsList>
//           <TabsTrigger value="overview">Overview</TabsTrigger>
//           <TabsTrigger value="developers">Developers</TabsTrigger>
//           <TabsTrigger value="schedule">Schedule</TabsTrigger>
//           <TabsTrigger value="assignments">Assignments</TabsTrigger>
//         </TabsList>

//         <TabsContent value="overview" className="space-y-4 pt-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Progress</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-2">
//               <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
//                 <div
//                   className="h-full bg-indigo-600"
//                   style={{ width: `${batch.completion_percentage ?? 0}%` }}
//                 />
//               </div>
//               <p className="text-sm text-zinc-600">
//                 Completion ≈ {batch.completion_percentage ?? 0}% · Sessions:{" "}
//                 {batch.total_sessions ?? 0}
//               </p>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="developers" className="pt-4">
//           <DataTable
//             isLoading={loading}
//             columns={[
//               { key: "developer_code", header: "Code" },
//               { key: "full_name", header: "Name" },
//               { key: "email", header: "Email" },
//               {
//                 key: "attendance_percentage",
//                 header: "Attendance %",
//                 render: (r) => r.attendance_percentage ?? "—",
//               },
//             ]}
//             rows={devs}
//           />
//         </TabsContent>

//         <TabsContent value="schedule" className="pt-4 space-y-3">
//           <Button
//             type="button"
//             onClick={async () => {
//               try {
//                 const g = await scheduleService.generate(id);
//                 toast.success(`Created ${g.sessions_created} sessions`);
//                 void load();
//               } catch {
//                 toast.error("Could not generate");
//               }
//             }}
//           >
//             Generate schedule
//           </Button>
//           <DataTable
//             isLoading={loading}
//             columns={[
//               {
//                 key: "session_date",
//                 header: "Date",
//                 render: (r) => formatDate(r.session_date),
//               },
//               { key: "title", header: "Title" },
//               {
//                 key: "session_type",
//                 header: "Type",
//                 render: (r) => <Badge variant="outline">{r.session_type}</Badge>,
//               },
//             ]}
//             rows={sessions}
//           />
//         </TabsContent>

//         <TabsContent value="assignments" className="pt-4">
//           <DataTable
//             isLoading={loading}
//             columns={[
//               { key: "title", header: "Title" },
//               {
//                 key: "due_date",
//                 header: "Due",
//                 render: (r) => formatDate(r.due_date),
//               },
//               { key: "submission_count", header: "Submissions" },
//             ]}
//             rows={assigns}
//           />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { developerService } from "@/services/developer.service";
import { batchService } from "@/services/batch.service";
import { scheduleService } from "@/services/schedule.service";
import { assignmentService } from "@/services/assignment.service";
import type { Assignment, Batch, Developer, Session } from "@/types";
import { formatDate } from "@/utils/formatDate";

export default function BatchDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [batch, setBatch] = useState<Batch | null>(null);
  const [devs, setDevs] = useState<Developer[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [assigns, setAssigns] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const [assignOpen, setAssignOpen] = useState(false);
  const [unassigned, setUnassigned] = useState<Developer[]>([]);
  const [selectedDevId, setSelectedDevId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  
  const load = useCallback(async () => {
    if (!Number.isFinite(id)) return;
    setLoading(true);
    try {
      const [b, d, s, a] = await Promise.all([
        batchService.get(id),
        developerService.list({ batch: id }),
        scheduleService.list({ batch: id }),
        assignmentService.list({ batch: id }),
      ]);
      setBatch(b);
      setDevs(d.results);
      setSessions(s.results);
      setAssigns(a.results);
    } catch {
      toast.error("Failed to load batch");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const openAssignModal = async () => {
    try {
      const res = await developerService.list({ batch: "none" });
      setUnassigned(res.results);
      setSelectedDevId("");
      setAssignOpen(true);
    } catch {
      toast.error("Failed to load available developers");
    }
  };

  const handleAssign = async () => {
    if (!selectedDevId) return;
    setAssigning(true);
    try {
      await developerService.update(Number(selectedDevId), { batch_id: id });
      toast.success("Developer assigned to batch!");
      setAssignOpen(false);
      void load(); 
    } catch {
      toast.error("Failed to assign developer");
    } finally {
      setAssigning(false);
    }
  };

  if (!batch) {
    return loading ? (
      <p className="text-sm text-zinc-500">Loading…</p>
    ) : (
      <p>Batch not found</p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={batch.batch_name}
        description={`${formatDate(batch.start_date)} — ${formatDate(batch.end_date)} · Mentor: ${batch.mentor.display_name}`}
      >
        <Badge>{batch.status}</Badge>
        <Button variant="outline" asChild>
          <Link href="/admin/batches">All batches</Link>
        </Button>
      </PageHeader>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="developers">Developers</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full bg-indigo-600"
                  style={{ width: `${batch.completion_percentage ?? 0}%` }}
                />
              </div>
              <p className="text-sm text-zinc-600">
                Completion ≈ {batch.completion_percentage ?? 0}% · Sessions:{" "}
                {batch.total_sessions ?? 0}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Developers ── */}
        <TabsContent value="developers" className="pt-4 space-y-3">
          {/* ADD DEVELOPER BUTTON */}
          <div className="flex justify-end">
            <Button onClick={openAssignModal}>+ Assign Developer</Button>
          </div>

          <DataTable
            isLoading={loading}
            columns={[
              { key: "developer_code", header: "Code" },
              { key: "full_name", header: "Name" },
              { key: "email", header: "Email" },
              {
                key: "attendance_percentage",
                header: "Attendance %",
                render: (r) => r.attendance_percentage ?? "—",
              },
            ]}
            rows={devs}
          />
        </TabsContent>

        {/* ── Schedule ── */}
        <TabsContent value="schedule" className="pt-4 space-y-3">
          <Button
            type="button"
            onClick={async () => {
              try {
                const g = await scheduleService.generate(id);
                toast.success(`Created ${g.sessions_created} sessions`);
                void load();
              } catch {
                toast.error("Could not generate");
              }
            }}
          >
            Generate schedule
          </Button>
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
            ]}
            rows={sessions}
          />
        </TabsContent>

        {/* ── Assignments ── */}
        <TabsContent value="assignments" className="pt-4">
          <DataTable
            isLoading={loading}
            columns={[
              { key: "title", header: "Title" },
              {
                key: "due_date",
                header: "Due",
                render: (r) => formatDate(r.due_date),
              },
              { key: "submission_count", header: "Submissions" },
            ]}
            rows={assigns}
          />
        </TabsContent>
      </Tabs>

      {/* ── Assign Developer Modal ── */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Developer to {batch.batch_name}</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            {unassigned.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No unassigned developers available. Add developers first from
                the Developers page.
              </p>
            ) : (
              <Select value={selectedDevId} onValueChange={setSelectedDevId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a developer…" />
                </SelectTrigger>
                <SelectContent>
                  {unassigned.map((dev) => (
                    <SelectItem key={dev.id} value={String(dev.id)}>
                      {dev.full_name} ({dev.developer_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedDevId || assigning || unassigned.length === 0}
            >
              {assigning ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
