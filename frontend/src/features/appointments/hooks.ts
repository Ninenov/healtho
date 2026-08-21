"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  cancelAppointment,
  createAppointment,
  getAppointment,
  getAppointments,
  updateAppointment,
  type CreateAppointmentRequest,
} from "./api";

export const appointmentKeys = {
  all: ["appointments"] as const,
  list: () => [...appointmentKeys.all, "list"] as const,
  detail: (id: string) =>
    [...appointmentKeys.all, "detail", id] as const,
};

export function useAppointments() {
  return useQuery({
    queryKey: appointmentKeys.list(),
    queryFn: getAppointments,
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => getAppointment(id),
    enabled: Boolean(id),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) =>
      createAppointment(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.list(),
      });
    },
  });
}

export function useUpdateAppointment(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Partial<CreateAppointmentRequest>,
    ) => updateAppointment(id, data),

    onSuccess: (appointment) => {
      queryClient.setQueryData(
        appointmentKeys.detail(id),
        appointment,
      );

      queryClient.invalidateQueries({
        queryKey: appointmentKeys.list(),
      });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      cancelAppointment(id),

    onSuccess: (appointment) => {
      queryClient.setQueryData(
        appointmentKeys.detail(appointment.id),
        appointment,
      );

      queryClient.invalidateQueries({
        queryKey: appointmentKeys.list(),
      });
    },
  });
}