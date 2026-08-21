"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAllergy,
  createMedicalCondition,
  deleteAllergy,
  deleteMedicalCondition,
  getAllergies,
  getMedicalConditions,
  updateAllergy,
  updateMedicalCondition,
  type CreateAllergyRequest,
  type CreateConditionRequest,
} from "./api";

export const clinicalKeys = {
  all: ["clinical"] as const,
  allergies: () => [...clinicalKeys.all, "allergies"] as const,
  conditions: () => [...clinicalKeys.all, "conditions"] as const,
};

export function useAllergies() {
  return useQuery({
    queryKey: clinicalKeys.allergies(),
    queryFn: getAllergies,
  });
}

export function useCreateAllergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAllergyRequest) =>
      createAllergy(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.allergies(),
      });
    },
  });
}

export function useUpdateAllergy(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateAllergyRequest>) =>
      updateAllergy(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.allergies(),
      });
    },
  });
}

export function useDeleteAllergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllergy,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.allergies(),
      });
    },
  });
}

export function useMedicalConditions() {
  return useQuery({
    queryKey: clinicalKeys.conditions(),
    queryFn: getMedicalConditions,
  });
}

export function useCreateMedicalCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConditionRequest) =>
      createMedicalCondition(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.conditions(),
      });
    },
  });
}

export function useUpdateMedicalCondition(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateConditionRequest>) =>
      updateMedicalCondition(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.conditions(),
      });
    },
  });
}

export function useDeleteMedicalCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedicalCondition,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.conditions(),
      });
    },
  });
}