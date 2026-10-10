"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { getMyClinicalHistory } from "./api";

import {
  completeEncounter,
  createDiagnosis,
  createEncounter,
  createFollowUp,
  createPrescription,
  getDiagnoses,
  getEncounter,
  getFollowUps,
  getPatientClinicalHistory,
  getPrescriptions,
  getPatientClinical,
  getPatientClinicalContext,
  type CreateDiagnosisRequest,
  type CreateEncounterRequest,
  type CreateFollowUpRequest,
  type CreatePrescriptionRequest,
} from "./api";

export const clinicalKeys = {
  all: ["clinical"] as const,

  encounter: (appointmentId: string) =>
    [...clinicalKeys.all, "encounter", appointmentId] as const,

  diagnoses: (encounterId: string) =>
    [...clinicalKeys.all, "diagnoses", encounterId] as const,

  prescriptions: (encounterId: string) =>
    [...clinicalKeys.all, "prescriptions", encounterId] as const,

  followUps: (encounterId: string) =>
    [...clinicalKeys.all, "follow-ups", encounterId] as const,

  patientHistory: (patientId: string) =>
    [...clinicalKeys.all, "patient-history", patientId] as const,
};

export function useEncounter(appointmentId: string) {
  return useQuery({
    queryKey: clinicalKeys.encounter(appointmentId),
    queryFn: () => getEncounter(appointmentId),
    enabled: Boolean(appointmentId),
    retry: false,
  });
}

export function useCreateEncounter(
  appointmentId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEncounterRequest) =>
      createEncounter(appointmentId, data),

    onSuccess: (encounter) => {
      queryClient.setQueryData(
        clinicalKeys.encounter(appointmentId),
        encounter,
      );
    },
  });
}

export function useDiagnoses(encounterId: string) {
  return useQuery({
    queryKey: clinicalKeys.diagnoses(encounterId),
    queryFn: () => getDiagnoses(encounterId),
    enabled: Boolean(encounterId),
  });
}

export function useCreateDiagnosis(
  encounterId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiagnosisRequest) =>
      createDiagnosis(encounterId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.diagnoses(encounterId),
      });
    },
  });
}

export function usePrescriptions(
  encounterId: string,
) {
  return useQuery({
    queryKey:
      clinicalKeys.prescriptions(encounterId),
    queryFn: () => getPrescriptions(encounterId),
    enabled: Boolean(encounterId),
  });
}

export function useCreatePrescription(
  encounterId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreatePrescriptionRequest,
    ) => createPrescription(encounterId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          clinicalKeys.prescriptions(encounterId),
      });
    },
  });
}

export function useFollowUps(encounterId: string) {
  return useQuery({
    queryKey: clinicalKeys.followUps(encounterId),
    queryFn: () => getFollowUps(encounterId),
    enabled: Boolean(encounterId),
  });
}

export function useCreateFollowUp(
  encounterId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFollowUpRequest) =>
      createFollowUp(encounterId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          clinicalKeys.followUps(encounterId),
      });
    },
  });
}

export function useCompleteEncounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (encounterId: string) =>
      completeEncounter(encounterId),

    onSuccess: (encounter) => {
      queryClient.setQueryData(
        clinicalKeys.encounter(
          encounter.appointment,
        ),
        encounter,
      );
    },
  });
}

export function usePatientClinicalHistory(
  patientId: string,
) {
  return useQuery({
    queryKey: clinicalKeys.patientHistory(patientId),
    queryFn: () => getPatientClinicalHistory(patientId),
    enabled: Boolean(patientId),
  });
}

export function usePatientClinical(
  patientId: string,
) {
  return useQuery({
    queryKey: [
      ...clinicalKeys.all,
      "patient",
      patientId,
    ],
    queryFn: () => getPatientClinical(patientId),
    enabled: Boolean(patientId),
  });
}

export function usePatientClinicalContext(
  patientId: string,
) {
  return useQuery({
    queryKey: [
      ...clinicalKeys.all,
      "context",
      patientId,
    ],
    queryFn: () =>
      getPatientClinicalContext(patientId),
    enabled: Boolean(patientId),
  });
}

export function useMyClinicalHistory() {
  return useQuery({
    queryKey: ["clinical", "my-history"],
    queryFn: getMyClinicalHistory,
  });
}