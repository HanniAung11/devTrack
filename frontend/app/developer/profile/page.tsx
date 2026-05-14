"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfile, updateProfile } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
export default function DeveloperProfilePage() {
  const setAuthPatch = useAuthStore((s) => s.setAuth);
  const tokens = useAuthStore((s) => ({
    access: s.accessToken,
    refresh: s.refreshToken,
  }));

  const [batchInfo, setBatchInfo] = useState<{
    name: string;
    mentor: string;
    start: string;
    end: string;
  } | null>(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { email: "", full_name: "", phone: "" },
  });

  useEffect(() => {
    void getProfile().then((p) => {
      reset({
        email: p.user.email,
        full_name: p.developer?.full_name ?? "",
        phone: p.developer?.phone ?? "",
      });
      if (p.developer?.batch_name) {
        setBatchInfo({
          name: p.developer.batch_name,
          mentor: p.developer.mentor_name ?? "—",
          start: "",
          end: "",
        });
      }
    });
  }, [reset]);

  const onSave = async (values: { email: string; full_name: string; phone: string }) => {
    const res = await updateProfile(values);
    if (tokens.access && tokens.refresh) {
      setAuthPatch({ user: res.user, access: tokens.access, refresh: tokens.refresh });
    }
    toast.success("Profile updated");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Update your contact details." />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSave)} className="max-w-lg space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
            </div>
            <div>
              <Label>Full name</Label>
              <Input {...register("full_name")} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input {...register("phone")} />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>
      {batchInfo ? (
        <Card>
          <CardContent className="space-y-2 pt-6 text-sm">
            <p>
              <strong>Batch:</strong> {batchInfo.name}
            </p>
            <p>
              <strong>Mentor:</strong> {batchInfo.mentor}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
