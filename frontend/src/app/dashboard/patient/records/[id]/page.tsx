"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
} from "lucide-react";

import { RoleRoute } from "@/components/navigation/RoleRoute";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { ROLES } from "@/constants/roles";
import { useMedicalRecord } from "@/features/records/hooks";

function formatType(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    dateStyle: "long",
  });
}

export default function MedicalRecordDetailPage() {
  const params = useParams<{ id: string }>();
  const recordId = params.id;

  const query = useMedicalRecord(recordId);

  if (query.isLoading) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <LoadingState message="Loading medical record..." />
      </RoleRoute>
    );
  }

  if (query.isError || !query.data) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <ErrorState
          title="Record unavailable"
          description="The medical record could not be loaded."
          onRetry={() => query.refetch()}
        />
      </RoleRoute>
    );
  }

  const record = query.data;

  return (
    <RoleRoute allowedRoles={[ROLES.PATIENT]}>
      <main className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/dashboard/patient/records"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft size={16} />
          Back to medical records
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <FileText size={22} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                {formatType(record.record_type)}
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                {record.title}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-500">
                <CalendarDays size={15} />

                <span>
                  {formatDate(record.record_date)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h2 className="text-sm font-semibold text-slate-950">
              Record details
            </h2>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {record.description ||
                  "No description available for this record."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
            <Meta
              label="Record type"
              value={formatType(record.record_type)}
            />

            <Meta
              label="Record date"
              value={formatDate(record.record_date)}
            />

            <Meta
              label="Patient ID"
              value={record.patient_uid}
            />

            <Meta
              label="Record ID"
              value={record.id}
            />
          </div>
        </section>
      </main>
    </RoleRoute>
  );
}

function Meta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-semibold text-slate-900">
        {value || "Not available"}
      </p>
    </div>
  );
}