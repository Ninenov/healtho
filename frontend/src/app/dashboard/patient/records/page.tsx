
"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  Download,
  FileText,
  Stethoscope,
  Upload,
} from "lucide-react";
import { useAppointments } from "@/features/appointments/hooks";
import { RoleRoute } from "@/components/navigation/RoleRoute";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ROLES } from "@/constants/roles";
import {
  useMedicalRecords,
  useUploadMedicalRecord,
} from "@/features/records/hooks";
import { downloadMedicalRecordDocument } from "@/features/records/api";
import { useMyClinicalHistory } from "@/features/clinical/hooks";

function formatType(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const ALLOWED_EXTENSIONS = /\.(pdf|jpe?g|png)$/i;

export default function PatientRecordsPage() {
  const recordsQuery = useMedicalRecords();
  const clinicalQuery = useMyClinicalHistory();
  const appointmentsQuery = useAppointments();

  const noShowAppointments = (appointmentsQuery.data ?? []).filter(
    (appointment) => appointment.status === "NO_SHOW",
  );
  const uploadMutation = useUploadMedicalRecord();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState("");

  const [recordType, setRecordType] = useState("LAB_REPORT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recordDate, setRecordDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");

  const records = recordsQuery.data ?? [];
  const encounters = clinicalQuery.data ?? [];

  async function handleDownload(
    event: MouseEvent<HTMLButtonElement>,
    recordId: string,
    filename: string,
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDownloadingId(recordId);
    setDownloadError("");

    try {
      await downloadMedicalRecordDocument(recordId, filename);
    } catch {
      setDownloadError(
        "Download failed. The file may be unavailable or your session may have expired.",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError("");

    if (!title.trim()) {
      setUploadError("Enter a document title.");
      return;
    }

    if (!selectedFile) {
      setUploadError("Select a document to upload.");
      return;
    }

    if (
      !ALLOWED_TYPES.includes(selectedFile.type) ||
      !ALLOWED_EXTENSIONS.test(selectedFile.name)
    ) {
      setUploadError(
        "Only PDF, JPG, JPEG, and PNG files are supported.",
      );
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setUploadError("The file must be 10 MB or smaller.");
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        record_type: recordType,
        title: title.trim(),
        description: description.trim(),
        record_date: recordDate,
        document: selectedFile,
      });

      setTitle("");
      setDescription("");
      setSelectedFile(null);
      setRecordDate(new Date().toISOString().slice(0, 10));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      setUploadError(
        "Upload failed. Check your connection and try again.",
      );
    }
  }

  if (recordsQuery.isLoading && clinicalQuery.isLoading) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <LoadingState message="Loading your medical history..." />
      </RoleRoute>
    );
  }

  return (
    <RoleRoute allowedRoles={[ROLES.PATIENT]}>
      <main className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-sm font-semibold text-blue-600">
            Patient workspace
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            Medical records
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Review your healthcare documents and clinical consultation history.
          </p>
        </header>

        {/* Clinical timeline */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950">
            Clinical timeline
          </h2>

          {clinicalQuery.isLoading && (
            <p className="text-sm text-slate-500">
              Loading clinical history...
            </p>
          )}

          {clinicalQuery.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="font-medium text-red-800">
                Unable to load clinical history.
              </p>

              <p className="mt-1 text-sm text-red-700">
                Check your login session and try again.
              </p>

              <button
                type="button"
                onClick={() => clinicalQuery.refetch()}
                className="mt-3 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-800"
              >
                Retry
              </button>
            </div>
          )}

          {!clinicalQuery.isLoading &&
            !clinicalQuery.isError &&
            encounters.length === 0 && (
              <p className="rounded-xl border border-slate-200 p-5 text-sm text-slate-600">
                No clinical encounters found.
              </p>
            )}

          <div className="space-y-4">
            {noShowAppointments.map((appointment) => (
              <article
                key={`no-show-${appointment.id}`}
                className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-orange-50 p-3 text-orange-700">
                    <CalendarDays size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                      Appointment event
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-slate-950">
                      {formatType(appointment.appointment_type)} — No-show
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Scheduled for {formatDate(appointment.scheduled_at)}
                    </p>

                    {appointment.reason && (
                      <p className="mt-2 text-sm text-slate-600">
                        Reason: {appointment.reason}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-orange-700">
                      This appointment was missed. It is not a completed clinical encounter.
                    </p>

                    <Link
                      href={`/dashboard/patient/appointments/${appointment.id}`}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
                    >
                      View appointment
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            {encounters.map((encounter) => (
              <article
                key={encounter.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                    <Stethoscope size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      Clinical consultation
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-slate-950">
                      {encounter.chief_complaint ||
                        "Clinical consultation"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(encounter.created_at)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                  {encounter.symptoms && (
                    <p>
                      <strong>Symptoms:</strong> {encounter.symptoms}
                    </p>
                  )}

                  {encounter.examination_findings && (
                    <p>
                      <strong>Examination findings:</strong>{" "}
                      {encounter.examination_findings}
                    </p>
                  )}

                  {encounter.assessment && (
                    <p>
                      <strong>Assessment:</strong> {encounter.assessment}
                    </p>
                  )}

                  {encounter.plan && (
                    <p>
                      <strong>Treatment plan:</strong> {encounter.plan}
                    </p>
                  )}

                  {encounter.notes && (
                    <p>
                      <strong>Notes:</strong> {encounter.notes}
                    </p>
                  )}
                </div>

                {encounter.diagnoses.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <h4 className="font-semibold text-slate-900">
                      Diagnoses
                    </h4>

                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {encounter.diagnoses.map((diagnosis) => (
                        <li key={diagnosis.id}>
                          {diagnosis.diagnosis}
                          {diagnosis.description
                            ? ` — ${diagnosis.description}`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {encounter.prescriptions.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <h4 className="font-semibold text-slate-900">
                      Prescriptions
                    </h4>

                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {encounter.prescriptions.map((prescription) => (
                        <li key={prescription.id}>
                          {prescription.medication}
                          {prescription.dosage
                            ? ` — ${prescription.dosage}`
                            : ""}
                          {prescription.frequency
                            ? `, ${prescription.frequency}`
                            : ""}
                          {prescription.duration
                            ? `, ${prescription.duration}`
                            : ""}
                          {prescription.instructions
                            ? ` (${prescription.instructions})`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {encounter.follow_ups.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <h4 className="font-semibold text-slate-900">
                      Follow-up actions
                    </h4>

                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {encounter.follow_ups.map((followUp) => (
                        <li key={followUp.id}>
                          {followUp.description}
                          {followUp.due_date
                            ? ` — Due ${formatDate(followUp.due_date)}`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Medical documents */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950">
            Medical documents
          </h2>

          {downloadError && (
            <p role="alert" className="text-sm text-red-600">
              {downloadError}
            </p>
          )}

          {/* Upload form */}
          <form
            onSubmit={handleUpload}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Upload a medical document
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                Add a lab report, prescription, scan, or other medical
                document. PDF, JPG, JPEG, and PNG files up to 10 MB.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Record type
                <select
                  value={recordType}
                  onChange={(event) => setRecordType(event.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                >
                  <option value="DIAGNOSIS">Diagnosis</option>
                  <option value="PRESCRIPTION">Prescription</option>
                  <option value="LAB_REPORT">Lab Report</option>
                  <option value="IMAGING">Imaging</option>
                  <option value="PROCEDURE">Procedure</option>
                  <option value="DISCHARGE_SUMMARY">
                    Discharge Summary
                  </option>
                  <option value="OTHER">Other</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Record date
                <input
                  type="date"
                  value={recordDate}
                  onChange={(event) => setRecordDate(event.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                Document title
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={200}
                  required
                  placeholder="e.g. Complete Blood Count Report"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                Description (optional)
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="Add relevant details"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                Select document
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  required
                  onChange={(event) => {
                    setSelectedFile(event.target.files?.[0] ?? null);
                    setUploadError("");
                    uploadMutation.reset();
                  }}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm"
                />
              </label>

              {selectedFile && (
                <p className="text-sm text-slate-600 md:col-span-2">
                  Selected: {selectedFile.name} (
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            {uploadError && (
              <p role="alert" className="text-sm text-red-600">
                {uploadError}
              </p>
            )}

            {uploadMutation.isSuccess && (
              <p role="status" className="text-sm text-green-700">
                Medical document uploaded successfully.
              </p>
            )}

            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={16} />
              {uploadMutation.isPending
                ? "Uploading..."
                : "Upload document"}
            </button>
          </form>

          {recordsQuery.isError && (
            <ErrorState
              title="Unable to load medical documents"
              description="Your clinical timeline is handled separately. Retry loading your documents."
              onRetry={() => recordsQuery.refetch()}
            />
          )}

          {!recordsQuery.isError && records.length === 0 && (
            <EmptyState
              title="No medical records"
              description="Uploaded or registered medical documents will appear here."
            />
          )}

          {!recordsQuery.isError && records.length > 0 && (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {records.map((record) => (
                <article
                  key={record.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <Link
                    href={`/dashboard/patient/records/${record.id}`}
                    className="group block"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <FileText size={20} />
                      </div>

                      <ArrowRight
                        size={17}
                        className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                      />
                    </div>

                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {formatType(record.record_type)}
                      </p>

                      <h3 className="mt-1 line-clamp-2 font-semibold text-slate-950">
                        {record.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                        {record.description || "No description available."}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center gap-2 border-t border-slate-200 pt-4 text-xs font-medium text-slate-500">
                      <CalendarDays size={14} />
                      <span>{formatDate(record.record_date)}</span>
                    </div>
                  </Link>

                  {record.original_filename && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <p className="truncate text-xs text-slate-500">
                        File: {record.original_filename}
                      </p>

                      <button
                        type="button"
                        onClick={(event) =>
                          handleDownload(
                            event,
                            record.id,
                            record.original_filename ||
                            "medical-document",
                          )
                        }
                        disabled={downloadingId === record.id}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Download size={16} />
                        {downloadingId === record.id
                          ? "Downloading..."
                          : "Download document"}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </section>
          )}
        </section>
      </main>
    </RoleRoute>
  );
}
