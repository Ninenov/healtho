"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { useAppointment } from "@/features/appointments/hooks";

import {
  useCompleteEncounter,
  useCreateDiagnosis,
  useCreateEncounter,
  useCreateFollowUp,
  useCreatePrescription,
  useDiagnoses,
  useEncounter,
  useFollowUps,
  usePrescriptions,
} from "@/features/clinical/hooks";

import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";

export default function ClinicalWorkspacePage() {
  const params = useParams();
  const router = useRouter();

  const appointmentId =
    typeof params.id === "string"
      ? params.id
      : "";

  const appointmentQuery =
    useAppointment(appointmentId);

  const encounterQuery =
    useEncounter(appointmentId);

  const createEncounterMutation =
    useCreateEncounter(appointmentId);

  const encounter = encounterQuery.data;

  const encounterId = encounter?.id ?? "";

  const diagnosesQuery =
    useDiagnoses(encounterId);

  const prescriptionsQuery =
    usePrescriptions(encounterId);

  const followUpsQuery =
    useFollowUps(encounterId);

  const createDiagnosisMutation =
    useCreateDiagnosis(encounterId);

  const createPrescriptionMutation =
    useCreatePrescription(encounterId);

  const createFollowUpMutation =
    useCreateFollowUp(encounterId);

  /*
   * This was the missing mutation.
   * It is used by handleComplete() and the
   * Complete Consultation button below.
   */
  const completeMutation =
    useCompleteEncounter();

  const [chiefComplaint, setChiefComplaint] =
    useState("");

  const [symptoms, setSymptoms] =
    useState("");

  const [examinationFindings, setExaminationFindings] =
    useState("");

  const [assessment, setAssessment] =
    useState("");

  const [plan, setPlan] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [diagnosis, setDiagnosis] =
    useState("");

  const [diagnosisDescription, setDiagnosisDescription] =
    useState("");

  const [medication, setMedication] =
    useState("");

  const [dosage, setDosage] =
    useState("");

  const [frequency, setFrequency] =
    useState("");

  const [duration, setDuration] =
    useState("");

  const [route, setRoute] =
    useState("");

  const [instructions, setInstructions] =
    useState("");

  const [followUpDescription, setFollowUpDescription] =
    useState("");

  const [followUpDueDate, setFollowUpDueDate] =
    useState("");

  const [followUpNotes, setFollowUpNotes] =
    useState("");

  if (
    appointmentQuery.isLoading ||
    encounterQuery.isLoading
  ) {
    return (
      <LoadingState message="Loading clinical workspace..." />
    );
  }

  if (
    appointmentQuery.isError ||
    !appointmentQuery.data
  ) {
    return (
      <main className="p-6">
        <ErrorState
          title="Appointment unavailable"
          description="Unable to load this appointment."
          onRetry={() => appointmentQuery.refetch()}
        />
      </main>
    );
  }

  const appointment =
    appointmentQuery.data;

  if (
    appointment.status !== "IN_PROGRESS"
  ) {
    return (
      <main className="space-y-6 p-6">
        <Link
          href={`/dashboard/doctor/appointments/${appointment.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to appointment
        </Link>

        <ErrorState
          title="Consultation is not active"
          description="The clinical workspace can only be used while the appointment is in progress."
        />
      </main>
    );
  }

  async function handleCreateEncounter() {
    await createEncounterMutation.mutateAsync({
      chief_complaint: chiefComplaint,
      symptoms,
      examination_findings: examinationFindings,
      assessment,
      plan,
      notes,
    });
  }

  async function handleAddDiagnosis() {
    if (!encounter || !diagnosis.trim()) {
      return;
    }

    await createDiagnosisMutation.mutateAsync({
      diagnosis,
      description: diagnosisDescription,
    });

    setDiagnosis("");
    setDiagnosisDescription("");
  }

  async function handleAddPrescription() {
    if (
      !encounter ||
      !medication.trim() ||
      !dosage.trim() ||
      !frequency.trim() ||
      !duration.trim()
    ) {
      return;
    }

    await createPrescriptionMutation.mutateAsync({
      medication,
      dosage,
      frequency,
      duration,
      route,
      instructions,
    });

    setMedication("");
    setDosage("");
    setFrequency("");
    setDuration("");
    setRoute("");
    setInstructions("");
  }

  async function handleAddFollowUp() {
    if (
      !encounter ||
      !followUpDescription.trim()
    ) {
      return;
    }

    await createFollowUpMutation.mutateAsync({
      description: followUpDescription,
      due_date:
        followUpDueDate || null,
      notes: followUpNotes,
    });

    setFollowUpDescription("");
    setFollowUpDueDate("");
    setFollowUpNotes("");
  }

  async function handleComplete() {
    if (!encounter) {
      return;
    }

    await completeMutation.mutateAsync(
      encounter.id,
    );

    router.replace(
      `/dashboard/doctor/appointments/${appointment.id}`,
    );
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <Link
          href={`/dashboard/doctor/appointments/${appointment.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to appointment
        </Link>

        <div className="mt-3">
          <h1 className="text-2xl font-semibold">
            Clinical Workspace
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Active consultation
          </p>
        </div>
      </div>

      <section className="rounded-xl border bg-card">
        <div className="border-b p-5">
          <h2 className="font-semibold">
            Clinical encounter
          </h2>
        </div>

        <div className="space-y-4 p-5">
          <Field
            label="Chief complaint"
            value={chiefComplaint}
            onChange={setChiefComplaint}
            disabled={Boolean(encounter)}
          />

          <TextArea
            label="Symptoms"
            value={symptoms}
            onChange={setSymptoms}
            disabled={Boolean(encounter)}
          />

          <TextArea
            label="Examination findings"
            value={examinationFindings}
            onChange={setExaminationFindings}
            disabled={Boolean(encounter)}
          />

          <TextArea
            label="Assessment"
            value={assessment}
            onChange={setAssessment}
            disabled={Boolean(encounter)}
          />

          <TextArea
            label="Plan"
            value={plan}
            onChange={setPlan}
            disabled={Boolean(encounter)}
          />

          <TextArea
            label="Notes"
            value={notes}
            onChange={setNotes}
            disabled={Boolean(encounter)}
          />

          {!encounter && (
            <button
              type="button"
              onClick={handleCreateEncounter}
              disabled={
                createEncounterMutation.isPending
              }
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {createEncounterMutation.isPending
                ? "Creating..."
                : "Create clinical encounter"}
            </button>
          )}
        </div>
      </section>

      {encounter && (
        <>
          <section className="rounded-xl border bg-card">
            <div className="border-b p-5">
              <h2 className="font-semibold">
                Diagnoses
              </h2>
            </div>

            <div className="space-y-4 p-5">
              {diagnosesQuery.data?.map(
                (item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-4"
                  >
                    <p className="font-medium">
                      {item.diagnosis}
                    </p>

                    {item.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                ),
              )}

              <Field
                label="Diagnosis"
                value={diagnosis}
                onChange={setDiagnosis}
              />

              <TextArea
                label="Description"
                value={diagnosisDescription}
                onChange={setDiagnosisDescription}
              />

              <button
                type="button"
                onClick={handleAddDiagnosis}
                disabled={
                  createDiagnosisMutation.isPending ||
                  !diagnosis.trim()
                }
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {createDiagnosisMutation.isPending
                  ? "Adding..."
                  : "Add diagnosis"}
              </button>
            </div>
          </section>

          <section className="rounded-xl border bg-card">
            <div className="border-b p-5">
              <h2 className="font-semibold">
                Prescriptions
              </h2>
            </div>

            <div className="space-y-4 p-5">
              {prescriptionsQuery.data?.map(
                (item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-4"
                  >
                    <p className="font-medium">
                      {item.medication}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.dosage} ·{" "}
                      {item.frequency} ·{" "}
                      {item.duration}
                    </p>
                  </div>
                ),
              )}

              <Field
                label="Medication"
                value={medication}
                onChange={setMedication}
              />

              <Field
                label="Dosage"
                value={dosage}
                onChange={setDosage}
              />

              <Field
                label="Frequency"
                value={frequency}
                onChange={setFrequency}
              />

              <Field
                label="Duration"
                value={duration}
                onChange={setDuration}
              />

              <Field
                label="Route"
                value={route}
                onChange={setRoute}
              />

              <TextArea
                label="Instructions"
                value={instructions}
                onChange={setInstructions}
              />

              <button
                type="button"
                onClick={handleAddPrescription}
                disabled={
                  createPrescriptionMutation.isPending ||
                  !medication.trim() ||
                  !dosage.trim() ||
                  !frequency.trim() ||
                  !duration.trim()
                }
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {createPrescriptionMutation.isPending
                  ? "Adding..."
                  : "Add prescription"}
              </button>
            </div>
          </section>

          <section className="rounded-xl border bg-card">
            <div className="border-b p-5">
              <h2 className="font-semibold">
                Follow-up
              </h2>
            </div>

            <div className="space-y-4 p-5">
              {followUpsQuery.data?.map(
                (item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-4"
                  >
                    <p className="font-medium">
                      {item.description}
                    </p>

                    {item.due_date && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Due: {item.due_date}
                      </p>
                    )}
                  </div>
                ),
              )}

              <TextArea
                label="Description"
                value={followUpDescription}
                onChange={setFollowUpDescription}
              />

              <Field
                label="Due date"
                type="date"
                value={followUpDueDate}
                onChange={setFollowUpDueDate}
              />

              <TextArea
                label="Notes"
                value={followUpNotes}
                onChange={setFollowUpNotes}
              />

              <button
                type="button"
                onClick={handleAddFollowUp}
                disabled={
                  createFollowUpMutation.isPending ||
                  !followUpDescription.trim()
                }
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {createFollowUpMutation.isPending
                  ? "Adding..."
                  : "Add follow-up"}
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-red-200 bg-white p-5">
            <h2 className="font-semibold">
              Complete consultation
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Completing the consultation will move
              the appointment to COMPLETED.
            </p>

            <button
              type="button"
              onClick={handleComplete}
              disabled={
                completeMutation.isPending
              }
              className="mt-4 rounded-lg bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {completeMutation.isPending
                ? "Completing..."
                : "Complete consultation"}
            </button>
          </section>
        </>
      )}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {label}
      </span>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 disabled:bg-gray-100"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {label}
      </span>

      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        rows={4}
        className="w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 disabled:bg-gray-100"
      />
    </label>
  );
}