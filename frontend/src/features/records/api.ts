import { apiClient } from "@/services/api/client";

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

export interface CreateMedicalRecordRequest {
  record_type: string;
  title: string;
  description?: string;
  record_date: string;
}

export async function getMedicalRecords(): Promise<MedicalRecord[]> {
  const response = await apiClient.get<MedicalRecord[]>("/records/");
  return response.data;
}

export async function getMedicalRecord(
  id: string,
): Promise<MedicalRecord> {
  const response = await apiClient.get<MedicalRecord>(
    `/records/${id}/`,
  );

  return response.data;
}

export async function createMedicalRecord(
  data: CreateMedicalRecordRequest,
): Promise<MedicalRecord> {
  const response = await apiClient.post<MedicalRecord>(
    "/records/",
    data,
  );

  return response.data;
}

export async function updateMedicalRecord(
  id: string,
  data: Partial<CreateMedicalRecordRequest>,
): Promise<MedicalRecord> {
  const response = await apiClient.patch<MedicalRecord>(
    `/records/${id}/`,
    data,
  );

  return response.data;
}

export async function deleteMedicalRecord(
  id: string,
): Promise<void> {
  await apiClient.delete(`/records/${id}/`);
}