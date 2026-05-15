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
import { formatDate } from "@/utils/formatDate";
export default function DeveloperProfilePage() {
  const setAuthPatch = useAuthStore((s) => s.setAuth);

  const [batchInfo, setBatchInfo] = useState<{
    name: string;
    mentor: string;
    start: string;
    end: string;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { email: "", full_name: "", phone: "" },
  });

  useEffect(() => {
    setLoadError(null);
    void getProfile()
      .then((p) => {
        reset({
          email: p.user.email,
          full_name: p.developer?.full_name ?? "",
          phone: p.developer?.phone ?? "",
        });
        if (p.developer?.batch_name) {
          setBatchInfo({
            name: p.developer.batch_name,
            mentor: p.developer.mentor_name ?? "—",
            start: p.developer.batch_start_date
              ? formatDate(p.developer.batch_start_date)
              : "—",
            end: p.developer.batch_end_date
              ? formatDate(p.developer.batch_end_date)
              : "—",
          });
        } else {
          setBatchInfo(null);
        }
      })
      .catch(() => {
        setLoadError("Could not load profile. Try signing in again.");
        toast.error("Could not load profile");
      });
  }, [reset]);

  const onSave = async (values: { email: string; full_name: string; phone: string }) => {
    try {
      const res = await updateProfile(values);
      const { accessToken, refreshToken } = useAuthStore.getState();
      if (accessToken && refreshToken) {
        setAuthPatch({ user: res.user, access: accessToken, refresh: refreshToken });
      }
      toast.success("Profile updated");
      if (res.developer?.batch_name) {
        setBatchInfo({
          name: res.developer.batch_name,
          mentor: res.developer.mentor_name ?? "—",
          start: res.developer.batch_start_date
            ? formatDate(res.developer.batch_start_date)
            : "—",
          end: res.developer.batch_end_date
            ? formatDate(res.developer.batch_end_date)
            : "—",
        });
      } else {
        setBatchInfo(null);
      }
      reset({
        email: res.user.email,
        full_name: res.developer?.full_name ?? "",
        phone: res.developer?.phone ?? "",
      });
    } catch {
      toast.error("Could not save profile");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Update your contact details." />
      {loadError ? (
        <p className="text-sm text-red-600" role="alert">
          {loadError}
        </p>
      ) : null}
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
            <p>
              <strong>Runs:</strong> {batchInfo.start} — {batchInfo.end}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
