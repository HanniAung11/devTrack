"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register as registerApi } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/utils/apiError";

const schema = z
  .object({
    full_name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Valid email required"),
    password: z.string().min(8, "At least 8 characters"),
    confirm_password: z.string(),
    role: z.enum(["ADMIN", "DEVELOPER"]),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords must match",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
      role: "DEVELOPER",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError("");
    setLoading(true);
    try {
      const data = await registerApi({
        full_name: values.full_name,
        email: values.email,
        password: values.password,
        confirm_password: values.confirm_password,
        role: values.role,
      });
      setAuth({
        user: data.user,
        access: data.access,
        refresh: data.refresh,
      });
      const dest =
        data.user.role === "ADMIN"
          ? "/admin/dashboard"
          : "/developer/dashboard";
      window.location.href = dest;
    } catch (e) {
      setFormError(getApiErrorMessage(e, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-12">
      <Card className="w-full max-w-md border-zinc-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create account</CardTitle>
          <p className="text-center text-sm text-zinc-600">
            Register as an admin or developer trainee.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name ? (
                <p className="text-xs text-red-600">{errors.full_name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                {...register("role")}
              >
                <option value="DEVELOPER">Developer (trainee)</option>
                <option value="ADMIN">Admin / Mentor</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password ? (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input
                id="confirm_password"
                type="password"
                {...register("confirm_password")}
              />
              {errors.confirm_password ? (
                <p className="text-xs text-red-600">
                  {errors.confirm_password.message}
                </p>
              ) : null}
            </div>

            {formError ? (
              <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">
                {formError}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-zinc-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
