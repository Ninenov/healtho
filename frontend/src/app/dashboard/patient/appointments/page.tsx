"use client";

import Link from "next/link";

import { RoleRoute } from "@/components/navigation/RoleRoute";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ROLES } from "@/constants/roles";
import { useAppointments } from "@/features/appointments/hooks";

export default function PatientAppointmentsPage() {
  const query = useAppointments();

  return (
    <RoleRoute allowedRoles={[ROLES.PATIENT]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Appointments
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage your appointments.
          </p>
        </div>

        {query.isLoading && <LoadingState />}

        {query.isError && (
          <ErrorState
            onRetry={() => query.refetch()}
          />
        )}

        {query.isSuccess &&
          query.data.length === 0 && (
            <EmptyState
              title="No appointments"
              description="You don't have any appointments yet."
            />
          )}

        {query.isSuccess && query.data.length > 0 && (
          <div className="space-y-3">
            {query.data.map((appointment) => (
              <Link
                key={appointment.id}
                href={`/dashboard/patient/appointments/${appointment.id}`}
                className="block rounded-xl border bg-white p-5 transition hover:shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-medium">
                      {appointment.appointment_type}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(
                        appointment.scheduled_at,
                      ).toLocaleString()}
                    </p>

                    {appointment.reason && (
                      <p className="mt-2 text-sm text-gray-600">
                        {appointment.reason}
                      </p>
                    )}
                  </div>

                  <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                    {appointment.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </RoleRoute>
  );
}