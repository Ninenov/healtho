import { apiClient } from "@/services/api/client";

export interface ClinicalEncounter {
  id: string;
  appointment: string;
  patient: string;
  doctor: string;
  chief_complaint: string;
  symptoms: string;
  examination_findings: string;
  assessment: string;
  plan: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEncounterRequest {
  chief_complaint?: string;
  symptoms?: string;
  examination_findings?: string;
  assessment?: string;
  plan?: string;
  notes?: string;
}

export interface Diagnosis {
  id: string;
  diagnosis: string;
  description: string;
  diagnosis_type: string;
  notes: string;
}

export interface CreateDiagnosisRequest {
  diagnosis: string;
  description?: string;
  diagnosis_type?: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

export interface CreatePrescriptionRequest {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string;
  instructions?: string;
}

export interface FollowUp {
  id: string;
  action_type: string;
  description: string;
  due_date: string | null;
  status: string;
  notes: string;
}

export interface CreateFollowUpRequest {
  description: string;
  due_date?: string | null;
  notes?: string;
}

export async function getEncounter(
  appointmentId: string,
): Promise<ClinicalEncounter> {
  const response =
    await apiClient.get<ClinicalEncounter>(
      `/clinical/appointments/${appointmentId}/encounter/`,
    );

  return response.data;
}

export async function createEncounter(
  appointmentId: string,
  data: CreateEncounterRequest,
): Promise<ClinicalEncounter> {
  const response =
    await apiClient.post<ClinicalEncounter>(
      `/clinical/appointments/${appointmentId}/encounter/`,
      data,
    );

  return response.data;
}

export async function getDiagnoses(
  encounterId: string,
): Promise<Diagnosis[]> {
  const response =
    await apiClient.get<Diagnosis[]>(
      `/clinical/encounters/${encounterId}/diagnoses/`,
    );

  return response.data;
}

export async function createDiagnosis(
  encounterId: string,
  data: CreateDiagnosisRequest,
): Promise<Diagnosis> {
  const response =
    await apiClient.post<Diagnosis>(
      `/clinical/encounters/${encounterId}/diagnoses/`,
      data,
    );

  return response.data;
}

export async function getPrescriptions(
  encounterId: string,
): Promise<Prescription[]> {
  const response =
    await apiClient.get<Prescription[]>(
      `/clinical/encounters/${encounterId}/prescriptions/`,
    );

  return response.data;
}

export async function createPrescription(
  encounterId: string,
  data: CreatePrescriptionRequest,
): Promise<Prescription> {
  const response =
    await apiClient.post<Prescription>(
      `/clinical/encounters/${encounterId}/prescriptions/`,
      data,
    );

  return response.data;
}

export async function getFollowUps(
  encounterId: string,
): Promise<FollowUp[]> {
  const response =
    await apiClient.get<FollowUp[]>(
      `/clinical/encounters/${encounterId}/follow-ups/`,
    );

  return response.data;
}

export async function createFollowUp(
  encounterId: string,
  data: CreateFollowUpRequest,
): Promise<FollowUp> {
  const response =
    await apiClient.post<FollowUp>(
      `/clinical/encounters/${encounterId}/follow-ups/`,
      data,
    );

  return response.data;
}

export async function completeEncounter(
  encounterId: string,
): Promise<ClinicalEncounter> {
  const response =
    await apiClient.post<ClinicalEncounter>(
      `/clinical/encounters/${encounterId}/complete/`,
    );

  return response.data;
}