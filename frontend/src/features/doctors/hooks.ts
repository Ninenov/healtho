"use client";


import type { DoctorAvailability } from "./api";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createDoctorAvailability,
  deleteDoctorAvailability,
  getDoctorAvailability,
  updateDoctorAvailability,
  type CreateDoctorAvailabilityRequest,
} from "./api";

export const doctorKeys = {
  all: ["doctors"] as const,
  availability: () =>
    [...doctorKeys.all, "availability"] as const,
};

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
    mutationFn: (data: CreateDoctorAvailabilityRequest) =>
      createDoctorAvailability(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: doctorKeys.availability(),
      });
    },
  });
}

export function useUpdateDoctorAvailability(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Partial<CreateDoctorAvailabilityRequest>,
    ) => updateDoctorAvailability(id, data),

    onSuccess: (availability) => {
      queryClient.setQueryData(
        doctorKeys.availability(),
        (current: DoctorAvailability[] | undefined) =>
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
        (current: DoctorAvailability[] | undefined) =>
          current?.filter((item) => item.id !== id),
      );
    },
  });
}