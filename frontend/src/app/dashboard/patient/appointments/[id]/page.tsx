"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  UserRound,
  XCircle,
} from "lucide-react";

import { RoleRoute } from "@/components/navigation/RoleRoute";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { ROLES } from "@/constants/roles";

import {
  useAppointment,
  useCancelAppointment,
} from "@/features/appointments/hooks";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function statusClasses(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "bg-gray-100 text-gray-800 ring-gray-500/10";

    case "CONFIRMED":
      return "bg-blue-50 text-blue-800 ring-blue-600/10";

    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-900 ring-amber-600/10";

    case "COMPLETED":
      return "bg-emerald-50 text-emerald-800 ring-emerald-600/10";

    case "CANCELLED":
      return "bg-red-50 text-red-800 ring-red-600/10";

    case "NO_SHOW":
      return "bg-orange-50 text-orange-800 ring-orange-600/10";

    default:
      return "bg-gray-100 text-gray-700 ring-gray-500/10";
  }
}

function formatAppointmentType(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default function PatientAppointmentDetailPage() {
  const params = useParams<{ id: string }>();

  const appointmentId = params.id;

  const appointmentQuery =
    useAppointment(appointmentId);

  const cancelMutation =
    useCancelAppointment();

  if (appointmentQuery.isLoading) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <LoadingState message="Loading appointment..." />
      </RoleRoute>
    );
  }

  if (
    appointmentQuery.isError ||
    !appointmentQuery.data
  ) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <ErrorState
          title="Appointment unavailable"
          description="We could not load this appointment."
          onRetry={() => appointmentQuery.refetch()}
        />
      </RoleRoute>
    );
  }

  const appointment =
    appointmentQuery.data;

  const canCancel =
    appointment.status === "SCHEDULED" ||
    appointment.status === "CONFIRMED";

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Cancel this appointment?",
    );

    if (!confirmed) {
      return;
    }

    await cancelMutation.mutateAsync(
      appointment.id,
    );
  };

  return (
    <RoleRoute allowedRoles={[ROLES.PATIENT]}>
      <main className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/dashboard/patient/appointments"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
        >
          <ArrowLeft size={16} />
          Back to appointments
        </Link>

        {/* Header */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Appointment
              </p>

              <h1 className="mt-1 text-2xl font-semibold text-gray-950">
                {formatAppointmentType(
                  appointment.appointment_type,
                )}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Appointment ID:{" "}
                <span className="font-mono text-xs text-gray-600">
                  {appointment.id}
                </span>
              </p>
            </div>

            <span
              className={[
                "w-fit rounded-full px-3 py-1.5",
                "text-xs font-semibold",
                "ring-1 ring-inset",
                statusClasses(appointment.status),
              ].join(" ")}
            >
              {formatStatus(appointment.status)}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoCard
              icon={<CalendarDays size={18} />}
              label="Date"
              value={new Date(
                appointment.scheduled_at,
              ).toLocaleDateString("en-IN", {
                dateStyle: "medium",
              })}
            />

            <InfoCard
              icon={<Clock3 size={18} />}
              label="Time"
              value={new Date(
                appointment.scheduled_at,
              ).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </div>
        </section>

        {/* Doctor */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionTitle
            icon={<UserRound size={18} />}
            title="Doctor"
          />

          <div className="mt-5 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-gray-600 ring-1 ring-gray-200">
              <UserRound size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Doctor
              </p>

              <p className="mt-1 font-mono text-xs text-gray-500">
                {appointment.doctor}
              </p>
            </div>
          </div>
        </section>

        {/* Details */}
        {(appointment.reason ||
          appointment.notes) && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <SectionTitle
              icon={<FileText size={18} />}
              title="Appointment information"
            />

            <div className="mt-5 space-y-5">
              {appointment.reason && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Reason for visit
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {appointment.reason}
                  </p>
                </div>
              )}

              {appointment.notes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Additional notes
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {appointment.notes}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Status */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionTitle
            icon={<CheckCircle2 size={18} />}
            title="Appointment status"
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <StatusStep
              label="Scheduled"
              active
              complete={
                appointment.status !==
                  "SCHEDULED" &&
                appointment.status !==
                  "CANCELLED" &&
                appointment.status !==
                  "NO_SHOW"
              }
            />

            <StatusStep
              label="Confirmed"
              active={
                appointment.status ===
                  "CONFIRMED" ||
                appointment.status ===
                  "IN_PROGRESS" ||
                appointment.status ===
                  "COMPLETED"
              }
              complete={
                appointment.status ===
                  "IN_PROGRESS" ||
                appointment.status ===
                  "COMPLETED"
              }
            />

            <StatusStep
              label="In progress"
              active={
                appointment.status ===
                  "IN_PROGRESS" ||
                appointment.status ===
                  "COMPLETED"
              }
              complete={
                appointment.status ===
                "COMPLETED"
              }
            />

            <StatusStep
              label="Completed"
              active={
                appointment.status ===
                "COMPLETED"
              }
              complete={
                appointment.status ===
                "COMPLETED"
              }
            />
          </div>
        </section>

        {/* Cancel */}
        {canCancel && (
          <section className="flex justify-end">
            <button
              type="button"
              disabled={
                cancelMutation.isPending
              }
              onClick={handleCancel}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle size={17} />

              {cancelMutation.isPending
                ? "Cancelling..."
                : "Cancel appointment"}
            </button>
          </section>
        )}

        {(appointment.status ===
          "CANCELLED" ||
          appointment.status ===
            "NO_SHOW") && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            This appointment is closed and no
            further actions are available.
          </div>
        )}
      </main>
    </RoleRoute>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        {icon}
      </div>

      <h2 className="font-semibold text-gray-950">
        {title}
      </h2>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 ring-1 ring-gray-200">
        {icon}
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function StatusStep({
  label,
  active,
  complete,
}: {
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border p-4",
        active
          ? "border-gray-300 bg-gray-50"
          : "border-gray-200 bg-white",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span
          className={[
            "h-2.5 w-2.5 rounded-full",
            complete || active
              ? "bg-gray-900"
              : "bg-gray-300",
          ].join(" ")}
        />

        <span
          className={[
            "text-sm font-semibold",
            active
              ? "text-gray-900"
              : "text-gray-400",
          ].join(" ")}
        >
          {label}
        </span>
      </div>
    </div>
  );
}