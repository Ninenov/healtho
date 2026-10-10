"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createDoctorAvailability,
  deleteDoctorAvailability,
  getDoctor,
  getDoctorAvailability,
  getDoctorPatientAvailability,
  getDoctors,
  updateDoctorAvailability,
  type CreateDoctorAvailabilityRequest,
  type DoctorAvailability,
} from "./api";

export const doctorKeys = {
  all: ["doctors"] as const,

  list: () =>
    [...doctorKeys.all, "list"] as const,

  detail: (id: string) =>
    [...doctorKeys.all, "detail", id] as const,

  availability: () =>
    [...doctorKeys.all, "availability"] as const,

  patientAvailability: (doctorId: string) =>
    [
      ...doctorKeys.all,
      "patient-availability",
      doctorId,
    ] as const,
};

export function useDoctors() {
  return useQuery({
    queryKey: doctorKeys.list(),
    queryFn: getDoctors,
    staleTime: 60_000,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => getDoctor(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

/**
 * Used by patients while booking an appointment.
 */
export function useDoctorPatientAvailability(
  doctorId: string,
) {
  return useQuery({
    queryKey:
      doctorKeys.patientAvailability(doctorId),
    queryFn: () =>
      getDoctorPatientAvailability(doctorId),
    enabled: Boolean(doctorId),
    staleTime: 60_000,
  });
}

/**
 * Used by doctors to manage their own availability.
 */
export function useDoctorAvailability() {
  return useQuery({
    queryKey: doctorKeys.availability(),
    queryFn: getDoctorAvailability,
    staleTime: 60_000,
  });
}

export function useCreateDoctorAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateDoctorAvailabilityRequest,
    ) => createDoctorAvailability(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: doctorKeys.availability(),
      });
    },
  });
}

export function useUpdateDoctorAvailability(
  id: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Partial<CreateDoctorAvailabilityRequest>,
    ) => updateDoctorAvailability(id, data),

    onSuccess: (availability) => {
      queryClient.setQueryData(
        doctorKeys.availability(),
        (
          current:
            | DoctorAvailability[]
            | undefined,
        ) =>
          current?.map((item) =>
            item.id === availability.id
              ? availability
              : item,
          ),
      );
    },
  });
}

export function useDeleteDoctorAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      deleteDoctorAvailability(id),

    onSuccess: (_, id) => {
      queryClient.setQueryData(
        doctorKeys.availability(),
        (
          current:
            | DoctorAvailability[]
            | undefined,
        ) =>
          current?.filter(
            (item) => item.id !== id,
          ),
      );
    },
  });
}