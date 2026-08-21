"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getPatientProfile,
  updatePatientProfile,
  type PatientProfile,
} from "./api";

export const patientKeys = {
  all: ["patients"] as const,
  profile: () => [...patientKeys.all, "profile"] as const,
};

export function usePatientProfile() {
  return useQuery({
    queryKey: patientKeys.profile(),
    queryFn: getPatientProfile,
  });
}

export function useUpdatePatientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PatientProfile>) =>
      updatePatientProfile(data),

    onSuccess: (profile) => {
      queryClient.setQueryData(
        patientKeys.profile(),
        profile,
      );
    },
  });
}