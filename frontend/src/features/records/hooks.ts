"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecord,
  getMedicalRecords,
  updateMedicalRecord,
  type CreateMedicalRecordRequest,
} from "./api";

export const recordKeys = {
  all: ["medical-records"] as const,
  list: () => [...recordKeys.all, "list"] as const,
  detail: (id: string) => [...recordKeys.all, "detail", id] as const,
};

export function useMedicalRecords() {
  return useQuery({
    queryKey: recordKeys.list(),
    queryFn: getMedicalRecords,
  });
}

export function useMedicalRecord(id: string) {
  return useQuery({
    queryKey: recordKeys.detail(id),
    queryFn: () => getMedicalRecord(id),
    enabled: Boolean(id),
  });
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMedicalRecordRequest) =>
      createMedicalRecord(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: recordKeys.list(),
      });
    },
  });
}

export function useUpdateMedicalRecord(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Partial<CreateMedicalRecordRequest>,
    ) => updateMedicalRecord(id, data),

    onSuccess: (record) => {
      queryClient.setQueryData(
        recordKeys.detail(id),
        record,
      );

      queryClient.invalidateQueries({
        queryKey: recordKeys.list(),
      });
    },
  });
}

export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMedicalRecord(id),

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: recordKeys.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: recordKeys.list(),
      });
    },
  });
}