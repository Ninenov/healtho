"use client";

import Link from "next/link";
import {
  CalendarDays,
  FileText,
  Bell,
  User,
} from "lucide-react";

import { RoleRoute } from "@/components/navigation/RoleRoute";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { ROLES } from "@/constants/roles";
import { useAuth } from "@/hooks/useAuth";
import { usePatientProfile } from "@/features/patients/hooks";
import { useAppointments } from "@/features/appointments/hooks";

export default function PatientDashboard() {
  const { user } = useAuth();

  const profileQuery = usePatientProfile();
  const appointmentsQuery = useAppointments();

  return (
    <RoleRoute allowedRoles={[ROLES.PATIENT]}>
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-semibold">
            Welcome, {user?.first_name || "Patient"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your health information and appointments.
          </p>
        </section>

        {profileQuery.isLoading || appointmentsQuery.isLoading ? (
          <LoadingState message="Loading your health information..." />
        ) : profileQuery.isError || appointmentsQuery.isError ? (
          <ErrorState
            title="Unable to load dashboard"
            description="Please try again."
            onRetry={() => {
              profileQuery.refetch();
              appointmentsQuery.refetch();
            }}
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                icon={<CalendarDays size={20} />}
                title="Appointments"
                value={String(
                  appointmentsQuery.data?.length ?? 0,
                )}
                href="/dashboard/patient/appointments"
              />

              <DashboardCard
                icon={<FileText size={20} />}
                title="Clinical Records"
                value="View"
                href="/dashboard/patient/records"
              />

              <DashboardCard
                icon={<Bell size={20} />}
                title="Notifications"
                value="View"
                href="/dashboard/patient/notifications"
              />

              <DashboardCard
                icon={<User size={20} />}
                title="Profile"
                value="View"
                href="/dashboard/patient/profile"
              />
            </div>

            <section className="rounded-xl border bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">
                  Upcoming Appointments
                </h2>

                <Link
                  href="/dashboard/patient/appointments"
                  className="text-sm font-medium underline"
                >
                  View all
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {(appointmentsQuery.data ?? [])
                  .filter(
                    (appointment) =>
                      !["COMPLETED", "CANCELLED", "NO_SHOW"].includes(
                        appointment.status,
                      ),
                  )
                  .slice(0, 3)
                  .map((appointment) => (
                    <Link
                      key={appointment.id}
                      href={`/dashboard/patient/appointments/${appointment.id}`}
                      className="block rounded-lg border p-4 transition hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {appointment.appointment_type}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {new Date(
                              appointment.scheduled_at,
                            ).toLocaleString()}
                          </p>
                        </div>

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                          {appointment.status}
                        </span>
                      </div>
                    </Link>
                  ))}

                {(appointmentsQuery.data ?? []).filter(
                  (appointment) =>
                    ![
                      "COMPLETED",
                      "CANCELLED",
                      "NO_SHOW",
                    ].includes(appointment.status),
                ).length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-500">
                    No upcoming appointments.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </RoleRoute>
  );
}

function DashboardCard({
  icon,
  title,
  value,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-white p-5 transition hover:shadow-sm"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
        {icon}
      </div>

      <p className="text-sm text-gray-500">{title}</p>

      <p className="mt-1 text-2xl font-semibold">
        {value}
      </p>
    </Link>
  );
}