"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Plus,
} from "lucide-react";

import { RoleRoute } from "@/components/navigation/RoleRoute";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ROLES } from "@/constants/roles";
import { useAppointments } from "@/features/appointments/hooks";

function statusClasses(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "bg-gray-100 text-gray-800";

    case "CONFIRMED":
      return "bg-blue-50 text-blue-800";

    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-800";

    case "COMPLETED":
      return "bg-emerald-50 text-emerald-800";

    case "CANCELLED":
      return "bg-red-50 text-red-800";

    case "NO_SHOW":
      return "bg-orange-50 text-orange-800";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatType(type: string) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default function PatientAppointmentsPage() {
  const query = useAppointments();

  if (query.isLoading) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <LoadingState message="Loading your appointments..." />
      </RoleRoute>
    );
  }

  if (query.isError) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <ErrorState
          title="Unable to load appointments"
          description="We could not retrieve your appointments."
          onRetry={() => query.refetch()}
        />
      </RoleRoute>
    );
  }

  const appointments = [...(query.data ?? [])].sort(
    (a, b) =>
      new Date(b.scheduled_at).getTime() -
      new Date(a.scheduled_at).getTime(),
  );

  return (
    <RoleRoute allowedRoles={[ROLES.PATIENT]}>
      <main className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Patient workspace
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
              My appointments
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              View and manage your healthcare appointments.
            </p>
          </div>

          <Link
            href="/dashboard/patient/appointments/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <Plus size={17} />
            Book appointment
          </Link>
        </header>

        {appointments.length === 0 ? (
          <EmptyState
            title="No appointments"
            description="You do not have any appointments yet."
          />
        ) : (
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="divide-y divide-gray-100">
              {appointments.map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/dashboard/patient/appointments/${appointment.id}`}
                  className="group block p-5 transition hover:bg-gray-50 sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600">
                        <CalendarDays size={19} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-gray-950">
                            {formatType(
                              appointment.appointment_type,
                            )}
                          </p>

                          <span
                            className={[
                              "rounded-full px-2.5 py-1 text-xs font-semibold",
                              statusClasses(
                                appointment.status,
                              ),
                            ].join(" ")}
                          >
                            {formatStatus(
                              appointment.status,
                            )}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                          Doctor ID:{" "}
                          <span className="font-mono text-xs text-gray-600">
                            {appointment.doctor}
                          </span>
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <span>
                            {new Date(
                              appointment.scheduled_at,
                            ).toLocaleDateString("en-IN", {
                              dateStyle: "medium",
                            })}
                          </span>

                          <span className="text-gray-300">
                            •
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={14} />
                            {new Date(
                              appointment.scheduled_at,
                            ).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {appointment.reason && (
                          <p className="mt-2 max-w-2xl truncate text-sm text-gray-600">
                            {appointment.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <ArrowRight
                      size={18}
                      className="shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </RoleRoute>
  );
}