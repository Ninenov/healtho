"use client";

import { useState } from "react";

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

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

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

const inputClassName =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

const selectClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900";

const labelClassName =
  "mb-1 block text-sm font-medium text-gray-700";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function PatientProfilePage() {
  const profileQuery = usePatientProfile();
  const updateMutation = useUpdatePatientProfile();

  const contactsQuery = useEmergencyContacts();
  const createContact = useCreateEmergencyContact();
  const deleteContact = useDeleteEmergencyContact();

  const profile = profileQuery.data;

  /* ------------------------------------------------------------------------ */
  /* Profile form state                                                       */
  /* ------------------------------------------------------------------------ */

  const [formProfileId, setFormProfileId] =
    useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");

  /* ------------------------------------------------------------------------ */
  /* Emergency contact state                                                  */
  /* ------------------------------------------------------------------------ */

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] =
    useState<EmergencyRelationship>("PARENT");
  const [isPrimary, setIsPrimary] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Initialize profile form                                                  */
  /* ------------------------------------------------------------------------ */

  /*
   * Initialize the local form once the profile has loaded.
   *
   * This is intentionally done during render rather than inside
   * useEffect so React's set-state-in-effect lint rule is avoided.
   */
  if (profile && formProfileId !== profile.id) {
    setFormProfileId(profile.id);

    setFirstName(profile.first_name ?? "");
    setLastName(profile.last_name ?? "");
    setEmail(profile.email ?? "");
    setDateOfBirth(profile.date_of_birth ?? "");

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

    setAddressLine1(
      profile.address?.address_line_1 ?? "",
    );

    setAddressLine2(
      profile.address?.address_line_2 ?? "",
    );

    setCity(profile.address?.city ?? "");
    setDistrict(profile.address?.district ?? "");
    setState(profile.address?.state ?? "");

    setPostalCode(
      profile.address?.postal_code ?? "",
    );

    setCountry(
      profile.address?.country || "India",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Loading / error states                                                   */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Profile submission                                                       */
  /* ------------------------------------------------------------------------ */

  async function submitProfile(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    await updateMutation.mutateAsync({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || null,

      date_of_birth: dateOfBirth || null,

      gender: gender || null,
      blood_group: bloodGroup || null,

      height_cm: height
        ? Number(height)
        : null,

      weight_kg: weight
        ? Number(weight)
        : null,

      address: {
        address_line_1: addressLine1.trim(),
        address_line_2: addressLine2.trim(),
        city: city.trim(),
        district: district.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        country: country.trim() || "India",
      },
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Emergency contact submission                                             */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <RoleRoute allowedRoles={[ROLES.PATIENT]}>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* ---------------------------------------------------------------- */}
        {/* Page header                                                       */}
        {/* ---------------------------------------------------------------- */}

        <div>
          <p className="text-sm font-medium text-gray-500">
            Patient workspace
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-gray-950">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information, health details,
            address, and emergency contacts.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Profile                                                           */}
        {/* ---------------------------------------------------------------- */}

        <form
          onSubmit={submitProfile}
          className="space-y-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          {/* ============================================================ */}
          {/* Personal Information                                         */}
          {/* ============================================================ */}

          <section>
            <div>
              <h2 className="font-semibold text-gray-950">
                Personal information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Keep your identity information up to date.
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="first-name"
                  className={labelClassName}
                >
                  First name
                </label>

                <input
                  id="first-name"
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  placeholder="First name"
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="last-name"
                  className={labelClassName}
                >
                  Last name
                </label>

                <input
                  id="last-name"
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  placeholder="Last name"
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="date-of-birth"
                  className={labelClassName}
                >
                  Date of birth
                </label>

                <input
                  id="date-of-birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) =>
                    setDateOfBirth(event.target.value)
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className={labelClassName}
                >
                  Gender
                </label>

                <select
                  id="gender"
                  value={gender}
                  onChange={(event) =>
                    setGender(event.target.value)
                  }
                  className={selectClassName}
                >
                  <option value="">
                    Select gender
                  </option>
                  <option value="MALE">
                    Male
                  </option>
                  <option value="FEMALE">
                    Female
                  </option>
                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* Contact Information                                          */}
          {/* ============================================================ */}

          <section className="border-t border-gray-100 pt-6">
            <div>
              <h2 className="font-semibold text-gray-950">
                Contact information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your phone number is linked to your HealthOS account.
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="phone"
                  className={labelClassName}
                >
                  Phone
                </label>

                <input
                  id="phone"
                  value={profile.phone}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Phone number cannot be changed here.
                </p>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className={labelClassName}
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  className={inputClassName}
                />
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* Address                                                       */}
          {/* ============================================================ */}

          <section className="border-t border-gray-100 pt-6">
            <div>
              <h2 className="font-semibold text-gray-950">
                Address
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add your current residential address.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="address-line-1"
                  className={labelClassName}
                >
                  Address line 1
                </label>

                <input
                  id="address-line-1"
                  type="text"
                  value={addressLine1}
                  onChange={(event) =>
                    setAddressLine1(event.target.value)
                  }
                  placeholder="House number, street, locality"
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="address-line-2"
                  className={labelClassName}
                >
                  Address line 2
                </label>

                <input
                  id="address-line-2"
                  type="text"
                  value={addressLine2}
                  onChange={(event) =>
                    setAddressLine2(event.target.value)
                  }
                  placeholder="Apartment, landmark, area"
                  className={inputClassName}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="city"
                    className={labelClassName}
                  >
                    City
                  </label>

                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(event) =>
                      setCity(event.target.value)
                    }
                    placeholder="City"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="district"
                    className={labelClassName}
                  >
                    District
                  </label>

                  <input
                    id="district"
                    type="text"
                    value={district}
                    onChange={(event) =>
                      setDistrict(event.target.value)
                    }
                    placeholder="District"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className={labelClassName}
                  >
                    State
                  </label>

                  <input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(event) =>
                      setState(event.target.value)
                    }
                    placeholder="State"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="postal-code"
                    className={labelClassName}
                  >
                    Postal code
                  </label>

                  <input
                    id="postal-code"
                    type="text"
                    value={postalCode}
                    onChange={(event) =>
                      setPostalCode(event.target.value)
                    }
                    placeholder="Postal code"
                    className={inputClassName}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="country"
                    className={labelClassName}
                  >
                    Country
                  </label>

                  <input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(event) =>
                      setCountry(event.target.value)
                    }
                    placeholder="Country"
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* Health Information                                            */}
          {/* ============================================================ */}

          <section className="border-t border-gray-100 pt-6">
            <div>
              <h2 className="font-semibold text-gray-950">
                Health information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Keep your basic health information up to date.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="blood-group"
                    className={labelClassName}
                  >
                    Blood group
                  </label>

                  <select
                    id="blood-group"
                    value={bloodGroup}
                    onChange={(event) =>
                      setBloodGroup(event.target.value)
                    }
                    className={selectClassName}
                  >
                    <option value="">
                      Select blood group
                    </option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="healthos-uid"
                    className={labelClassName}
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="height"
                    className={labelClassName}
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
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="weight"
                    className={labelClassName}
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
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* Profile update status                                         */}
          {/* ============================================================ */}

          {updateMutation.isError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Unable to update profile. Please check the entered
              information and try again.
            </p>
          )}

          {updateMutation.isSuccess && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              Profile updated successfully.
            </p>
          )}

          <div className="border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateMutation.isPending
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>

        {/* ---------------------------------------------------------------- */}
        {/* Emergency contacts                                               */}
        {/* ---------------------------------------------------------------- */}

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

          {/* -------------------------------------------------------------- */}
          {/* Add emergency contact                                         */}
          {/* -------------------------------------------------------------- */}

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
                  className={labelClassName}
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
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-phone"
                  className={labelClassName}
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
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-relationship"
                  className={labelClassName}
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
                  className={selectClassName}
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

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function relationshipLabel(
  relationship: EmergencyRelationship,
) {
  return (
    relationships.find(
      (item) => item.value === relationship,
    )?.label ?? relationship
  );
}