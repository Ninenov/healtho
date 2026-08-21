"use client";

import { useState } from "react";

import { RoleRoute } from "@/components/navigation/RoleRoute";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { ROLES } from "@/constants/roles";
import {
  usePatientProfile,
  useUpdatePatientProfile,
} from "@/features/patients/hooks";

export default function PatientProfilePage() {
  const profileQuery = usePatientProfile();
  const updateMutation = useUpdatePatientProfile();

  const profile = profileQuery.data;

  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  if (profileQuery.isLoading) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <LoadingState />
      </RoleRoute>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <ErrorState
          title="Unable to load profile"
          onRetry={() => profileQuery.refetch()}
        />
      </RoleRoute>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    await updateMutation.mutateAsync({
      gender: gender || profile.gender,
      blood_group: bloodGroup || profile.blood_group,
      height_cm: height
        ? Number(height)
        : profile.height_cm,
      weight_kg: weight
        ? Number(weight)
        : profile.weight_kg,
    });
  };

  return (
    <RoleRoute allowedRoles={[ROLES.PATIENT]}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your personal health information.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-5 rounded-xl border bg-white p-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              HealthOS UID
            </label>

            <input
              value={profile.healthos_uid}
              disabled
              className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Gender
            </label>

            <input
              defaultValue={profile.gender ?? ""}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Blood Group
            </label>

            <input
              defaultValue={profile.blood_group ?? ""}
              onChange={(e) =>
                setBloodGroup(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Height (cm)
              </label>

              <input
                type="number"
                defaultValue={profile.height_cm ?? ""}
                onChange={(e) =>
                  setHeight(e.target.value)
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Weight (kg)
              </label>

              <input
                type="number"
                defaultValue={profile.weight_kg ?? ""}
                onChange={(e) =>
                  setWeight(e.target.value)
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {updateMutation.isError && (
            <p className="text-sm text-red-600">
              Unable to update profile. Please check your
              information and try again.
            </p>
          )}

          {updateMutation.isSuccess && (
            <p className="text-sm text-green-600">
              Profile updated successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {updateMutation.isPending
              ? "Saving..."
              : "Save changes"}
          </button>
        </form>
      </div>
    </RoleRoute>
  );
}