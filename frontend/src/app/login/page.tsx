"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowRight, HeartPulse, ShieldCheck } from "lucide-react";

import {
  loginSchema,
  type LoginFormData,
} from "@/features/auth/schemas";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME } from "@/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await loginUser(data);

      const destination =
        ROLE_HOME[user.role as keyof typeof ROLE_HOME];

      router.replace(destination ?? "/login");
    } catch {
      setError("root", {
        message: "Invalid phone number or password.",
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.35),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.2),transparent_40%)]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                  <HeartPulse
                    size={22}
                    className="text-white"
                  />
                </div>

                <span className="text-xl font-bold tracking-tight text-white">
                  HealthOS
                </span>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                Connected healthcare
              </p>

              <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white xl:text-6xl">
                Your health,
                <br />
                connected.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                Manage appointments, medical records, clinical
                information and healthcare communication from one
                secure platform.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Feature text="Secure health data" />
                <Feature text="Connected care" />
                <Feature text="Patient-first" />
              </div>
            </div>

            <p className="text-sm text-slate-500">
              HealthOS healthcare platform
            </p>
          </div>
        </section>

        {/* Login */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                  <HeartPulse
                    size={22}
                    className="text-white"
                  />
                </div>

                <span className="text-xl font-bold text-slate-950">
                  HealthOS
                </span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-semibold text-blue-600">
                Welcome back
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Sign in to HealthOS
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Access your healthcare workspace securely.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Phone number
                </label>

                <input
                  id="phone"
                  {...register("phone")}
                  type="tel"
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                {errors.phone && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  {...register("password")}
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {errors.root && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errors.root.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-sm text-slate-500">
              Don&apos;t have a HealthOS account?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Create one
              </Link>
            </p>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={15} />
              Your healthcare information is protected.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur">
      {text}
    </span>
  );
}