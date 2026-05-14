"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { batchService } from "@/services/batch.service";
import { developerService } from "@/services/developer.service";
import type { Batch } from "@/types";

export default function CreateDeveloperPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [batchId, setBatchId] = useState<string>("");

  useEffect(() => {
    void batchService
      .list()
      .then((d) => setBatches(d.results))
      .catch(() => toast.error("Failed to load batches"));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = Number(userId);
    if (!uid) {
      toast.error("Enter the linked user ID (from Django admin or registration).");
      return;
    }
    const dev = await developerService.create({
      user: uid,
      full_name: fullName,
      email,
      phone,
      batch: batchId ? Number(batchId) : null,
      is_active: true,
    });
    toast.success("Developer created");
    router.push(`/admin/developers/${dev.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Add developer">
        <Button variant="outline" asChild>
          <Link href="/admin/developers">Back</Link>
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="max-w-lg space-y-4">
            <p className="text-sm text-zinc-600">
              Link an existing user (role DEVELOPER). Create users via register or
              Django admin, note their numeric user ID.
            </p>
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                inputMode="numeric"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Batch</Label>
              <select
                className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
              >
                <option value="">None</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batch_name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
