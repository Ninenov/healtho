"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  UserRound,
} from "lucide-react";

import { useDoctorAppointments } from "@/features/appointments/hooks";
import { ErrorState } from "@/components/common/ErrorState";

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

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]?.charAt(0).toUpperCase() || "P";
  }

  return (
    `${parts[0]?.charAt(0) ?? ""}${parts[1]?.charAt(0) ?? ""}`
  ).toUpperCase();
}

export default function DoctorAppointmentsPage() {
  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch,
  } = useDoctorAppointments();

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl space-y-6">
        <section>
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-100" />
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-white"
            />
          ))}
        </div>

        <div className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-white" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-6xl">
        <ErrorState
          title="Unable to load appointments"
          description="We could not retrieve your appointments. Please try again."
          onRetry={() => refetch()}
        />
      </main>
    );
  }

  const scheduledCount = appointments.filter(
    (appointment) =>
      appointment.status === "SCHEDULED",
  ).length;

  const confirmedCount = appointments.filter(
    (appointment) =>
      appointment.status === "CONFIRMED",
  ).length;

  const completedCount = appointments.filter(
    (appointment) =>
      appointment.status === "COMPLETED",
  ).length;

  const sortedAppointments = [...appointments].sort(
    (a, b) =>
      new Date(a.scheduled_at).getTime() -
      new Date(b.scheduled_at).getTime(),
  );

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      {/* Page header */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Doctor workspace
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
            Appointments
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Review your patient schedule and open consultations
            when you are ready.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <CalendarDays
            size={18}
            className="text-gray-500"
          />

          <div>
            <p className="text-xs text-gray-500">
              Total appointments
            </p>

            <p className="text-lg font-semibold text-gray-950">
              {appointments.length}
            </p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Scheduled"
          value={scheduledCount}
          icon={<CalendarDays size={18} />}
        />

        <StatCard
          label="Confirmed"
          value={confirmedCount}
          icon={<Clock3 size={18} />}
        />

        <StatCard
          label="Completed"
          value={completedCount}
          icon={<UserRound size={18} />}
        />
      </section>

      {/* Appointment list */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-gray-950">
            Patient appointments
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select an appointment to review its details.
          </p>
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <CalendarDays
                size={22}
                className="text-gray-500"
              />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-950">
              No appointments found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
              Appointments assigned to you will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedAppointments.map((appointment) => {
              const patientName =
                appointment.patient_name ||
                "Patient";

              return (
                <Link
                  key={appointment.id}
                  href={`/dashboard/doctor/appointments/${appointment.id}`}
                  className="group block px-5 py-5 transition hover:bg-gray-50 sm:px-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                        {getInitials(patientName)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-950">
                          {patientName}
                        </p>

                        {appointment.patient_uid && (
                          <p className="mt-1 font-mono text-xs text-gray-400">
                            {appointment.patient_uid}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                          <span>
                            {formatDateTime(
                              appointment.scheduled_at,
                            )}
                          </span>

                          <span className="hidden text-gray-300 sm:inline">
                            •
                          </span>

                          <span>
                            {appointment.appointment_type
                              .replaceAll("_", " ")}
                          </span>
                        </div>
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
                        size={18}
                        className="text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          {icon}
        </div>

        <span className="text-2xl font-semibold text-gray-950">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-medium text-gray-600">
        {label}
      </p>
    </div>
  );
}