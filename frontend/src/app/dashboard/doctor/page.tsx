"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Users,
  ChevronRight,
} from "lucide-react";
import { LoadingState } from "@/components/common/LoadingState";
import { RoleRoute } from "@/components/navigation/RoleRoute";
import { ErrorState } from "@/components/common/ErrorState";
import { ROLES } from "@/constants/roles";
import { useDoctorAppointments } from "@/features/appointments/hooks";

function getStatusClasses(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-blue-50 text-blue-800 ring-blue-700/10";

    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-900 ring-amber-700/10";

    case "COMPLETED":
      return "bg-emerald-50 text-emerald-800 ring-emerald-700/10";

    case "CANCELLED":
      return "bg-red-50 text-red-800 ring-red-700/10";

    case "NO_SHOW":
      return "bg-orange-50 text-orange-800 ring-orange-700/10";

    case "SCHEDULED":
      return "bg-slate-100 text-slate-800 ring-slate-600/10";

    default:
      return "bg-gray-100 text-gray-800 ring-gray-600/10";
  }
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isToday(value: string) {
  const date = new Date(value);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isFuture(value: string) {
  return new Date(value).getTime() > Date.now();
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]?.charAt(0).toUpperCase() || "P";
  }

  return (
    `${parts[0]?.charAt(0) ?? ""}${parts[1]?.charAt(0) ?? ""}`
  ).toUpperCase();
}

export default function DoctorDashboardPage() {
  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch,
  } = useDoctorAppointments();

  if (isLoading) {
    return (
      <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
        <main className="mx-auto max-w-6xl space-y-6">
          <LoadingState message="Loading your dashboard..." />
        </main>
      </RoleRoute>
    );
  }

  if (isError) {
    return (
      <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
        <main className="mx-auto max-w-6xl">
          <ErrorState
            title="Unable to load dashboard"
            description="We could not retrieve your appointments."
            onRetry={() => refetch()}
          />
        </main>
      </RoleRoute>
    );
  }

  const todayAppointments = appointments.filter(
    (appointment) =>
      isToday(appointment.scheduled_at) &&
      appointment.status !== "CANCELLED",
  );

  const upcomingAppointments = appointments
    .filter(
      (appointment) =>
        isFuture(appointment.scheduled_at) &&
        appointment.status !== "CANCELLED" &&
        appointment.status !== "NO_SHOW",
    )
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() -
        new Date(b.scheduled_at).getTime(),
    );

  const completedAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "COMPLETED",
  );

  const activeAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "CONFIRMED" ||
      appointment.status === "IN_PROGRESS",
  );

  const uniquePatients = new Set(
    appointments.map(
      (appointment) => appointment.patient,
    ),
  );

  const nextAppointment =
    upcomingAppointments[0] ?? null;

  const recentAppointments = [...appointments]
    .sort(
      (a, b) =>
        new Date(b.scheduled_at).getTime() -
        new Date(a.scheduled_at).getTime(),
    )
    .slice(0, 5);

  return (
    <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
      <main className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Doctor workspace
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
              Dashboard
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Review your schedule, patients, and ongoing
              clinical work.
            </p>
          </div>

          <Link
            href="/dashboard/doctor/appointments"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            View appointments
            <ArrowRight size={16} />
          </Link>
        </section>

        {/* KPI cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<CalendarDays size={18} />}
            label="Today's appointments"
            value={todayAppointments.length}
          />

          <StatCard
            icon={<Clock3 size={18} />}
            label="Upcoming"
            value={upcomingAppointments.length}
          />

          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Completed"
            value={completedAppointments.length}
          />

          <StatCard
            icon={<Users size={18} />}
            label="Patients"
            value={uniquePatients.size}
          />
        </section>

        {/* Main grid */}
        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          {/* Next appointment */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-950">
                    Next appointment
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Your next scheduled patient.
                  </p>
                </div>

                <Activity
                  size={19}
                  className="text-gray-500"
                />
              </div>
            </div>

            {nextAppointment ? (
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                      {getInitials(
                        nextAppointment.patient_name ||
                          "Patient",
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-950">
                        {nextAppointment.patient_name ||
                          "Patient"}
                      </p>

                      {nextAppointment.patient_uid && (
                        <p className="mt-1 font-mono text-xs text-gray-400">
                          {nextAppointment.patient_uid}
                        </p>
                      )}

                      <p className="mt-2 text-sm text-gray-600">
                        {nextAppointment.appointment_type.replaceAll(
                          "_",
                          " ",
                        )}
                      </p>
                    </div>
                  </div>

                  <span
                    className={[
                      "w-fit rounded-full px-3 py-1.5",
                      "text-xs font-semibold",
                      "ring-1 ring-inset",
                      getStatusClasses(
                        nextAppointment.status,
                      ),
                    ].join(" ")}
                  >
                    {formatStatus(
                      nextAppointment.status,
                    )}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    label="Date and time"
                    value={formatDateTime(
                      nextAppointment.scheduled_at,
                    )}
                  />

                  <InfoItem
                    label="Reason"
                    value={
                      nextAppointment.reason ||
                      "No reason provided"
                    }
                  />
                </div>

                <Link
                  href={`/dashboard/doctor/appointments/${nextAppointment.id}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                >
                  Open appointment
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <EmptyPanel
                icon={<CalendarDays size={20} />}
                title="No upcoming appointments"
                description="Your next scheduled appointment will appear here."
              />
            )}
          </div>

          {/* Today's overview */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-950">
                Today&apos;s overview
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current workload.
              </p>
            </div>

            <div className="space-y-1 p-5">
              <OverviewRow
                label="Today"
                value={todayAppointments.length}
              />

              <OverviewRow
                label="Active"
                value={activeAppointments.length}
              />

              <OverviewRow
                label="Completed"
                value={completedAppointments.length}
              />

              <OverviewRow
                label="Total patients"
                value={uniquePatients.size}
              />
            </div>
          </div>
        </section>

        {/* Recent appointments */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-semibold text-gray-950">
                Recent appointments
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your latest patient activity.
              </p>
            </div>

            <Link
              href="/dashboard/doctor/appointments"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-950"
            >
              View all
              <ChevronRight size={16} />
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <EmptyPanel
              icon={<CalendarDays size={20} />}
              title="No appointment activity"
              description="Your appointment activity will appear here."
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {recentAppointments.map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/dashboard/doctor/appointments/${appointment.id}`}
                  className="group block px-5 py-4 transition hover:bg-gray-50 sm:px-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                        {getInitials(
                          appointment.patient_name ||
                            "Patient",
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-950">
                          {appointment.patient_name ||
                            "Patient"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {formatDateTime(
                            appointment.scheduled_at,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span
                        className={[
                          "rounded-full px-3 py-1.5",
                          "text-xs font-semibold",
                          "ring-1 ring-inset",
                          getStatusClasses(
                            appointment.status,
                          ),
                        ].join(" ")}
                      >
                        {formatStatus(
                          appointment.status,
                        )}
                      </span>

                      <ChevronRight
                        size={17}
                        className="text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <div className="mb-3">
            <h2 className="font-semibold text-gray-950">
              Quick actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Common tasks for your clinical workspace.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <QuickAction
              href="/dashboard/doctor/appointments"
              title="Appointments"
              description="Review your schedule"
              icon={<CalendarDays size={19} />}
            />

            <QuickAction
              href="/dashboard/doctor/availability"
              title="Availability"
              description="Manage working hours"
              icon={<Clock3 size={19} />}
            />

            <QuickAction
              href="/dashboard/doctor/clinical"
              title="Clinical"
              description="Access clinical workspace"
              icon={<Activity size={19} />}
            />
          </div>
        </section>
      </main>
    </RoleRoute>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          {icon}
        </div>

        <p className="text-2xl font-semibold text-gray-950">
          {value}
        </p>
      </div>

      <p className="mt-4 text-sm font-medium text-gray-600">
        {label}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium leading-5 text-gray-800">
        {value}
      </p>
    </div>
  );
}

function OverviewRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <span className="text-sm text-gray-600">
        {label}
      </span>

      <span className="text-sm font-semibold text-gray-950">
        {value}
      </span>
    </div>
  );
}

function EmptyPanel({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-950">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        {icon}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-950">
            {title}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        </div>

        <ArrowRight
          size={17}
          className="shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700"
        />
      </div>
    </Link>
  );
}