import { apiClient } from "@/services/api/client";

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalCondition {
  id: string;
  name: string;
  diagnosed_on: string | null;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAllergyRequest {
  allergen: string;
  reaction: string;
  severity: string;
  notes?: string;
}

export interface CreateConditionRequest {
  name: string;
  diagnosed_on?: string | null;
  status: string;
  notes?: string;
}

export async function getAllergies(): Promise<Allergy[]> {
  const response = await apiClient.get<Allergy[]>(
    "/clinical/allergies/",
  );

  return response.data;
}

export async function createAllergy(
  data: CreateAllergyRequest,
): Promise<Allergy> {
  const response = await apiClient.post<Allergy>(
    "/clinical/allergies/",
    data,
  );

  return response.data;
}

export async function updateAllergy(
  id: string,
  data: Partial<CreateAllergyRequest>,
): Promise<Allergy> {
  const response = await apiClient.patch<Allergy>(
    `/clinical/allergies/${id}/`,
    data,
  );

  return response.data;
}

export async function deleteAllergy(id: string) {
  await apiClient.delete(`/clinical/allergies/${id}/`);
}

export async function getMedicalConditions(): Promise<
  MedicalCondition[]
> {
  const response = await apiClient.get<MedicalCondition[]>(
    "/clinical/conditions/",
  );

  return response.data;
}

export async function createMedicalCondition(
  data: CreateConditionRequest,
): Promise<MedicalCondition> {
  const response = await apiClient.post<MedicalCondition>(
    "/clinical/conditions/",
    data,
  );

  return response.data;
}

export async function updateMedicalCondition(
  id: string,
  data: Partial<CreateConditionRequest>,
): Promise<MedicalCondition> {
  const response = await apiClient.patch<MedicalCondition>(
    `/clinical/conditions/${id}/`,
    data,
  );

  return response.data;
}

export async function deleteMedicalCondition(id: string) {
  await apiClient.delete(`/clinical/conditions/${id}/`);
}