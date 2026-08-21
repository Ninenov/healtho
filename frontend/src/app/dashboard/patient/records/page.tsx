"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

import { RoleRoute } from "@/components/navigation/RoleRoute";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ROLES } from "@/constants/roles";
import { useMedicalRecords } from "@/features/records/hooks";

export default function PatientRecordsPage() {
  const query = useMedicalRecords();

  return (
    <RoleRoute allowedRoles={[ROLES.PATIENT]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Medical Records
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Your health records and uploaded information.
          </p>
        </div>

        {query.isLoading && <LoadingState />}

        {query.isError && (
          <ErrorState
            title="Unable to load records"
            onRetry={() => query.refetch()}
          />
        )}

        {query.isSuccess && query.data.length === 0 && (
          <EmptyState
            title="No medical records"
            description="Your medical records will appear here."
          />
        )}

        {query.isSuccess && query.data.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {query.data.map((record) => (
              <Link
                key={record.id}
                href={`/dashboard/patient/records/${record.id}`}
                className="rounded-xl border bg-white p-5 transition hover:shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <FileText size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium">
                      {record.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {record.record_type}
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      {record.description || "No description"}
                    </p>

                    <p className="mt-3 text-xs text-gray-400">
                      {record.record_date}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </RoleRoute>
  );
}