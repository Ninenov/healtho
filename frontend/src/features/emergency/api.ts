import { apiClient } from "@/services/api/client";

export type EmergencyRelationship =
  | "PARENT"
  | "SPOUSE"
  | "SIBLING"
  | "CHILD"
  | "FRIEND"
  | "RELATIVE"
  | "OTHER";

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: EmergencyRelationship;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEmergencyContactRequest {
  name: string;
  phone: string;
  relationship: EmergencyRelationship;
  is_primary?: boolean;
}

export type UpdateEmergencyContactRequest =
  Partial<CreateEmergencyContactRequest>;

export async function getEmergencyContacts(): Promise<
  EmergencyContact[]
> {
  const response = await apiClient.get<EmergencyContact[]>(
    "/emergency/contacts/",
  );

  return response.data;
}

export async function createEmergencyContact(
  data: CreateEmergencyContactRequest,
): Promise<EmergencyContact> {
  const response =
    await apiClient.post<EmergencyContact>(
      "/emergency/contacts/",
      data,
    );

  return response.data;
}

export async function updateEmergencyContact(
  id: string,
  data: UpdateEmergencyContactRequest,
): Promise<EmergencyContact> {
  const response =
    await apiClient.patch<EmergencyContact>(
      `/emergency/contacts/${id}/`,
      data,
    );

  return response.data;
}

export async function deleteEmergencyContact(
  id: string,
): Promise<void> {
  await apiClient.delete(
    `/emergency/contacts/${id}/`,
  );
}