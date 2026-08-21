"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { RoleRoute } from "@/components/navigation/RoleRoute";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { ROLES } from "@/constants/roles";
import { useMedicalRecord } from "@/features/records/hooks";

export default function MedicalRecordDetailPage() {
  const params = useParams<{ id: string }>();

  const query = useMedicalRecord(params.id);

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
          title="Record not found"
          onRetry={() => query.refetch()}
        />
      </RoleRoute>
    );
  }

  const record = query.data;

  return (
    <RoleRoute allowedRoles={[ROLES.PATIENT]}>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/dashboard/patient/records"
          className="text-sm underline"
        >
          ← Back to records
        </Link>

        <section className="rounded-xl border bg-white p-6">
          <h1 className="text-2xl font-semibold">
            {record.title}
          </h1>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Info
              label="Record type"
              value={record.record_type}
            />

            <Info
              label="Record date"
              value={record.record_date}
            />

            <Info
              label="Patient UID"
              value={record.patient_uid}
            />
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium uppercase text-gray-400">
              Description
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
              {record.description || "No description"}
            </p>
          </div>
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