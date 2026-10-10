"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Search,
  Users,
} from "lucide-react";

import { useDoctorAppointments } from "@/features/appointments/hooks";
import { ROLES } from "@/constants/roles";
import { RoleRoute } from "@/components/navigation/RoleRoute";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function getStatusClasses(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-blue-50 text-blue-700 ring-blue-600/10";

    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-700 ring-amber-600/10";

    case "COMPLETED":
      return "bg-green-50 text-green-700 ring-green-600/10";

    default:
      return "bg-gray-100 text-gray-600 ring-gray-500/10";
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  return (
    parts
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "P"
  );
}

export default function DoctorClinicalPage() {
  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch,
  } = useDoctorAppointments();

  const [search, setSearch] = useState("");

  /*
   * Build a unique patient directory from appointments.
   *
   * A patient can have multiple appointments with the doctor,
   * so we deduplicate by patient ID.
   */
  const patients = useMemo(() => {
    const patientMap = new Map<
      string,
      (typeof appointments)[number]
    >();

    for (const appointment of appointments) {
      const existing = patientMap.get(appointment.patient);

      if (
        !existing ||
        new Date(appointment.scheduled_at).getTime() >
          new Date(existing.scheduled_at).getTime()
      ) {
        patientMap.set(
          appointment.patient,
          appointment,
        );
      }
    }

    return Array.from(patientMap.values());
  }, [appointments]);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return patients;
    }

    return patients.filter((patient) => {
      return (
        patient.patient_name
          .toLowerCase()
          .includes(query) ||
        patient.patient_uid
          .toLowerCase()
          .includes(query)
      );
    });
  }, [patients, search]);

  if (isLoading) {
    return (
      <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
        <div className="space-y-6">
          <div>
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-8 w-56 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-100" />
          </div>

          <div className="h-12 animate-pulse rounded-xl bg-gray-100" />

          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        </div>
      </RoleRoute>
    );
  }

  if (isError) {
    return (
      <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Doctor workspace
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-gray-950">
              Patients
            </h1>
          </div>

          <div className="rounded-xl border border-red-200 bg-white p-8">
            <h2 className="font-medium text-gray-900">
              Unable to load patients
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              We couldn&apos;t load your clinical patients.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Try again
            </button>
          </div>
        </div>
      </RoleRoute>
    );
  }

  return (
    <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Doctor workspace
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950">
              Patients
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Access clinical information for patients you have treated.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
              <Users size={18} className="text-gray-600" />
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Patients
              </p>

              <p className="text-lg font-semibold text-gray-950">
                {patients.length}
              </p>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by patient name or HealthOS UID..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
        </section>

        {/* Patient list */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Users size={21} className="text-gray-500" />
              </div>

              <h2 className="mt-4 text-sm font-semibold text-gray-900">
                {search
                  ? "No matching patients"
                  : "No patients yet"}
              </h2>

              <p className="mt-1 max-w-sm text-sm text-gray-500">
                {search
                  ? "Try searching with another name or HealthOS UID."
                  : "Patients with confirmed, active, or completed appointments will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPatients.map((patient) => (
                <Link
                  key={patient.patient}
                  href={`/dashboard/doctor/clinical/patients/${patient.patient}`}
                  className="group block px-5 py-5 transition-colors hover:bg-gray-50 sm:px-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                        {getInitials(
                          patient.patient_name,
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium text-gray-950">
                          {patient.patient_name ||
                            "Patient"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {patient.patient_uid}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={13} />
                            Last appointment
                          </span>

                          <span>
                            {new Date(
                              patient.scheduled_at,
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                dateStyle: "medium",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          "ring-1 ring-inset",
                          getStatusClasses(
                            patient.status,
                          ),
                        ].join(" ")}
                      >
                        {formatStatus(
                          patient.status,
                        )}
                      </span>

                      <ChevronRight
                        size={18}
                        className="text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </RoleRoute>
  );
}