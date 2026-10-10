"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Lock,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { useRegister } from "@/features/auth/hook";
import {
  registerSchema,
  type RegisterFormData,
} from "@/features/auth/schemas";

type Role = "PATIENT" | "DOCTOR";

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();

  const [role, setRole] =
    useState<Role>("PATIENT");

  const [form, setForm] =
    useState<RegisterFormData>({
      phone: "",
      password: "",
      first_name: "",
      last_name: "",
      email: "",
      role: "PATIENT",
      specialization: "",
      qualification: "",
      license_number: "",
    });

  const [error, setError] = useState("");

  function update(
    field: keyof RegisterFormData,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function selectRole(nextRole: Role) {
    setRole(nextRole);

    setForm((current) => ({
      ...current,
      role: nextRole,
    }));
  }

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    const parsed = registerSchema.safeParse(form);

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ??
          "Please check the form.",
      );
      return;
    }

    try {
      const response =
        await registerMutation.mutateAsync({
          phone: parsed.data.phone,
          password: parsed.data.password,
          first_name: parsed.data.first_name.trim(),
          last_name: parsed.data.last_name.trim(),
          email:
            parsed.data.email?.trim() || undefined,
          role: parsed.data.role,

          specialization:
            parsed.data.role === "DOCTOR"
              ? parsed.data.specialization?.trim()
              : undefined,

          qualification:
            parsed.data.role === "DOCTOR"
              ? parsed.data.qualification?.trim()
              : undefined,

          license_number:
            parsed.data.role === "DOCTOR"
              ? parsed.data.license_number?.trim()
              : undefined,
        });

      if (
        response.role === "DOCTOR" &&
        response.verification_status === "PENDING"
      ) {
        router.push("/verification-pending");
        return;
      }

      router.push("/login");
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          data?: {
            detail?: string;
            phone?: string[];
            email?: string[];
            license_number?: string[];
            specialization?: string[];
            qualification?: string[];
          };
        };
      };

      const data = axiosError.response?.data;

      const message =
        data?.detail ||
        data?.phone?.[0] ||
        data?.email?.[0] ||
        data?.license_number?.[0] ||
        data?.specialization?.[0] ||
        data?.qualification?.[0] ||
        "Unable to create your account.";

      setError(message);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-[0.8fr_1.2fr]">
        <section className="hidden bg-slate-900 p-10 text-white lg:block">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-950">
              <Activity size={20} />
            </div>

            <span className="text-lg font-semibold">
              HealthOS
            </span>
          </div>

          <div className="mt-24 max-w-sm">
            <p className="text-sm font-medium text-slate-400">
              Healthcare infrastructure
            </p>

            <h1 className="mt-3 text-4xl font-semibold leading-tight">
              One secure system for every healthcare journey.
            </h1>

            <p className="mt-5 text-sm leading-6 text-slate-400">
              Create your HealthOS account and get access
              to the tools designed for your role.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Secure healthcare identity",
                "Role-based access",
                "Connected clinical workflows",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <CheckCircle2
                    size={17}
                    className="text-emerald-400"
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mx-auto max-w-xl">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Create account
              </p>

              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                Join HealthOS
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Select how you will use HealthOS.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <RoleCard
                active={role === "PATIENT"}
                icon={<UserRound size={20} />}
                title="Patient"
                description="Manage your healthcare"
                onClick={() =>
                  selectRole("PATIENT")
                }
              />

              <RoleCard
                active={role === "DOCTOR"}
                icon={<Stethoscope size={20} />}
                title="Doctor"
                description="Manage clinical care"
                onClick={() =>
                  selectRole("DOCTOR")
                }
              />
            </div>

            {role === "DOCTOR" && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Doctor accounts require verification
                before clinical access is enabled.
              </div>
            )}

            <form
              onSubmit={submit}
              className="mt-7 space-y-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  value={form.first_name}
                  onChange={(value) =>
                    update("first_name", value)
                  }
                />

                <Field
                  label="Last name"
                  value={form.last_name}
                  onChange={(value) =>
                    update("last_name", value)
                  }
                />
              </div>

              <Field
                label="Phone number"
                value={form.phone}
                onChange={(value) =>
                  update("phone", value)
                }
              />

              <Field
                label="Email"
                type="email"
                value={form.email ?? ""}
                onChange={(value) =>
                  update("email", value)
                }
              />

              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={(value) =>
                  update("password", value)
                }
              />

              {role === "DOCTOR" && (
                <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div>
                    <p className="font-medium text-slate-900">
                      Professional information
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      These details will be reviewed during verification.
                    </p>
                  </div>

                  <Field
                    label="Specialization"
                    placeholder="e.g. Cardiology"
                    value={
                      form.specialization ?? ""
                    }
                    onChange={(value) =>
                      update(
                        "specialization",
                        value,
                      )
                    }
                  />

                  <Field
                    label="Qualification"
                    placeholder="e.g. MBBS, MD"
                    value={
                      form.qualification ?? ""
                    }
                    onChange={(value) =>
                      update(
                        "qualification",
                        value,
                      )
                    }
                  />

                  <Field
                    label="Medical license number"
                    value={
                      form.license_number ?? ""
                    }
                    onChange={(value) =>
                      update(
                        "license_number",
                        value,
                      )
                    }
                  />
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  registerMutation.isPending
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {registerMutation.isPending
                  ? "Creating account..."
                  : "Create account"}

                {!registerMutation.isPending && (
                  <ArrowRight size={17} />
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <Lock size={13} />
                Your account is protected by HealthOS authentication.
              </div>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-slate-900 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function RoleCard({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-slate-950 bg-slate-950 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            active
              ? "bg-white/10"
              : "bg-slate-100"
          }`}
        >
          {icon}
        </div>

        {active && (
          <CheckCircle2 size={17} />
        )}
      </div>

      <p className="mt-4 text-sm font-semibold">
        {title}
      </p>

      <p
        className={`mt-1 text-xs ${
          active
            ? "text-slate-300"
            : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
      />
    </label>
  );
}