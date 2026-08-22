"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  createAppointment,
  getAppointment,
  getAppointments,
  getDoctorAppointments,
  noShowAppointment,
  startAppointment,
  updateAppointment,
  type Appointment,
  type CreateAppointmentRequest,
} from "./api";

export const appointmentKeys = {
  all: ["appointments"] as const,

  list: () =>
    [...appointmentKeys.all, "list"] as const,

  doctorList: () =>
    [...appointmentKeys.all, "doctor-list"] as const,

  detail: (id: string) =>
    [...appointmentKeys.all, "detail", id] as const,
};

export function useAppointments() {
  return useQuery({
    queryKey: appointmentKeys.list(),
    queryFn: getAppointments,
  });
}

export function useDoctorAppointments() {
  return useQuery({
    queryKey: appointmentKeys.doctorList(),
    queryFn: getDoctorAppointments,
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
    mutationFn: (
      data: CreateAppointmentRequest,
    ) => createAppointment(data),

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

      queryClient.invalidateQueries({
        queryKey: appointmentKeys.doctorList(),
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

      queryClient.invalidateQueries({
        queryKey: appointmentKeys.doctorList(),
      });
    },
  });
}

function useAppointmentLifecycleMutation(
  mutationFn: (
    id: string,
  ) => Promise<Appointment>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,

    onSuccess: (appointment) => {
      queryClient.setQueryData(
        appointmentKeys.detail(appointment.id),
        appointment,
      );

      queryClient.invalidateQueries({
        queryKey: appointmentKeys.list(),
      });

      queryClient.invalidateQueries({
        queryKey: appointmentKeys.doctorList(),
      });
    },
  });
}

export function useConfirmAppointment() {
  return useAppointmentLifecycleMutation(
    confirmAppointment,
  );
}

export function useStartAppointment() {
  return useAppointmentLifecycleMutation(
    startAppointment,
  );
}

export function useCompleteAppointment() {
  return useAppointmentLifecycleMutation(
    completeAppointment,
  );
}

export function useNoShowAppointment() {
  return useAppointmentLifecycleMutation(
    noShowAppointment,
  );
}