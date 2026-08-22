"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import {
  useAppointment,
} from "@/features/appointments/hooks";

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

export default function DoctorClinicalWorkspacePage() {
  const params = useParams();

  const appointmentId =
    typeof params.id === "string"
      ? params.id
      : "";

  const {
    data: appointment,
    isLoading: appointmentLoading,
    isError: appointmentError,
  } = useAppointment(appointmentId);

  const {
    data: encounter,
    isLoading: encounterLoading,
    isError: encounterError,
  } = useEncounter(appointmentId);

  const createEncounterMutation =
    useCreateEncounter(appointmentId);

  const encounterId = encounter?.id ?? "";

  const {
    data: diagnoses = [],
    isLoading: diagnosesLoading,
  } = useDiagnoses(encounterId);

  const {
    data: prescriptions = [],
    isLoading: prescriptionsLoading,
  } = usePrescriptions(encounterId);

  const {
    data: followUps = [],
    isLoading: followUpsLoading,
  } = useFollowUps(encounterId);

  const createDiagnosisMutation =
    useCreateDiagnosis(encounterId);

  const createPrescriptionMutation =
    useCreatePrescription(encounterId);

  const createFollowUpMutation =
    useCreateFollowUp(encounterId);

  const completeMutation =
    useCompleteEncounter();

  const completeEncounterMutation =
    useCompleteEncounter();

  const [encounterForm, setEncounterForm] = useState({
    chief_complaint: "",
    symptoms: "",
    examination_findings: "",
    assessment: "",
    plan: "",
    notes: "",
  });

  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosis: "",
    description: "",
    diagnosis_type: "",
    notes: "",
  });

  const [prescriptionForm, setPrescriptionForm] =
    useState({
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      route: "",
      instructions: "",
    });

  const [followUpForm, setFollowUpForm] = useState({
    description: "",
    due_date: "",
    notes: "",
  });

  if (appointmentLoading) {
    return (
      <LoadingState message="Loading appointment..." />
    );
  }

  if (appointmentError || !appointment) {
    return (
      <main className="p-6">
        <ErrorState
          title="Appointment unavailable"
          description="The appointment could not be loaded."
        />
      </main>
    );
  }

  const isCreatingEncounter =
    createEncounterMutation.isPending;

  const isAddingDiagnosis =
    createDiagnosisMutation.isPending;

  const isAddingPrescription =
    createPrescriptionMutation.isPending;

  const isAddingFollowUp =
    createFollowUpMutation.isPending;

  const isCompleting =
    completeEncounterMutation.isPending;

  const handleCreateEncounter = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    await createEncounterMutation.mutateAsync(
      encounterForm,
    );
  };

  const handleCreateDiagnosis = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!encounterId) return;

    await createDiagnosisMutation.mutateAsync(
      diagnosisForm,
    );

    setDiagnosisForm({
      diagnosis: "",
      description: "",
      diagnosis_type: "",
      notes: "",
    });
  };

  const handleCreatePrescription = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!encounterId) return;

    await createPrescriptionMutation.mutateAsync(
      prescriptionForm,
    );

    setPrescriptionForm({
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      route: "",
      instructions: "",
    });
  };

  const handleCreateFollowUp = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!encounterId) return;

    await createFollowUpMutation.mutateAsync({
      description: followUpForm.description,
      due_date:
        followUpForm.due_date || null,
      notes: followUpForm.notes,
    });

    setFollowUpForm({
      description: "",
      due_date: "",
      notes: "",
    });
  };

  const handleComplete = async () => {
    if (!encounterId) return;

    const confirmed = window.confirm(
      "Complete this consultation? This should only be done after all clinical information has been recorded.",
    );

    if (!confirmed) return;

    await completeEncounterMutation.mutateAsync(
      encounterId,
    );
  };

  const encounterNotFound =
    !encounterLoading &&
    encounterError;

  return (
    <main className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/dashboard/doctor/appointments/${appointmentId}`}
            className="text-sm text-gray-500 hover:text-gray-950 hover:underline"
          >
            ← Back to appointment
          </Link>

          <p className="mt-4 text-sm font-medium text-gray-500">
            Doctor workspace
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-gray-950">
            Clinical Workspace
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Record the consultation and manage clinical
            information.
          </p>
        </div>

        <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium capitalize">
          {appointment.status.replaceAll("_", " ")}
        </div>
      </div>

      {/* Patient / appointment context */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5">
          <h2 className="font-semibold text-gray-950">
            Appointment context
          </h2>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Detail
            label="Patient"
            value={appointment.patient}
          />

          <Detail
            label="Appointment type"
            value={appointment.appointment_type}
          />

          <Detail
            label="Reason"
            value={
              appointment.reason || "Not provided"
            }
          />

          <Detail
            label="Notes"
            value={
              appointment.notes || "No notes"
            }
          />
        </div>
      </section>

      {/* Encounter */}
      {encounterLoading && (
        <LoadingState message="Loading clinical encounter..." />
      )}

      {encounterNotFound && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <h2 className="font-semibold text-gray-950">
              Start clinical encounter
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Record the initial clinical assessment for
              this appointment.
            </p>
          </div>

          <form
            onSubmit={handleCreateEncounter}
            className="space-y-5 p-5"
          >
            <TextArea
              label="Chief complaint"
              value={encounterForm.chief_complaint}
              onChange={(value) =>
                setEncounterForm((current) => ({
                  ...current,
                  chief_complaint: value,
                }))
              }
              placeholder="Primary reason for consultation"
            />

            <TextArea
              label="Symptoms"
              value={encounterForm.symptoms}
              onChange={(value) =>
                setEncounterForm((current) => ({
                  ...current,
                  symptoms: value,
                }))
              }
              placeholder="Patient-reported symptoms"
            />

            <TextArea
              label="Examination findings"
              value={
                encounterForm.examination_findings
              }
              onChange={(value) =>
                setEncounterForm((current) => ({
                  ...current,
                  examination_findings: value,
                }))
              }
              placeholder="Clinical examination findings"
            />

            <TextArea
              label="Assessment"
              value={encounterForm.assessment}
              onChange={(value) =>
                setEncounterForm((current) => ({
                  ...current,
                  assessment: value,
                }))
              }
              placeholder="Clinical assessment"
            />

            <TextArea
              label="Plan"
              value={encounterForm.plan}
              onChange={(value) =>
                setEncounterForm((current) => ({
                  ...current,
                  plan: value,
                }))
              }
              placeholder="Treatment and care plan"
            />

            <TextArea
              label="Notes"
              value={encounterForm.notes}
              onChange={(value) =>
                setEncounterForm((current) => ({
                  ...current,
                  notes: value,
                }))
              }
              placeholder="Additional clinical notes"
            />

            <button
              type="submit"
              disabled={isCreatingEncounter}
              className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreatingEncounter
                ? "Creating encounter..."
                : "Create encounter"}
            </button>
          </form>
        </section>
      )}

      {encounter && (
        <>
          {/* Encounter details */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <h2 className="font-semibold text-gray-950">
                Clinical encounter
              </h2>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <Detail
                label="Chief complaint"
                value={
                  encounter.chief_complaint ||
                  "Not recorded"
                }
              />

              <Detail
                label="Symptoms"
                value={
                  encounter.symptoms ||
                  "Not recorded"
                }
              />

              <Detail
                label="Examination findings"
                value={
                  encounter.examination_findings ||
                  "Not recorded"
                }
              />

              <Detail
                label="Assessment"
                value={
                  encounter.assessment ||
                  "Not recorded"
                }
              />

              <Detail
                label="Plan"
                value={
                  encounter.plan ||
                  "Not recorded"
                }
              />

              <Detail
                label="Notes"
                value={
                  encounter.notes ||
                  "Not recorded"
                }
              />
            </div>
          </section>

          {/* Diagnosis */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <h2 className="font-semibold text-gray-950">
                Diagnoses
              </h2>
            </div>

            <div className="space-y-5 p-5">
              {diagnosesLoading ? (
                <p className="text-sm text-gray-500">
                  Loading diagnoses...
                </p>
              ) : diagnoses.length > 0 ? (
                <div className="space-y-2">
                  {diagnoses.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <p className="font-medium text-gray-950">
                        {item.diagnosis}
                      </p>

                      {item.diagnosis_type && (
                        <p className="mt-1 text-xs text-gray-500">
                          {item.diagnosis_type}
                        </p>
                      )}

                      {item.description && (
                        <p className="mt-2 text-sm text-gray-600">
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
                <p className="text-sm text-gray-500">
                  No diagnoses recorded.
                </p>
              )}

              <form
                onSubmit={handleCreateDiagnosis}
                className="grid gap-4 border-t border-gray-200 pt-5 sm:grid-cols-2"
              >
                <Input
                  label="Diagnosis"
                  value={diagnosisForm.diagnosis}
                  onChange={(value) =>
                    setDiagnosisForm((current) => ({
                      ...current,
                      diagnosis: value,
                    }))
                  }
                  required
                />

                <Input
                  label="Diagnosis type"
                  value={
                    diagnosisForm.diagnosis_type
                  }
                  onChange={(value) =>
                    setDiagnosisForm((current) => ({
                      ...current,
                      diagnosis_type: value,
                    }))
                  }
                />

                <TextArea
                  label="Description"
                  value={
                    diagnosisForm.description
                  }
                  onChange={(value) =>
                    setDiagnosisForm((current) => ({
                      ...current,
                      description: value,
                    }))
                  }
                />

                <TextArea
                  label="Notes"
                  value={diagnosisForm.notes}
                  onChange={(value) =>
                    setDiagnosisForm((current) => ({
                      ...current,
                      notes: value,
                    }))
                  }
                />

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isAddingDiagnosis}
                    className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {isAddingDiagnosis
                      ? "Adding..."
                      : "Add diagnosis"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Prescriptions */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <h2 className="font-semibold text-gray-950">
                Prescriptions
              </h2>
            </div>

            <div className="space-y-5 p-5">
              {prescriptionsLoading ? (
                <p className="text-sm text-gray-500">
                  Loading prescriptions...
                </p>
              ) : prescriptions.length > 0 ? (
                <div className="space-y-2">
                  {prescriptions.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <p className="font-medium text-gray-950">
                        {item.medication}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {item.dosage} · {item.frequency}
                      </p>

                      {item.duration && (
                        <p className="mt-1 text-sm text-gray-500">
                          Duration: {item.duration}
                        </p>
                      )}

                      {item.route && (
                        <p className="mt-1 text-sm text-gray-500">
                          Route: {item.route}
                        </p>
                      )}

                      {item.instructions && (
                        <p className="mt-2 text-sm text-gray-600">
                          {item.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No prescriptions recorded.
                </p>
              )}

              <form
                onSubmit={handleCreatePrescription}
                className="grid gap-4 border-t border-gray-200 pt-5 sm:grid-cols-2"
              >
                <Input
                  label="Medication"
                  value={
                    prescriptionForm.medication
                  }
                  onChange={(value) =>
                    setPrescriptionForm(
                      (current) => ({
                        ...current,
                        medication: value,
                      }),
                    )
                  }
                  required
                />

                <Input
                  label="Dosage"
                  value={prescriptionForm.dosage}
                  onChange={(value) =>
                    setPrescriptionForm(
                      (current) => ({
                        ...current,
                        dosage: value,
                      }),
                    )
                  }
                  required
                />

                <Input
                  label="Frequency"
                  value={
                    prescriptionForm.frequency
                  }
                  onChange={(value) =>
                    setPrescriptionForm(
                      (current) => ({
                        ...current,
                        frequency: value,
                      }),
                    )
                  }
                  required
                />

                <Input
                  label="Duration"
                  value={
                    prescriptionForm.duration
                  }
                  onChange={(value) =>
                    setPrescriptionForm(
                      (current) => ({
                        ...current,
                        duration: value,
                      }),
                    )
                  }
                  required
                />

                <Input
                  label="Route"
                  value={prescriptionForm.route}
                  onChange={(value) =>
                    setPrescriptionForm(
                      (current) => ({
                        ...current,
                        route: value,
                      }),
                    )
                  }
                />

                <TextArea
                  label="Instructions"
                  value={
                    prescriptionForm.instructions
                  }
                  onChange={(value) =>
                    setPrescriptionForm(
                      (current) => ({
                        ...current,
                        instructions: value,
                      }),
                    )
                  }
                />

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isAddingPrescription}
                    className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {isAddingPrescription
                      ? "Adding..."
                      : "Add prescription"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Follow-ups */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <h2 className="font-semibold text-gray-950">
                Follow-ups
              </h2>
            </div>

            <div className="space-y-5 p-5">
              {followUpsLoading ? (
                <p className="text-sm text-gray-500">
                  Loading follow-ups...
                </p>
              ) : followUps.length > 0 ? (
                <div className="space-y-2">
                  {followUps.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <p className="font-medium text-gray-950">
                        {item.description}
                      </p>

                      {item.due_date && (
                        <p className="mt-1 text-sm text-gray-500">
                          Due:{" "}
                          {new Date(
                            item.due_date,
                          ).toLocaleDateString(
                            "en-IN",
                          )}
                        </p>
                      )}

                      <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                        {item.status}
                      </p>

                      {item.notes && (
                        <p className="mt-2 text-sm text-gray-600">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No follow-ups recorded.
                </p>
              )}

              <form
                onSubmit={handleCreateFollowUp}
                className="space-y-4 border-t border-gray-200 pt-5"
              >
                <TextArea
                  label="Follow-up action"
                  value={
                    followUpForm.description
                  }
                  onChange={(value) =>
                    setFollowUpForm(
                      (current) => ({
                        ...current,
                        description: value,
                      }),
                    )
                  }
                  required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Due date"
                    type="date"
                    value={
                      followUpForm.due_date
                    }
                    onChange={(value) =>
                      setFollowUpForm(
                        (current) => ({
                          ...current,
                          due_date: value,
                        }),
                      )
                    }
                  />

                  <TextArea
                    label="Notes"
                    value={followUpForm.notes}
                    onChange={(value) =>
                      setFollowUpForm(
                        (current) => ({
                          ...current,
                          notes: value,
                        }),
                      )
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAddingFollowUp}
                  className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {isAddingFollowUp
                    ? "Adding..."
                    : "Add follow-up"}
                </button>
              </form>
            </div>
          </section>

          {/* Complete */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-gray-950">
                  Complete consultation
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Complete the clinical encounter after
                  all required information has been recorded.
                </p>
              </div>

              <button
                type="button"
                onClick={handleComplete}
                disabled={isCompleting}
                className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCompleting
                  ? "Completing..."
                  : "Complete consultation"}
              </button>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm text-gray-900">
        {value}
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-gray-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-950"
      />
    </label>
  );
}

function TextArea({
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
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-gray-700">
        {label}
      </span>

      <textarea
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        rows={3}
        className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-950"
      />
    </label>
  );
}