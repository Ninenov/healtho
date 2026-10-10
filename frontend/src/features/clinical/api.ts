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

export interface ClinicalHistory {
  patient_id: string;
  history: ClinicalHistoryEntry[];
}

export interface ClinicalHistoryEntry {
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
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  follow_ups: FollowUp[];
  created_at: string;
  updated_at: string;
}

export async function getPatientClinicalHistory(
  patientId: string,
): Promise<ClinicalHistory> {
  const response =
    await apiClient.get<ClinicalHistory>(
      `/clinical/patients/${patientId}/history/`,
    );

  return response.data;
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalCondition {
  id: string;
  name: string;
  diagnosed_on: string | null;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  patient: string;
  patient_uid: string;
  record_type: string;
  title: string;
  description: string;
  record_date: string;
  created_at: string;
  updated_at: string;
}

export interface PatientClinical {
  patient: string;
  allergies: Allergy[];
  medical_conditions: MedicalCondition[];
  medical_records: MedicalRecord[];
}

export async function getPatientClinical(
  patientId: string,
): Promise<PatientClinical> {
  const response =
    await apiClient.get<PatientClinical>(
      `/clinical/patients/${patientId}/`,
    );

  return response.data;
}

export interface ClinicalContext {
  patient: string;
  allergies: Allergy[];
  medical_conditions: MedicalCondition[];
  medical_records: MedicalRecord[];
  encounters: ClinicalHistoryEntry[];
}

export async function getPatientClinicalContext(
  patientId: string,
): Promise<ClinicalContext> {
  const response =
    await apiClient.get<ClinicalContext>(
      `/clinical/patients/${patientId}/context/`,
    );

  return response.data;
}
export interface MyClinicalHistoryEntry extends ClinicalEncounter {
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  follow_ups: FollowUp[];
}

export async function getMyClinicalHistory(): Promise<
  MyClinicalHistoryEntry[]
> {
  const response = await apiClient.get<MyClinicalHistoryEntry[]>(
    "/clinical/my-history/",
  );

  return response.data;
}


export interface ClinicalAttachment {
  id: string;
  title: string;
  description: string;
  category: string;
  category_display?: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  download_url?: string;
}

export interface UploadClinicalAttachmentRequest {
  file: File;
  title: string;
  description?: string;
  category?: string;
}

export async function getClinicalAttachments(
  encounterId: string,
): Promise<ClinicalAttachment[]> {
  const response = await apiClient.get<ClinicalAttachment[]>(
    `/clinical/encounters/${encounterId}/attachments/`,
  );

  return response.data;
}

export async function uploadClinicalAttachment(
  encounterId: string,
  data: UploadClinicalAttachmentRequest,
): Promise<ClinicalAttachment> {
  const formData = new FormData();

  formData.append("file", data.file);
  formData.append("title", data.title);
  formData.append("description", data.description || "");
  formData.append("category", data.category || "OTHER");

  const response = await apiClient.post<ClinicalAttachment>(
    `/clinical/encounters/${encounterId}/attachments/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

export async function downloadClinicalAttachment(
  attachmentId: string,
): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `/clinical/attachments/${attachmentId}/download/`,
    {
      responseType: "blob",
    },
  );

  return response.data;
}
