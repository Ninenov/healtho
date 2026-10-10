"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  UserRound,
  XCircle,
} from "lucide-react";

import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

import {
  useAppointment,
  useCancelAppointment,
  useConfirmAppointment,
  useNoShowAppointment,
  useStartAppointment,
} from "@/features/appointments/hooks";

function statusClasses(status: string) {
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

    default:
      return "bg-gray-100 text-gray-800 ring-gray-600/10";
  }
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

export default function DoctorAppointmentDetailPage() {
  const params = useParams<{ id: string }>();
  const appointmentId = params.id;

  const {
    data: appointment,
    isLoading,
    isError,
    refetch,
  } = useAppointment(appointmentId);

  const confirmMutation =
    useConfirmAppointment();

  const startMutation =
    useStartAppointment();

  const noShowMutation =
    useNoShowAppointment();

  const cancelMutation =
    useCancelAppointment();

  if (isLoading) {
    return (
      <LoadingState message="Loading appointment..." />
    );
  }

  if (isError || !appointment) {
    return (
      <main className="p-6">
        <ErrorState
          title="Appointment unavailable"
          description="The appointment could not be loaded."
          onRetry={() => refetch()}
        />
      </main>
    );
  }

  const isPending =
    confirmMutation.isPending ||
    startMutation.isPending ||
    noShowMutation.isPending ||
    cancelMutation.isPending;

  const handleConfirm = async () => {
    await confirmMutation.mutateAsync(
      appointmentId,
    );
  };

  const handleStart = async () => {
    await startMutation.mutateAsync(
      appointmentId,
    );
  };

  const handleNoShow = async () => {
    const confirmed = window.confirm(
      "Mark this patient as a no-show?",
    );

    if (!confirmed) return;

    await noShowMutation.mutateAsync(
      appointmentId,
    );
  };

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Cancel this appointment?",
    );

    if (!confirmed) return;

    await cancelMutation.mutateAsync(
      appointmentId,
    );
  };

  const canConfirm =
    appointment.status === "SCHEDULED";

  const canStart =
    appointment.status === "CONFIRMED";

  const canOpenClinical =
    appointment.status === "IN_PROGRESS";

  const canCancel =
    appointment.status === "SCHEDULED" ||
    appointment.status === "CONFIRMED";

  const canNoShow =
    appointment.status === "CONFIRMED";

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/doctor/appointments"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
      >
        <ArrowLeft size={16} />
        Back to appointments
      </Link>

      {/* Header */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
              <UserRound size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Appointment
              </p>

              <h1 className="mt-1 text-2xl font-semibold text-gray-950">
                {appointment.patient_name ||
                  "Patient"}
              </h1>

              <p className="mt-1 font-mono text-xs text-gray-400">
                {appointment.patient_uid}
              </p>
            </div>
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
      </section>

      {/* Appointment information */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={<CalendarDays size={18} />}
          title="Appointment details"
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <InfoCard
            icon={<CalendarDays size={17} />}
            label="Scheduled for"
            value={formatDateTime(
              appointment.scheduled_at,
            )}
          />

          <InfoCard
            icon={<Clock3 size={17} />}
            label="Appointment type"
            value={
              appointment.appointment_type.replaceAll(
                "_",
                " ",
              ) || "General consultation"
            }
          />
        </div>

        {appointment.reason && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Reason for visit
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              {appointment.reason}
            </p>
          </div>
        )}

        {appointment.notes && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Appointment notes
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              {appointment.notes}
            </p>
          </div>
        )}
      </section>

      {/* Lifecycle */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={<CheckCircle2 size={18} />}
          title="Appointment workflow"
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <WorkflowStep
            label="Scheduled"
            active
            completed={
              appointment.status !== "SCHEDULED"
            }
          />

          <WorkflowStep
            label="Confirmed"
            active={
              appointment.status ===
                "CONFIRMED" ||
              appointment.status ===
                "IN_PROGRESS" ||
              appointment.status ===
                "COMPLETED"
            }
            completed={
              appointment.status ===
                "IN_PROGRESS" ||
              appointment.status ===
                "COMPLETED"
            }
          />

          <WorkflowStep
            label="In progress"
            active={
              appointment.status ===
                "IN_PROGRESS" ||
              appointment.status ===
                "COMPLETED"
            }
            completed={
              appointment.status ===
              "COMPLETED"
            }
          />

          <WorkflowStep
            label="Completed"
            active={
              appointment.status ===
              "COMPLETED"
            }
            completed={
              appointment.status ===
              "COMPLETED"
            }
          />
        </div>
      </section>

      {/* Actions */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={<FileText size={18} />}
          title="Actions"
        />

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {canConfirm && (
            <ActionButton
              onClick={handleConfirm}
              disabled={isPending}
              primary
            >
              <CheckCircle2 size={17} />
              {confirmMutation.isPending
                ? "Confirming..."
                : "Confirm appointment"}
            </ActionButton>
          )}

          {canStart && (
            <ActionButton
              onClick={handleStart}
              disabled={isPending}
              primary
            >
              <Clock3 size={17} />
              {startMutation.isPending
                ? "Starting..."
                : "Start consultation"}
            </ActionButton>
          )}

          {canOpenClinical && (
            <Link
              href={`/dashboard/doctor/appointments/${appointmentId}/clinical`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Open consultation
              <ArrowRight size={17} />
            </Link>
          )}

          {appointment.status ===
            "COMPLETED" && (
            <Link
              href={`/dashboard/doctor/appointments/${appointmentId}/clinical`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              View consultation
              <ArrowRight size={17} />
            </Link>
          )}

          {canNoShow && (
            <ActionButton
              onClick={handleNoShow}
              disabled={isPending}
            >
              <AlertCircle size={17} />
              {noShowMutation.isPending
                ? "Updating..."
                : "Mark no-show"}
            </ActionButton>
          )}

          {canCancel && (
            <ActionButton
              onClick={handleCancel}
              disabled={isPending}
              danger
            >
              <XCircle size={17} />
              {cancelMutation.isPending
                ? "Cancelling..."
                : "Cancel appointment"}
            </ActionButton>
          )}
        </div>
      </section>

      {/* Terminal status */}
      {(appointment.status === "CANCELLED" ||
        appointment.status === "NO_SHOW") && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          This appointment is closed and no further
          lifecycle actions are available.
        </div>
      )}
    </main>
  );
}

function SectionHeader({
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
      <div className="flex items-center gap-2 text-gray-500">
        {icon}

        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function WorkflowStep({
  label,
  active,
  completed,
}: {
  label: string;
  active: boolean;
  completed: boolean;
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
        <div
          className={[
            "h-2.5 w-2.5 rounded-full",
            completed || active
              ? "bg-gray-900"
              : "bg-gray-300",
          ].join(" ")}
        />

        <p
          className={[
            "text-sm font-semibold",
            active
              ? "text-gray-900"
              : "text-gray-400",
          ].join(" ")}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  primary = false,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5",
        "text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        primary
          ? "bg-gray-950 text-white hover:bg-gray-800"
          : danger
            ? "border border-red-200 bg-white text-red-700 hover:bg-red-50"
            : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}