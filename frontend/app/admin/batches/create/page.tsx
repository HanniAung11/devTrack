"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BATCH_STATUS } from "@/constants/status";
import { batchService } from "@/services/batch.service";
import { listMentors } from "@/services/auth.service";
import { scheduleService } from "@/services/schedule.service";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const schema = z.object({
  batch_name: z.string().min(2),
  mentor: z.number().positive("Select a mentor"),
  start_date: z.string(),
  end_date: z.string(),
  duration_months: z.number().min(1).max(36),
  attendance_target: z.number().min(50).max(100),
  status: z.string(),
  training_days: z.array(z.string()).min(1, "Pick at least one day"),
});

type FormValues = z.infer<typeof schema>;

export default function CreateBatchPage() {
  const router = useRouter();
  const [mentors, setMentors] = useState<{ id: number; display_name: string }[]>(
    []
  );

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        batch_name: "",
        mentor: 1,
        start_date: "",
        end_date: "",
        duration_months: 3,
        attendance_target: 75,
        status: BATCH_STATUS.UPCOMING,
        training_days: ["Monday", "Wednesday", "Friday"],
      },
    });

  const training_days = watch("training_days") ?? [];

  useEffect(() => {
    let cancelled = false;
    void listMentors()
      .then((ms) => {
        if (cancelled) return;
        setMentors(ms);
        if (ms[0]) {
          setValue("mentor", ms[0].id, { shouldValidate: true });
        }
      })
      .catch(() => toast.error("Failed to load mentors"));
    return () => {
      cancelled = true;
    };
  }, [setValue]);

  const toggleDay = (d: string) => {
    const next = training_days.includes(d)
      ? training_days.filter((x) => x !== d)
      : [...training_days, d];
    setValue("training_days", next, { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    const created = await batchService.create({
      batch_name: values.batch_name,
      mentor: values.mentor,
      start_date: values.start_date,
      end_date: values.end_date,
      duration_months: values.duration_months,
      training_days: values.training_days,
      attendance_target: values.attendance_target,
      status: values.status,
    });
    toast.success("Batch saved");
    try {
      const gen = await scheduleService.generate(created.id);
      toast.success(`Generated ${gen.sessions_created} sessions`);
    } catch {
      toast.message("Batch saved; schedule generation skipped or failed.");
    }
    router.push(`/admin/batches/${created.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create batch" description="Define cohort dates, mentor, and training days.">
        <Button variant="outline" asChild>
          <Link href="/admin/batches">Back</Link>
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <Label>Batch name</Label>
              <Input {...register("batch_name")} />
              {errors.batch_name ? (
                <p className="text-xs text-red-600">{errors.batch_name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Mentor</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                {...register("mentor", { valueAsNumber: true })}
              >
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start date</Label>
                <Input type="date" {...register("start_date")} />
              </div>
              <div className="space-y-2">
                <Label>End date</Label>
                <Input type="date" {...register("end_date")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Duration (months)</Label>
                <Input
                  type="number"
                  {...register("duration_months", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Attendance target (%)</Label>
                <Input
                  type="number"
                  {...register("attendance_target", { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                {...register("status")}
              >
                <option value={BATCH_STATUS.UPCOMING}>Upcoming</option>
                <option value={BATCH_STATUS.ACTIVE}>Active</option>
                <option value={BATCH_STATUS.COMPLETED}>Completed</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Training days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <label
                    key={d}
                    className="flex cursor-pointer items-center gap-2 rounded border border-zinc-200 px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={training_days.includes(d)}
                      onChange={() => toggleDay(d)}
                    />
                    {d.slice(0, 3)}
                  </label>
                ))}
              </div>
              {errors.training_days ? (
                <p className="text-xs text-red-600">
                  {errors.training_days.message as string}
                </p>
              ) : null}
            </div>
            <Button type="submit">Save &amp; generate schedule</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
