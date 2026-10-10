"use client";

import { useState } from "react";
import { downloadMedicalRecordDocument } from "@/features/records/api";
import { RoleRoute } from "@/components/navigation/RoleRoute";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ROLES } from "@/constants/roles";

import {
  usePatientProfile,
  useUpdatePatientProfile,
} from "@/features/patients/hooks";

import {
  useCreateEmergencyContact,
  useDeleteEmergencyContact,
  useEmergencyContacts,
} from "@/features/emergency/hooks";

import type {
  EmergencyRelationship,
} from "@/features/emergency/api";

const relationships: {
  value: EmergencyRelationship;
  label: string;
}[] = [
    { value: "PARENT", label: "Parent" },
    { value: "SPOUSE", label: "Spouse" },
    { value: "SIBLING", label: "Sibling" },
    { value: "CHILD", label: "Child" },
    { value: "FRIEND", label: "Friend" },
    { value: "RELATIVE", label: "Relative" },
    { value: "OTHER", label: "Other" },
  ];

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const bloodGroupOptions = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export default function PatientProfilePage() {
  const profileQuery = usePatientProfile();
  const updateMutation = useUpdatePatientProfile();

  const contactsQuery = useEmergencyContacts();
  const createContact = useCreateEmergencyContact();
  const deleteContact = useDeleteEmergencyContact();

  const profile = profileQuery.data;

  const [formProfileId, setFormProfileId] =
    useState<string | null>(null);

  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] =
    useState<EmergencyRelationship>("PARENT");
  const [isPrimary, setIsPrimary] = useState(false);

  /*
   * Initialize the local form once the profile has loaded.
   */
  if (profile && formProfileId !== profile.id) {
    setFormProfileId(profile.id);
    setGender(profile.gender ?? "");
    setBloodGroup(profile.blood_group ?? "");

    setHeight(
      profile.height_cm !== null
        ? String(profile.height_cm)
        : "",
    );

    setWeight(
      profile.weight_kg !== null
        ? String(profile.weight_kg)
        : "",
    );
  }

  if (profileQuery.isLoading) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <LoadingState message="Loading profile..." />
      </RoleRoute>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <ErrorState
          title="Unable to load profile"
          description="Your profile could not be loaded."
          onRetry={() => profileQuery.refetch()}
        />
      </RoleRoute>
    );
  }

  async function submitProfile(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    await updateMutation.mutateAsync({
      gender: gender || null,
      blood_group: bloodGroup || null,
      height_cm: height ? Number(height) : null,
      weight_kg: weight ? Number(weight) : null,
    });

    await profileQuery.refetch();
  }

  async function submitContact(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    await createContact.mutateAsync({
      name: name.trim(),
      phone: phone.trim(),
      relationship,
      is_primary: isPrimary,
    });

    setName("");
    setPhone("");
    setRelationship("PARENT");
    setIsPrimary(false);
  }

  return (
    <RoleRoute allowedRoles={[ROLES.PATIENT]}>
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Header */}
        <div>
          <p className="text-sm font-medium text-gray-500">
            Patient workspace
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-gray-950">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your personal health information and emergency
            contacts.
          </p>
        </div>

        {/* Profile */}
        <form
          onSubmit={submitProfile}
          className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="font-semibold text-gray-950">
              Personal health information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Keep your basic health information up to date.
            </p>
          </div>

          {/* HealthOS UID */}
          <div>
            <label
              htmlFor="healthos-uid"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              HealthOS UID
            </label>

            <input
              id="healthos-uid"
              value={profile.healthos_uid}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Gender
            </label>

            <select
              id="gender"
              value={gender}
              onChange={(event) =>
                setGender(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900"
            >
              <option value="">Select gender</option>

              {genderOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Blood Group */}
          <div>
            <label
              htmlFor="blood-group"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Blood Group
            </label>

            <select
              id="blood-group"
              value={bloodGroup}
              onChange={(event) =>
                setBloodGroup(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900"
            >
              <option value="">
                Select blood group
              </option>

              {bloodGroupOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Height / Weight */}
          <div className="grid gap-4 sm:grid-cols-2">

            <div>
              <label
                htmlFor="height"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Height (cm)
              </label>

              <input
                id="height"
                type="number"
                min="30"
                max="300"
                step="0.1"
                value={height}
                onChange={(event) =>
                  setHeight(event.target.value)
                }
                placeholder="e.g. 170"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="weight"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Weight (kg)
              </label>

              <input
                id="weight"
                type="number"
                min="1"
                max="500"
                step="0.1"
                value={weight}
                onChange={(event) =>
                  setWeight(event.target.value)
                }
                placeholder="e.g. 70"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>

          </div>

          {updateMutation.isError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Unable to update profile. Please check the
              information and try again.
            </p>
          )}

          {updateMutation.isSuccess && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              Profile updated successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateMutation.isPending
              ? "Saving..."
              : "Save changes"}
          </button>
        </form>

        {/* Emergency contacts */}
        <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div>
            <h2 className="font-semibold text-gray-950">
              Emergency contacts
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              People who can be contacted during an emergency.
            </p>
          </div>

          {contactsQuery.isLoading && (
            <LoadingState message="Loading emergency contacts..." />
          )}

          {contactsQuery.isError && (
            <ErrorState
              title="Unable to load emergency contacts"
              onRetry={() => contactsQuery.refetch()}
            />
          )}

          {contactsQuery.isSuccess &&
            contactsQuery.data.length === 0 && (
              <EmptyState
                title="No emergency contacts"
                description="Add someone who can be contacted during an emergency."
              />
            )}

          {contactsQuery.isSuccess &&
            contactsQuery.data.length > 0 && (
              <div className="space-y-3">
                {contactsQuery.data.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-gray-950">
                          {contact.name}
                        </p>

                        {contact.is_primary && (
                          <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
                            Primary
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        {relationshipLabel(
                          contact.relationship,
                        )}
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {contact.phone}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={deleteContact.isPending}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Remove ${contact.name} as an emergency contact?`,
                          )
                        ) {
                          deleteContact.mutate(contact.id);
                        }
                      }}
                      className="w-fit rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

          <form
            onSubmit={submitContact}
            className="border-t border-gray-100 pt-5"
          >
            <h3 className="font-medium text-gray-950">
              Add emergency contact
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Name
                </label>

                <input
                  id="contact-name"
                  required
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Full name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-phone"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>

                <input
                  id="contact-phone"
                  required
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="10–15 digit number"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-relationship"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Relationship
                </label>

                <select
                  id="contact-relationship"
                  value={relationship}
                  onChange={(event) =>
                    setRelationship(
                      event.target.value as EmergencyRelationship,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900"
                >
                  {relationships.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(event) =>
                    setIsPrimary(event.target.checked)
                  }
                />

                Set as primary contact
              </label>
            </div>

            {createContact.isError && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                Unable to add emergency contact. Check the
                phone number and try again.
              </p>
            )}

            {deleteContact.isError && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                Unable to remove the emergency contact.
              </p>
            )}

            <button
              type="submit"
              disabled={createContact.isPending}
              className="mt-4 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createContact.isPending
                ? "Adding..."
                : "Add contact"}
            </button>
          </form>
        </section>
      </div>
    </RoleRoute>
  );
}

function relationshipLabel(
  relationship: EmergencyRelationship,
) {
  return (
    relationships.find(
      (item) => item.value === relationship,
    )?.label ?? relationship
  );
}