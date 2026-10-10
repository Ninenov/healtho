
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
  document_url?: string | null;
  original_filename?: string;
  mime_type?: string;
  file_size?: number | null;
}

export interface CreateMedicalRecordRequest {
  record_type: string;
  title: string;
  description?: string;
  record_date: string;
}

export interface UploadMedicalRecordRequest
  extends CreateMedicalRecordRequest {
  document: File;
}

export async function getMedicalRecords(): Promise<MedicalRecord[]> {
  const response = await apiClient.get<MedicalRecord[]>("/records/");
  return response.data;
}

export async function getMedicalRecord(
  id: string,
): Promise<MedicalRecord> {
  const response = await apiClient.get<MedicalRecord>(`/records/${id}/`);
  return response.data;
}

export async function createMedicalRecord(
  data: CreateMedicalRecordRequest,
): Promise<MedicalRecord> {
  const response = await apiClient.post<MedicalRecord>("/records/", data);
  return response.data;
}

export async function uploadMedicalRecord(
  data: UploadMedicalRecordRequest,
): Promise<MedicalRecord> {
  const formData = new FormData();

  formData.append("record_type", data.record_type);
  formData.append("title", data.title);
  formData.append("description", data.description ?? "");
  formData.append("record_date", data.record_date);
  formData.append("document", data.document, data.document.name);

  try {
    const response = await apiClient.post<MedicalRecord>(
      "/records/",
      formData,
    );
    return response.data;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error
    ) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: unknown;
        };
      };

      console.error("Medical record upload failed:", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
    } else {
      console.error("Medical record upload failed:", error);
    }

    throw error;
  }
}

export async function downloadMedicalRecordDocument(
  id: string,
  filename: string,
): Promise<void> {
  const response = await apiClient.get<Blob>(
    `/records/${id}/document/`,
    { responseType: "blob" },
  );

  const blobUrl = URL.createObjectURL(response.data);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = filename || "medical-document";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
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

export async function deleteMedicalRecord(id: string): Promise<void> {
  await apiClient.delete(`/records/${id}/`);
}
