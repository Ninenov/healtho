import { apiClient } from "@/services/api/client";

/* -------------------------------------------------------------------------- */
/* Shared types                                                               */
/* -------------------------------------------------------------------------- */

export interface PatientAddress {
  address_line_1: string;
  address_line_2: string;
  city: string;
  district: string;
  state: string;
  postal_code: string;
  country: string;
}

/* -------------------------------------------------------------------------- */
/* Doctor-facing patient                                                      */
/* -------------------------------------------------------------------------- */

export interface Patient {
  id: string;
  healthos_uid: string;

  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string;

  date_of_birth: string | null;
  gender: string;
  blood_group: string;

  height_cm: string | null;
  weight_kg: string | null;

  profile_photo?: string | null;
  address?: PatientAddress | null;
}

export async function getPatient(
  patientId: string,
): Promise<Patient> {
  const response = await apiClient.get<Patient>(
    `/patients/${patientId}/`,
  );

  return response.data;
}

/* -------------------------------------------------------------------------- */
/* Patient's own profile                                                      */
/* -------------------------------------------------------------------------- */

export interface PatientProfile {
  id: string;
  healthos_uid: string;

  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;

  date_of_birth: string | null;
  gender: string;
  blood_group: string;

  height_cm: string | null;
  weight_kg: string | null;

  profile_photo?: string | null;

  address: PatientAddress | null;
}

export interface UpdatePatientProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string | null;

  date_of_birth?: string | null;
  gender?: string | null;
  blood_group?: string | null;

  height_cm?: number | null;
  weight_kg?: number | null;

  address?: PatientAddress | null;
}

export async function getPatientProfile(): Promise<PatientProfile> {
  const response =
    await apiClient.get<PatientProfile>(
      "/patients/me/",
    );

  return response.data;
}

export async function updatePatientProfile(
  data: UpdatePatientProfileRequest,
): Promise<PatientProfile> {
  const response =
    await apiClient.patch<PatientProfile>(
      "/patients/me/",
      data,
    );

  return response.data;
}