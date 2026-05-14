"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login as loginApi } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/utils/apiError";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError("");
    setLoading(true);
    try {
      const data = await loginApi(values.email, values.password);
      setAuth({
        user: data.user,
        access: data.access,
        refresh: data.refresh,
      });
      if (typeof window !== "undefined") {
        if (values.remember) {
          window.localStorage.setItem("devtrack-remember", "1");
        } else {
          window.localStorage.removeItem("devtrack-remember");
        }
      }
      const dest =
        data.user.role === "ADMIN"
          ? "/admin/dashboard"
          : "/developer/dashboard";
      window.location.href = dest;
    } catch (e) {
      setFormError(getApiErrorMessage(e, "Sign in failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-12">
      <Card className="w-full max-w-md border-zinc-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Sign in</CardTitle>
          <p className="text-center text-sm text-zinc-600">
            DevTrack — Training Batch Management
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:bg-zinc-100"
                  onClick={() => setShowPwd(!showPwd)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-red-600">
                  {errors.password.message}
                </p>
              ) : null}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("remember")} />
              Remember me
            </label>

            {formError ? (
              <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">
                {formError}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-zinc-600">
            No account?{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
