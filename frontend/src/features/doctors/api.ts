import { apiClient } from "@/services/api/client";

export interface DoctorAvailability {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface CreateDoctorAvailabilityRequest {
  weekday: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export async function getDoctorAvailability(): Promise<
  DoctorAvailability[]
> {
  const response = await apiClient.get<DoctorAvailability[]>(
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