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

    if (!editingId) {
      const duplicate = availability.some(
        (item) =>
          item.is_active &&
          item.weekday === form.weekday &&
          item.start_time.slice(0, 5) === form.start_time &&
          item.end_time.slice(0, 5) === form.end_time,
      );

      if (duplicate) {
        window.alert(
          "This availability slot already exists.",
        );
        return;
      }
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync(form);
      } else {
        await createMutation.mutateAsync(form);
      }

      resetForm();
    } catch {
      // Keep the form open so the user can correct the request.
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Deactivate this availability slot?",
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Mutation state handles API errors.
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
    <main className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Doctor workspace
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            Availability
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Manage the consultation hours patients can book.
          </p>
        </div>

        <button
          type="button"
          onClick={() => startCreate()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={17} />
          Add availability
        </button>
      </section>

      {/* Form */}
      {showForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Schedule editor
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              {editingAvailability
                ? "Edit availability"
                : "Add availability"}
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Set the hours when patients can book consultations.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 sm:grid-cols-3"
          >
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">
                Day
              </span>

              <select
                value={form.weekday}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    weekday: Number(event.target.value),
                  }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {WEEKDAYS.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            {form.start_time >= form.end_time && (
              <p className="sm:col-span-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                End time must be later than start time.
              </p>
            )}

            <div className="flex gap-3 sm:col-span-3">
              <button
                type="submit"
                disabled={
                  isSaving ||
                  form.start_time >= form.end_time
                }
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
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
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Loading */}
      {isLoading && (
        <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Loading availability...
          </p>
        </section>
      )}

      {/* Error */}
      {isError && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-800">
            Unable to load availability.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Retry
          </button>
        </section>
      )}

      {/* Availability */}
      {!isLoading && !isError && (
        <div className="grid gap-4">
          {groupedAvailability.map(
            ({ day, weekday, slots }) => (
              <section
                key={day}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-950">
                      {day}
                    </h2>

                    <p className="mt-1 text-xs font-medium text-slate-500">
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
                    onClick={() => startCreate(weekday)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    aria-label={`Add ${day} availability`}
                  >
                    <Plus size={17} />
                  </button>
                </div>

                {slots.length > 0 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <Clock
                            size={16}
                            className="text-blue-600"
                          />

                          <span className="text-sm font-semibold text-slate-900">
                            {slot.start_time.slice(0, 5)}
                            {" – "}
                            {slot.end_time.slice(0, 5)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(slot)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            aria-label="Edit availability"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(slot.id)}
                            disabled={deleteMutation.isPending}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Deactivate availability"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ),
          )}
        </div>
      )}
    </main>
  );
}