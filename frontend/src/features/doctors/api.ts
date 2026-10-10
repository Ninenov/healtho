import { apiClient } from "@/services/api/client";

export interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  qualification: string;
  license_number: string | null;
}

export interface DoctorAvailability {
  id: string;
  doctor: string;
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDoctorAvailabilityRequest {
  weekday: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export async function getDoctors(): Promise<Doctor[]> {
  const response = await apiClient.get<Doctor[]>("/doctors/");
  return response.data;
}

export async function getDoctor(
  doctorId: string,
): Promise<Doctor> {
  const response = await apiClient.get<Doctor>(
    `/doctors/${doctorId}/`,
  );

  return response.data;
}

export async function getDoctorPatientAvailability(
  doctorId: string,
): Promise<DoctorAvailability[]> {
  const response =
    await apiClient.get<DoctorAvailability[]>(
      `/doctors/${doctorId}/availability/`,
    );

  return response.data;
}

export async function getDoctorAvailability(): Promise<
  DoctorAvailability[]
> {
  const response =
    await apiClient.get<DoctorAvailability[]>(
      "/doctors/availability/",
    );

  return response.data;
}

export async function createDoctorAvailability(
  data: CreateDoctorAvailabilityRequest,
): Promise<DoctorAvailability> {
  const response =
    await apiClient.post<DoctorAvailability>(
      "/doctors/availability/",
      data,
    );

  return response.data;
}

export async function updateDoctorAvailability(
  id: string,
  data: Partial<CreateDoctorAvailabilityRequest>,
): Promise<DoctorAvailability> {
  const response =
    await apiClient.patch<DoctorAvailability>(
      `/doctors/availability/${id}/`,
      data,
    );

  return response.data;
}

export async function deleteDoctorAvailability(
  id: string,
): Promise<void> {
  await apiClient.delete(
    `/doctors/availability/${id}/`,
  );
}