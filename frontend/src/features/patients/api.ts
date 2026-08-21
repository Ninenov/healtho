import { apiClient } from "@/services/api/client";

export interface PatientProfile {
  id: string;
  healthos_uid: string;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  profile_photo: string | null;
}

export async function getPatientProfile(): Promise<PatientProfile> {
  const response = await apiClient.get<PatientProfile>("/patients/me/");
  return response.data;
}

export async function updatePatientProfile(
  data: Partial<PatientProfile>,
): Promise<PatientProfile> {
  const response = await apiClient.patch<PatientProfile>(
    "/patients/me/",
    data,
  );

  return response.data;
}