"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createEmergencyContact,
  deleteEmergencyContact,
  getEmergencyContacts,
  updateEmergencyContact,
  type CreateEmergencyContactRequest,
  type EmergencyContact,
  type UpdateEmergencyContactRequest,
} from "./api";

export const emergencyKeys = {
  all: ["emergency"] as const,
  contacts: () =>
    [...emergencyKeys.all, "contacts"] as const,
};

export function useEmergencyContacts() {
  return useQuery({
    queryKey: emergencyKeys.contacts(),
    queryFn: getEmergencyContacts,
    staleTime: 60_000,
  });
}

export function useCreateEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateEmergencyContactRequest,
    ) => createEmergencyContact(data),

    onSuccess: (contact) => {
      queryClient.setQueryData<EmergencyContact[]>(
        emergencyKeys.contacts(),
        (current) => {
          if (!current) {
            return [contact];
          }

          return [...current, contact];
        },
      );
    },
  });
}

export function useUpdateEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEmergencyContactRequest;
    }) => updateEmergencyContact(id, data),

    onSuccess: (contact) => {
      queryClient.setQueryData<EmergencyContact[]>(
        emergencyKeys.contacts(),
        (current) =>
          current?.map((item) =>
            item.id === contact.id
              ? contact
              : item,
          ),
      );
    },
  });
}

export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      deleteEmergencyContact(id),

    onSuccess: (_, id) => {
      queryClient.setQueryData<EmergencyContact[]>(
        emergencyKeys.contacts(),
        (current) =>
          current?.filter(
            (item) => item.id !== id,
          ),
      );
    },
  });
}