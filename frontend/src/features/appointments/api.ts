import { apiClient } from "@/services/api/client";

export interface Appointment {
  id: string;
  patient: string;
  doctor: string;
  appointment_type: string;
  scheduled_at: string;
  status: string;
  reason: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentRequest {
  doctor: string;
  appointment_type: string;
  scheduled_at: string;
  reason?: string;
  notes?: string;
}

export async function getAppointments(): Promise<Appointment[]> {
  const response = await apiClient.get<Appointment[]>(
    "/appointments/",
  );

  return response.data;
}

export async function getAppointment(
  appointmentId: string,
): Promise<Appointment> {
  const response = await apiClient.get<Appointment>(
    `/appointments/${appointmentId}/`,
  );

  return response.data;
}

export async function createAppointment(
  data: CreateAppointmentRequest,
): Promise<Appointment> {
  const response = await apiClient.post<Appointment>(
    "/appointments/",
    data,
  );

  return response.data;
}

export async function updateAppointment(
  appointmentId: string,
  data: Partial<CreateAppointmentRequest>,
): Promise<Appointment> {
  const response = await apiClient.patch<Appointment>(
    `/appointments/${appointmentId}/`,
    data,
  );

  return response.data;
}

export async function cancelAppointment(
  appointmentId: string,
): Promise<Appointment> {
  const response = await apiClient.post<Appointment>(
    `/appointments/${appointmentId}/cancel/`,
  );

  return response.data;
}

export async function getDoctorAppointments(): Promise<
  Appointment[]
> {
  const response = await apiClient.get<Appointment[]>(
    "/appointments/doctor/",
  );

  return response.data;
}

export async function confirmAppointment(
  appointmentId: string,
): Promise<Appointment> {
  const response = await apiClient.post<Appointment>(
    `/appointments/${appointmentId}/confirm/`,
  );

  return response.data;
}

export async function startAppointment(
  appointmentId: string,
): Promise<Appointment> {
  const response = await apiClient.post<Appointment>(
    `/appointments/${appointmentId}/start/`,
  );

  return response.data;
}

export async function completeAppointment(
  appointmentId: string,
): Promise<Appointment> {
  const response = await apiClient.post<Appointment>(
    `/appointments/${appointmentId}/complete/`,
  );

  return response.data;
}

export async function noShowAppointment(
  appointmentId: string,
): Promise<Appointment> {
  const response = await apiClient.post<Appointment>(
    `/appointments/${appointmentId}/no-show/`,
  );

  return response.data;
}