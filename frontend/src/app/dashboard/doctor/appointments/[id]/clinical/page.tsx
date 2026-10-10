
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Pill,
  Plus,
  UserRound,
  X,
} from "lucide-react";

import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { RoleRoute } from "@/components/navigation/RoleRoute";
import { ROLES } from "@/constants/roles";

import { useAppointment } from "@/features/appointments/hooks";

import ClinicalAttachmentsSection from "@/features/clinical/ClinicalAttachmentsSection";

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

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200";

const textareaClass =
  "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm leading-6 text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200";

export default function DoctorClinicalWorkspacePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const appointmentId = params.id;

  const appointmentQuery = useAppointment(appointmentId);
  const encounterQuery = useEncounter(appointmentId);

  const encounter = encounterQuery.data;
  const encounterId = encounter?.id ?? "";

  const diagnosesQuery = useDiagnoses(encounterId);
  const prescriptionsQuery = usePrescriptions(encounterId);
  const followUpsQuery = useFollowUps(encounterId);

  const createEncounterMutation = useCreateEncounter(appointmentId);
  const createDiagnosisMutation = useCreateDiagnosis(encounterId);
  const createPrescriptionMutation = useCreatePrescription(encounterId);
  const createFollowUpMutation = useCreateFollowUp(encounterId);
  const completeMutation = useCompleteEncounter();

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [examinationFindings, setExaminationFindings] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [notes, setNotes] = useState("");

  const [diagnosis, setDiagnosis] = useState("");
  const [diagnosisDescription, setDiagnosisDescription] = useState("");
  const [diagnosisType, setDiagnosisType] = useState("");
  const [diagnosisNotes, setDiagnosisNotes] = useState("");

  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [route, setRoute] = useState("");
  const [instructions, setInstructions] = useState("");

  const [followUpDescription, setFollowUpDescription] = useState("");
  const [followUpDueDate, setFollowUpDueDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);

  if (appointmentQuery.isLoading) {
    return (
      <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
        <LoadingState message="Loading consultation..." />
      </RoleRoute>
    );
  }

  if (appointmentQuery.isError || !appointmentQuery.data) {
    return (
      <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
        <ErrorState
          title="Appointment unavailable"
          description="The appointment could not be loaded."
          onRetry={() => appointmentQuery.refetch()}
        />
      </RoleRoute>
    );
  }

  const appointment = appointmentQuery.data;

  if (appointment.status !== "IN_PROGRESS") {
    return (
      <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
        <main className="mx-auto max-w-5xl space-y-6">
          <Link
            href={`/dashboard/doctor/appointments/${appointment.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
          >
            <ArrowLeft size={16} />
            Back to appointment
          </Link>

          <ErrorState
            title="Consultation is not active"
            description="The clinical workspace can only be used while the appointment is in progress."
          />
        </main>
      </RoleRoute>
    );
  }

  const encounterCompleted = false;

  const handleCreateEncounter = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    await createEncounterMutation.mutateAsync({
      chief_complaint: chiefComplaint,
      symptoms,
      examination_findings: examinationFindings,
      assessment,
      plan,
      notes,
    });
  };

  const handleAddDiagnosis = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!encounter || !diagnosis.trim()) {
      return;
    }

    await createDiagnosisMutation.mutateAsync({
      diagnosis: diagnosis.trim(),
      description: diagnosisDescription.trim(),
      diagnosis_type: diagnosisType.trim(),
      notes: diagnosisNotes.trim(),
    });

    setDiagnosis("");
    setDiagnosisDescription("");
    setDiagnosisType("");
    setDiagnosisNotes("");
    setShowDiagnosisForm(false);
  };

  const handleAddPrescription = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

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
      medication: medication.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration.trim(),
      route: route.trim(),
      instructions: instructions.trim(),
    });

    setMedication("");
    setDosage("");
    setFrequency("");
    setDuration("");
    setRoute("");
    setInstructions("");
    setShowPrescriptionForm(false);
  };

  const handleAddFollowUp = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!encounter || !followUpDescription.trim()) {
      return;
    }

    await createFollowUpMutation.mutateAsync({
      description: followUpDescription.trim(),
      due_date: followUpDueDate || null,
      notes: followUpNotes.trim(),
    });

    setFollowUpDescription("");
    setFollowUpDueDate("");
    setFollowUpNotes("");
    setShowFollowUpForm(false);
  };

  const handleComplete = async () => {
    if (!encounter) {
      return;
    }

    const confirmed = window.confirm(
      "Complete this consultation? Make sure all clinical information has been recorded.",
    );

    if (!confirmed) {
      return;
    }

    await completeMutation.mutateAsync(encounter.id);

    router.replace(`/dashboard/doctor/appointments/${appointment.id}`);
  };

  return (
    <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
      <main className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href={`/dashboard/doctor/appointments/${appointment.id}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
            >
              <ArrowLeft size={16} />
              Back to appointment
            </Link>

            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Active consultation
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950">
                Clinical Workspace
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Record the clinical assessment, diagnosis, treatment and
                follow-up.
              </p>
            </div>
          </div>

          {encounter && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={completeMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={17} />
              {completeMutation.isPending
                ? "Completing..."
                : "Complete consultation"}
            </button>
          )}
        </section>

        {/* Appointment summary */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <UserRound size={20} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Patient
                </p>

                <h2 className="mt-1 font-semibold text-gray-950">
                  {appointment.patient_name || "Patient"}
                </h2>

                <p className="mt-1 font-mono text-xs text-gray-400">
                  {appointment.patient_uid || appointment.patient}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[480px]">
              <InfoItem
                label="Type"
                value={appointment.appointment_type}
              />

              <InfoItem
                label="Date"
                value={new Date(
                  appointment.scheduled_at,
                ).toLocaleDateString("en-IN", {
                  dateStyle: "medium",
                })}
              />

              <InfoItem
                label="Time"
                value={new Date(
                  appointment.scheduled_at,
                ).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            </div>
          </div>

          {appointment.reason && (
            <div className="mt-6 border-t border-gray-200 pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Reason for visit
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-700">
                {appointment.reason}
              </p>
            </div>
          )}
        </section>

        {/* Encounter creation */}
        {encounterQuery.isError && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <SectionTitle
              icon={<ClipboardList size={18} />}
              title="Clinical encounter"
              description="Record the clinical assessment for this appointment."
            />

            <form
              onSubmit={handleCreateEncounter}
              className="mt-6 space-y-5"
            >
              <Field
                label="Chief complaint"
                value={chiefComplaint}
                onChange={setChiefComplaint}
                placeholder="Primary reason for consultation"
              />

              <TextAreaField
                label="Symptoms"
                value={symptoms}
                onChange={setSymptoms}
                placeholder="Describe reported symptoms..."
              />

              <TextAreaField
                label="Examination findings"
                value={examinationFindings}
                onChange={setExaminationFindings}
                placeholder="Document examination findings..."
              />

              <div className="grid gap-5 md:grid-cols-2">
                <TextAreaField
                  label="Assessment"
                  value={assessment}
                  onChange={setAssessment}
                  placeholder="Clinical assessment..."
                />

                <TextAreaField
                  label="Plan"
                  value={plan}
                  onChange={setPlan}
                  placeholder="Treatment and care plan..."
                />
              </div>

              <TextAreaField
                label="Notes"
                value={notes}
                onChange={setNotes}
                placeholder="Additional clinical notes..."
              />

              <button
                type="submit"
                disabled={createEncounterMutation.isPending}
                className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createEncounterMutation.isPending
                  ? "Creating..."
                  : "Start encounter"}
              </button>
            </form>
          </section>
        )}

        {encounterQuery.isLoading && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">
              Loading clinical encounter...
            </p>
          </section>
        )}

        {/* Active encounter */}
        {encounter && (
          <>
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <SectionTitle
                icon={<ClipboardList size={18} />}
                title="Clinical encounter"
                description="Clinical assessment recorded for this consultation."
              />

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ReadOnlyBlock
                  label="Chief complaint"
                  value={encounter.chief_complaint}
                />

                <ReadOnlyBlock
                  label="Symptoms"
                  value={encounter.symptoms}
                />

                <ReadOnlyBlock
                  label="Examination findings"
                  value={encounter.examination_findings}
                />

                <ReadOnlyBlock
                  label="Assessment"
                  value={encounter.assessment}
                />

                <ReadOnlyBlock
                  label="Plan"
                  value={encounter.plan}
                />

                <ReadOnlyBlock
                  label="Notes"
                  value={encounter.notes}
                />
              </div>
            </section>

            {/* Clinical attachments */}
            <ClinicalAttachmentsSection
              encounterId={encounter.id}
              disabled={encounterCompleted}
            />

            {/* Diagnoses */}
            <ClinicalSection
              icon={<Activity size={18} />}
              title="Diagnoses"
              count={diagnosesQuery.data?.length ?? 0}
              action={
                !encounterCompleted ? (
                  <ToggleButton
                    open={showDiagnosisForm}
                    onClick={() =>
                      setShowDiagnosisForm((current) => !current)
                    }
                    label="diagnosis"
                  />
                ) : null
              }
            >
              {showDiagnosisForm && (
                <form
                  onSubmit={handleAddDiagnosis}
                  className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-5"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Diagnosis"
                      value={diagnosis}
                      onChange={setDiagnosis}
                      placeholder="Diagnosis"
                      required
                    />

                    <Field
                      label="Diagnosis type"
                      value={diagnosisType}
                      onChange={setDiagnosisType}
                      placeholder="Primary, secondary, etc."
                    />
                  </div>

                  <div className="mt-4">
                    <TextAreaField
                      label="Description"
                      value={diagnosisDescription}
                      onChange={setDiagnosisDescription}
                      placeholder="Diagnosis details..."
                    />
                  </div>

                  <div className="mt-4">
                    <TextAreaField
                      label="Notes"
                      value={diagnosisNotes}
                      onChange={setDiagnosisNotes}
                      placeholder="Additional notes..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      createDiagnosisMutation.isPending ||
                      !diagnosis.trim()
                    }
                    className="mt-4 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {createDiagnosisMutation.isPending
                      ? "Saving..."
                      : "Save diagnosis"}
                  </button>
                </form>
              )}

              {diagnosesQuery.isLoading ? (
                <LoadingInline />
              ) : diagnosesQuery.data &&
                diagnosesQuery.data.length > 0 ? (
                <div className="space-y-3">
                  {diagnosesQuery.data.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-gray-950">
                            {item.diagnosis}
                          </p>

                          {item.diagnosis_type && (
                            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                              {item.diagnosis_type}
                            </p>
                          )}
                        </div>
                      </div>

                      {item.description && (
                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          {item.description}
                        </p>
                      )}

                      {item.notes && (
                        <p className="mt-2 text-sm text-gray-500">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyInline text="No diagnoses recorded." />
              )}
            </ClinicalSection>

            {/* Prescriptions */}
            <ClinicalSection
              icon={<Pill size={18} />}
              title="Prescriptions"
              count={prescriptionsQuery.data?.length ?? 0}
              action={
                !encounterCompleted ? (
                  <ToggleButton
                    open={showPrescriptionForm}
                    onClick={() =>
                      setShowPrescriptionForm((current) => !current)
                    }
                    label="prescription"
                  />
                ) : null
              }
            >
              {showPrescriptionForm && (
                <form
                  onSubmit={handleAddPrescription}
                  className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-5"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Medication"
                      value={medication}
                      onChange={setMedication}
                      placeholder="Medication name"
                      required
                    />

                    <Field
                      label="Dosage"
                      value={dosage}
                      onChange={setDosage}
                      placeholder="e.g. 500 mg"
                      required
                    />

                    <Field
                      label="Frequency"
                      value={frequency}
                      onChange={setFrequency}
                      placeholder="e.g. Twice daily"
                      required
                    />

                    <Field
                      label="Duration"
                      value={duration}
                      onChange={setDuration}
                      placeholder="e.g. 5 days"
                      required
                    />

                    <Field
                      label="Route"
                      value={route}
                      onChange={setRoute}
                      placeholder="Oral, topical, etc."
                    />
                  </div>

                  <div className="mt-4">
                    <TextAreaField
                      label="Instructions"
                      value={instructions}
                      onChange={setInstructions}
                      placeholder="Instructions for the patient..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      createPrescriptionMutation.isPending ||
                      !medication.trim() ||
                      !dosage.trim() ||
                      !frequency.trim() ||
                      !duration.trim()
                    }
                    className="mt-4 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {createPrescriptionMutation.isPending
                      ? "Saving..."
                      : "Save prescription"}
                  </button>
                </form>
              )}

              {prescriptionsQuery.isLoading ? (
                <LoadingInline />
              ) : prescriptionsQuery.data &&
                prescriptionsQuery.data.length > 0 ? (
                <div className="space-y-3">
                  {prescriptionsQuery.data.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <p className="font-semibold text-gray-950">
                          {item.medication}
                        </p>

                        {item.route && (
                          <span className="w-fit rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                            {item.route}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-3">
                        <p>
                          <span className="text-gray-400">Dose:</span>{" "}
                          {item.dosage}
                        </p>

                        <p>
                          <span className="text-gray-400">Frequency:</span>{" "}
                          {item.frequency}
                        </p>

                        <p>
                          <span className="text-gray-400">Duration:</span>{" "}
                          {item.duration}
                        </p>
                      </div>

                      {item.instructions && (
                        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2.5 text-sm leading-6 text-gray-600">
                          {item.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyInline text="No prescriptions recorded." />
              )}
            </ClinicalSection>

            {/* Follow-ups */}
            <ClinicalSection
              icon={<CalendarDays size={18} />}
              title="Follow-ups"
              count={followUpsQuery.data?.length ?? 0}
              action={
                !encounterCompleted ? (
                  <ToggleButton
                    open={showFollowUpForm}
                    onClick={() =>
                      setShowFollowUpForm((current) => !current)
                    }
                    label="follow-up"
                  />
                ) : null
              }
            >
              {showFollowUpForm && (
                <form
                  onSubmit={handleAddFollowUp}
                  className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-5"
                >
                  <TextAreaField
                    label="Description"
                    value={followUpDescription}
                    onChange={setFollowUpDescription}
                    placeholder="Describe the follow-up action..."
                    required
                  />

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-600">
                        Due date
                      </label>

                      <input
                        type="date"
                        value={followUpDueDate}
                        onChange={(event) =>
                          setFollowUpDueDate(event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <TextAreaField
                      label="Notes"
                      value={followUpNotes}
                      onChange={setFollowUpNotes}
                      placeholder="Additional notes..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      createFollowUpMutation.isPending ||
                      !followUpDescription.trim()
                    }
                    className="mt-4 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {createFollowUpMutation.isPending
                      ? "Saving..."
                      : "Save follow-up"}
                  </button>
                </form>
              )}

              {followUpsQuery.isLoading ? (
                <LoadingInline />
              ) : followUpsQuery.data &&
                followUpsQuery.data.length > 0 ? (
                <div className="space-y-3">
                  {followUpsQuery.data.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <p className="font-semibold text-gray-950">
                          {item.description}
                        </p>

                        {item.status && (
                          <span className="w-fit rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                            {item.status}
                          </span>
                        )}
                      </div>

                      {item.due_date && (
                        <p className="mt-2 text-sm text-gray-500">
                          Due: {item.due_date}
                        </p>
                      )}

                      {item.notes && (
                        <p className="mt-2 text-sm text-gray-500">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyInline text="No follow-up actions recorded." />
              )}
            </ClinicalSection>

            {/* Completion */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-gray-950">
                    Finish consultation
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Complete the encounter only after the clinical
                    documentation is finished.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={completeMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={17} />
                  {completeMutation.isPending
                    ? "Completing..."
                    : "Complete consultation"}
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </RoleRoute>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-gray-950">{title}</h2>

        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function ClinicalSection({
  icon,
  title,
  count,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            {icon}
          </div>

          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-950">{title}</h2>

            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
              {count}
            </span>
          </div>
        </div>

        {action}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function ToggleButton({
  open,
  onClick,
  label,
}: {
  open: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
    >
      {open ? <X size={16} /> : <Plus size={16} />}
      {open ? "Close" : `Add ${label}`}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="ml-1 text-gray-400">*</span>}
      </label>

      <input
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="ml-1 text-gray-400">*</span>}
      </label>

      <textarea
        rows={4}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={textareaClass}
      />
    </div>
  );
}

function ReadOnlyBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
        {value || "No information recorded."}
      </p>
    </div>
  );
}

function LoadingInline() {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
      Loading...
    </div>
  );
}

function EmptyInline({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}
