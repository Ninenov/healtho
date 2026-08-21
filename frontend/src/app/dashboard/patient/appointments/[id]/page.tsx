"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { RoleRoute } from "@/components/navigation/RoleRoute";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { ROLES } from "@/constants/roles";
import {
  useAppointment,
  useCancelAppointment,
} from "@/features/appointments/hooks";

export default function AppointmentDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const id = params.id;

  const query = useAppointment(id);
  const cancelMutation = useCancelAppointment();

  if (query.isLoading) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <LoadingState />
      </RoleRoute>
    );
  }

  if (query.isError || !query.data) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <ErrorState
          title="Appointment not found"
          onRetry={() => query.refetch()}
        />
      </RoleRoute>
    );
  }

  const appointment = query.data;

  const canCancel = ![
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
  ].includes(appointment.status);

  const cancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );

    if (!confirmed) return;

    await cancelMutation.mutateAsync(appointment.id);
    router.push("/dashboard/patient/appointments");
  };

  return (
    <RoleRoute allowedRoles={[ROLES.PATIENT]}>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/dashboard/patient/appointments"
          className="text-sm underline"
        >
          ← Back to appointments
        </Link>

        <section className="rounded-xl border bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                {appointment.appointment_type}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {new Date(
                  appointment.scheduled_at,
                ).toLocaleString()}
              </p>
            </div>

            <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
              {appointment.status}
            </span>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Info
              label="Doctor"
              value={appointment.doctor}
            />

            <Info
              label="Appointment type"
              value={appointment.appointment_type}
            />

            <Info
              label="Reason"
              value={appointment.reason || "—"}
            />

            <Info
              label="Notes"
              value={appointment.notes || "—"}
            />
          </div>

          {cancelMutation.isError && (
            <p className="mt-5 text-sm text-red-600">
              Unable to cancel the appointment.
            </p>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={cancel}
              disabled={cancelMutation.isPending}
              className="mt-6 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-50"
            >
              {cancelMutation.isPending
                ? "Cancelling..."
                : "Cancel appointment"}
            </button>
          )}
        </section>
      </div>
    </RoleRoute>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}