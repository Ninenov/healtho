"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";

import { useDoctorAppointments } from "@/features/appointments/hooks";

function getStatusClasses(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-blue-50 text-blue-700 ring-blue-600/10";

    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-700 ring-amber-600/10";

    case "COMPLETED":
      return "bg-green-50 text-green-700 ring-green-600/10";

    case "CANCELLED":
      return "bg-red-50 text-red-700 ring-red-600/10";

    default:
      return "bg-gray-100 text-gray-700 ring-gray-500/10";
  }
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
      <div className="space-y-6">
        <div>
          <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="h-32 animate-pulse rounded-xl border border-gray-200 bg-white" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
            Appointments
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your patient appointments.
          </p>
        </section>

        <section className="rounded-xl border border-red-200 bg-white p-8">
          <h2 className="font-medium text-gray-900">
            Unable to load appointments
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Check your connection and try again.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Try again
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Doctor workspace
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950">
            Appointments
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your patient appointments.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2.5">
          <p className="text-xs text-gray-500">
            Total appointments
          </p>

          <p className="text-lg font-semibold text-gray-950">
            {appointments.length}
          </p>
        </div>
      </section>

      {/* Appointment list */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <CalendarDays
                size={22}
                className="text-gray-500"
              />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-gray-900">
              No appointments yet
            </h2>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Your scheduled patient appointments will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((appointment) => (
              <Link
                key={appointment.id}
                href={`/dashboard/doctor/appointments/${appointment.id}`}
                className="group block px-5 py-5 transition-colors hover:bg-gray-50 sm:px-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                      P
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium text-gray-950">
                        Patient
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(
                          appointment.scheduled_at,
                        ).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        "w-fit rounded-full px-2.5 py-1 text-xs font-medium",
                        "ring-1 ring-inset",
                        getStatusClasses(appointment.status),
                      ].join(" ")}
                    >
                      {appointment.status.replaceAll(
                        "_",
                        " ",
                      )}
                    </span>

                    <ChevronRight
                      size={18}
                      className="text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-700"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}