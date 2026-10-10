"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FileText,
  HeartPulse,
  UserRound,
} from "lucide-react";

import { RoleRoute } from "@/components/navigation/RoleRoute";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { ROLES } from "@/constants/roles";

import { usePatient } from "@/features/patients/hooks";
import { useDoctorAppointments } from "@/features/appointments/hooks";
import { usePatientClinicalContext } from "@/features/clinical/hooks";

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

function formatDate(value: string | null) {
  if (!value) return "Not provided";

  return new Date(value).toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getInitials(
  firstName: string,
  lastName: string,
) {
  return (
    `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`
  ).toUpperCase() || "P";
}

function isUpcoming(
  scheduledAt: string,
  status: string,
) {
  return (
    new Date(scheduledAt).getTime() > Date.now() &&
    status !== "CANCELLED" &&
    status !== "NO_SHOW" &&
    status !== "COMPLETED"
  );
}

export default function DoctorPatientPage() {
  const params = useParams<{ id: string }>();
  const patientId = params.id;

  const patientQuery = usePatient(patientId);
  const clinicalQuery =
    usePatientClinicalContext(patientId);
  const appointmentsQuery =
    useDoctorAppointments();

  if (patientQuery.isLoading) {
    return (
      <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
        <LoadingState message="Loading patient..." />
      </RoleRoute>
    );
  }

  if (
    patientQuery.isError ||
    !patientQuery.data
  ) {
    return (
      <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
        <ErrorState
          title="Unable to load patient"
          description="The patient could not be loaded or you do not have clinical access."
          onRetry={() => patientQuery.refetch()}
        />
      </RoleRoute>
    );
  }

  const patient = patientQuery.data;
  const clinical = clinicalQuery.data;

  const appointments = (
    appointmentsQuery.data ?? []
  )
    .filter(
      (appointment) =>
        appointment.patient === patientId,
    )
    .sort(
      (a, b) =>
        new Date(b.scheduled_at).getTime() -
        new Date(a.scheduled_at).getTime(),
    );

  const upcomingAppointment =
    appointments.find((appointment) =>
      isUpcoming(
        appointment.scheduled_at,
        appointment.status,
      ),
    );

  return (
    <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
      <main className="mx-auto max-w-6xl space-y-6">
        {/* Back navigation */}
        <Link
          href="/dashboard/doctor/appointments"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
        >
          <ArrowLeft size={16} />
          Back to appointments
        </Link>

        {/* Patient header */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-700">
                {getInitials(
                  patient.first_name,
                  patient.last_name,
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Patient profile
                </p>

                <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-gray-950">
                  {patient.first_name}{" "}
                  {patient.last_name}
                </h1>

                <p className="mt-1 font-mono text-xs text-gray-400">
                  {patient.healthos_uid}
                </p>
              </div>
            </div>

            {upcomingAppointment && (
              <Link
                href={`/dashboard/doctor/appointments/${upcomingAppointment.id}/clinical`}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Open consultation
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </section>

        {/* Patient information */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionHeader
            icon={<UserRound size={18} />}
            title="Patient information"
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              label="Date of birth"
              value={formatDate(
                patient.date_of_birth,
              )}
            />

            <InfoCard
              label="Gender"
              value={patient.gender || "Not provided"}
            />

            <InfoCard
              label="Blood group"
              value={
                patient.blood_group ||
                "Not provided"
              }
            />

            <InfoCard
              label="Height"
              value={
                patient.height_cm
                  ? `${patient.height_cm} cm`
                  : "Not provided"
              }
            />

            <InfoCard
              label="Weight"
              value={
                patient.weight_kg
                  ? `${patient.weight_kg} kg`
                  : "Not provided"
              }
            />
          </div>
        </section>

        {/* Clinical summary */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Allergies */}
          <ClinicalSection
            icon={<AlertTriangle size={18} />}
            title="Allergies"
            count={clinical?.allergies.length ?? 0}
          >
            {!clinical ||
            clinical.allergies.length === 0 ? (
              <EmptyState
                text="No allergies recorded."
              />
            ) : (
              <div className="space-y-3">
                {clinical.allergies.map(
                  (allergy) => (
                    <div
                      key={allergy.id}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-gray-950">
                            {allergy.allergen}
                          </p>

                          {allergy.reaction && (
                            <p className="mt-1 text-sm text-gray-600">
                              Reaction:{" "}
                              {allergy.reaction}
                            </p>
                          )}
                        </div>

                        {allergy.severity && (
                          <span className="w-fit rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 ring-1 ring-inset ring-red-700/10">
                            {allergy.severity}
                          </span>
                        )}
                      </div>

                      {allergy.notes && (
                        <p className="mt-3 border-t border-gray-200 pt-3 text-sm leading-6 text-gray-600">
                          {allergy.notes}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}
          </ClinicalSection>

          {/* Conditions */}
          <ClinicalSection
            icon={<HeartPulse size={18} />}
            title="Medical conditions"
            count={
              clinical?.medical_conditions.length ??
              0
            }
          >
            {!clinical ||
            clinical.medical_conditions.length ===
              0 ? (
              <EmptyState
                text="No medical conditions recorded."
              />
            ) : (
              <div className="space-y-3">
                {clinical.medical_conditions.map(
                  (condition) => (
                    <div
                      key={condition.id}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-gray-950">
                            {condition.name}
                          </p>

                          {condition.diagnosed_on && (
                            <p className="mt-1 text-sm text-gray-500">
                              Diagnosed{" "}
                              {formatDate(
                                condition.diagnosed_on,
                              )}
                            </p>
                          )}
                        </div>

                        {condition.status && (
                          <span className="w-fit rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-600/10">
                            {condition.status}
                          </span>
                        )}
                      </div>

                      {condition.notes && (
                        <p className="mt-3 border-t border-gray-200 pt-3 text-sm leading-6 text-gray-600">
                          {condition.notes}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}
          </ClinicalSection>
        </section>

        {/* Medical records */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <SectionHeader
              icon={<FileText size={18} />}
              title="Medical records"
              count={
                clinical?.medical_records.length ??
                0
              }
            />
          </div>

          <div className="p-6">
            {!clinical ||
            clinical.medical_records.length ===
              0 ? (
              <EmptyState text="No medical records available." />
            ) : (
              <div className="space-y-3">
                {clinical.medical_records.map(
                  (record) => (
                    <div
                      key={record.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 transition hover:bg-gray-50"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-950">
                            {record.title}
                          </p>

                          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                            {record.record_type}
                          </p>
                        </div>

                        <p className="shrink-0 text-xs text-gray-500">
                          {formatDate(
                            record.record_date,
                          )}
                        </p>
                      </div>

                      {record.description && (
                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          {record.description}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </section>

        {/* Appointment history */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <SectionHeader
              icon={<CalendarDays size={18} />}
              title="Appointment history"
              count={appointments.length}
            />
          </div>

          {appointments.length === 0 ? (
            <div className="p-6">
              <EmptyState text="No appointments found for this patient." />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map(
                (appointment) => (
                  <Link
                    key={appointment.id}
                    href={`/dashboard/doctor/appointments/${appointment.id}`}
                    className="group block px-6 py-5 transition hover:bg-gray-50"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-950">
                          {appointment.appointment_type.replaceAll(
                            "_",
                            " ",
                          )}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {formatDateTime(
                            appointment.scheduled_at,
                          )}
                        </p>

                        {appointment.reason && (
                          <p className="mt-2 text-sm text-gray-600">
                            {appointment.reason}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={[
                            "rounded-full px-3 py-1.5",
                            "text-xs font-semibold",
                            "ring-1 ring-inset",
                            statusClasses(
                              appointment.status,
                            ),
                          ].join(" ")}
                        >
                          {formatStatus(
                            appointment.status,
                          )}
                        </span>

                        <ArrowRight
                          size={17}
                          className="text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700"
                        />
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          )}
        </section>

        {/* Clinical loading/error note */}
        {clinicalQuery.isLoading && (
          <p className="text-center text-sm text-gray-400">
            Loading clinical information...
          </p>
        )}

        {clinicalQuery.isError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Clinical information could not be loaded.
            Appointment information remains available.
          </div>
        )}
      </main>
    </RoleRoute>
  );
}

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        {icon}
      </div>

      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-gray-950">
          {title}
        </h2>

        {typeof count === "number" && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
            {count}
          </span>
        )}
      </div>
    </div>
  );
}

function ClinicalSection({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <SectionHeader
        icon={icon}
        title={title}
        count={count}
      />

      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoCard({
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

      <p className="mt-2 text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
      <p className="text-sm text-gray-500">
        {text}
      </p>
    </div>
  );
}