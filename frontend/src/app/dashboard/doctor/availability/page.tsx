"use client";

import { useMemo, useState } from "react";
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";

import {
  useCreateDoctorAvailability,
  useDeleteDoctorAvailability,
  useDoctorAvailability,
  useUpdateDoctorAvailability,
} from "@/features/doctors/hooks";
import type { DoctorAvailability } from "@/features/doctors/api";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const EMPTY_FORM = {
  weekday: 0,
  start_time: "09:00",
  end_time: "17:00",
};

export default function DoctorAvailabilityPage() {
  const {
    data: availability = [],
    isLoading,
    isError,
    refetch,
  } = useDoctorAvailability();

  const createMutation = useCreateDoctorAvailability();
  const deleteMutation = useDeleteDoctorAvailability();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const updateMutation = useUpdateDoctorAvailability(
    editingId ?? "",
  );

  const editingAvailability = useMemo(
    () =>
      editingId
        ? availability.find(
            (item) => item.id === editingId,
          )
        : undefined,
    [availability, editingId],
  );

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  }

  function startCreate(weekday = 0) {
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
      weekday,
    });

    setShowForm(true);
  }

  function startEdit(item: DoctorAvailability) {
    setEditingId(item.id);

    setForm({
      weekday: item.weekday,
      start_time: item.start_time.slice(0, 5),
      end_time: item.end_time.slice(0, 5),
    });

    setShowForm(true);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (form.start_time >= form.end_time) {
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync(form);
      } else {
        await createMutation.mutateAsync(form);
      }

      resetForm();
    } catch {
      // React Query mutation state exposes the error to the UI.
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Deactivate this availability slot?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Keep the page usable; mutation state handles the error.
    }
  }

  const groupedAvailability = WEEKDAYS.map(
    (day, weekday) => ({
      day,
      weekday,
      slots: availability.filter(
        (item) =>
          item.weekday === weekday &&
          item.is_active,
      ),
    }),
  );

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Doctor workspace
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-gray-950">
            Availability
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your consultation schedule.
          </p>
        </div>

        <button
          type="button"
          onClick={() => startCreate()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus size={17} />
          Add availability
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="font-semibold text-gray-950">
              {editingAvailability
                ? "Edit availability"
                : "Add availability"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Set the hours when patients can book
              consultations.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 sm:grid-cols-3"
          >
            {/* Day */}
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-gray-700">
                Day
              </span>

              <select
                value={form.weekday}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    weekday: Number(
                      event.target.value,
                    ),
                  }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-950"
              >
                {WEEKDAYS.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </label>

            {/* Start */}
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-gray-700">
                Start time
              </span>

              <input
                type="time"
                value={form.start_time}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    start_time: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-950"
              />
            </label>

            {/* End */}
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-gray-700">
                End time
              </span>

              <input
                type="time"
                value={form.end_time}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    end_time: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-950"
              />
            </label>

            {/* Validation */}
            {form.start_time >= form.end_time && (
              <p className="text-sm text-red-600 sm:col-span-3">
                End time must be later than start time.
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 sm:col-span-3">
              <button
                type="submit"
                disabled={
                  isSaving ||
                  form.start_time >=
                    form.end_time
                }
                className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Add slot"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">
            Loading availability...
          </p>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-white p-10 text-center">
          <p className="font-medium text-red-700">
            Unable to load availability.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Availability */}
      {!isLoading && !isError && (
        <div className="grid gap-4">
          {groupedAvailability.map(
            ({ day, weekday, slots }) => (
              <div
                key={day}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-950">
                      {day}
                    </h2>

                    <p className="text-xs text-gray-500">
                      {slots.length === 0
                        ? "No availability"
                        : `${slots.length} slot${
                            slots.length === 1
                              ? ""
                              : "s"
                          }`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      startCreate(weekday)
                    }
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-950"
                    aria-label={`Add ${day} availability`}
                  >
                    <Plus size={17} />
                  </button>
                </div>

                {slots.length > 0 && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <Clock
                            size={16}
                            className="text-gray-500"
                          />

                          <span className="text-sm font-medium text-gray-900">
                            {slot.start_time.slice(
                              0,
                              5,
                            )}
                            {" – "}
                            {slot.end_time.slice(
                              0,
                              5,
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              startEdit(slot)
                            }
                            className="rounded-md p-1.5 text-gray-500 hover:bg-white hover:text-gray-950"
                            aria-label="Edit availability"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(slot.id)
                            }
                            disabled={
                              deleteMutation.isPending
                            }
                            className="rounded-md p-1.5 text-gray-500 hover:bg-white hover:text-red-600 disabled:opacity-50"
                            aria-label="Deactivate availability"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}