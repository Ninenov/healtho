"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getPatient,
  getPatientProfile,
  updatePatientProfile,
  type UpdatePatientProfileRequest,
} from "./api";

export const patientKeys = {
  all: ["patients"] as const,

  detail: (id: string) =>
    [...patientKeys.all, "detail", id] as const,

  profile: () =>
    [...patientKeys.all, "profile"] as const,
};

/**
 * Doctor-facing patient lookup.
 */
export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => getPatient(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

/**
 * Patient's own profile.
 */
export function usePatientProfile() {
  return useQuery({
    queryKey: patientKeys.profile(),
    queryFn: getPatientProfile,
    staleTime: 60_000,
  });
}

/**
 * Patient's own profile update.
 */
export function useUpdatePatientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: UpdatePatientProfileRequest,
    ) => updatePatientProfile(data),

    onSuccess: (profile) => {
      queryClient.setQueryData(
        patientKeys.profile(),
        profile,
      );
    },
  });
}