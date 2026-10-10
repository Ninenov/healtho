"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Stethoscope,
} from "lucide-react";

import { RoleRoute } from "@/components/navigation/RoleRoute";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { ROLES } from "@/constants/roles";

import {
  useCreateAppointment,
} from "@/features/appointments/hooks";

import {
  useDoctorPatientAvailability,
  useDoctors,
} from "@/features/doctors/hooks";

function generateSlots(
  startTime: string,
  endTime: string,
) {
  const slots: string[] = [];

  const [startHour, startMinute] =
    startTime.split(":").map(Number);

  const [endHour, endMinute] =
    endTime.split(":").map(Number);

  let current =
    startHour * 60 + startMinute;

  const end =
    endHour * 60 + endMinute;

  while (current + 30 <= end) {
    const hour = Math.floor(current / 60);
    const minute = current % 60;

    slots.push(
      `${String(hour).padStart(2, "0")}:${String(
        minute,
      ).padStart(2, "0")}`,
    );

    current += 30;
  }

  return slots;
}

function getWeekday(date: string) {
  return (new Date(`${date}T00:00:00`).getDay() + 6) % 7;
}


export default function NewPatientAppointmentPage() {
  const router = useRouter();

  const doctorsQuery = useDoctors();
  const createMutation =
    useCreateAppointment();

  const [doctorId, setDoctorId] =
    useState("");

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [appointmentType, setAppointmentType] =
    useState("CONSULTATION");

  const [reason, setReason] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const availabilityQuery =
    useDoctorPatientAvailability(doctorId);

  const selectedWeekday = useMemo(
    () => (date ? getWeekday(date) : null),
    [date],
  );

  const slots = useMemo(() => {
    if (
      selectedWeekday === null ||
      !availabilityQuery.data
    ) {
      return [];
    }

    return availabilityQuery.data
      .filter(
        (item) =>
          item.is_active &&
          item.weekday === selectedWeekday,
      )
      .flatMap((availability) =>
        generateSlots(
          availability.start_time,
          availability.end_time,
        ),
      );
  }, [
    availabilityQuery.data,
    selectedWeekday,
  ]);

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!doctorId || !date || !time) {
      return;
    }

    try {
      const appointment =
        await createMutation.mutateAsync({
          doctor: doctorId,
          appointment_type: appointmentType,
          scheduled_at: `${date}T${time}:00`,
          reason: reason.trim(),
          notes: notes.trim(),
        });

      router.push(
        `/dashboard/patient/appointments/${appointment.id}`,
      );
    } catch {
      // Mutation state displays the error.
    }
  }

  if (doctorsQuery.isLoading) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <LoadingState message="Loading doctors..." />
      </RoleRoute>
    );
  }

  if (doctorsQuery.isError) {
    return (
      <RoleRoute allowedRoles={[ROLES.PATIENT]}>
        <ErrorState
          title="Unable to load doctors"
          description="We could not load the doctor directory."
          onRetry={() => doctorsQuery.refetch()}
        />
      </RoleRoute>
    );
  }

  const today =
    new Date().toISOString().split("T")[0];

  return (
    <RoleRoute allowedRoles={[ROLES.PATIENT]}>
      <main className="mx-auto max-w-4xl space-y-6">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/patient/appointments",
            )
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
        >
          <ArrowLeft size={16} />
          Back to appointments
        </button>

        <header>
          <p className="text-sm font-medium text-gray-500">
            Patient workspace
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
            Book an appointment
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Choose a doctor, available time and appointment
            details.
          </p>
        </header>

        <form
          onSubmit={submit}
          className="space-y-6"
        >
          {/* Doctor */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<Stethoscope size={19} />}
              title="Choose doctor"
              description="Select the doctor you want to consult."
            />

            <div className="mt-5 grid gap-3">
              {doctorsQuery.data?.map((doctor) => {
                const selected =
                  doctor.id === doctorId;

                return (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => {
                      setDoctorId(doctor.id);
                      setDate("");
                      setTime("");
                    }}
                    className={[
                      "flex w-full items-center justify-between rounded-xl border p-4 text-left transition",
                      selected
                        ? "border-gray-900 bg-gray-50 ring-2 ring-gray-900/5"
                        : "border-gray-200 bg-white hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <div>
                      <p className="font-semibold text-gray-950">
                        Dr. {doctor.first_name}{" "}
                        {doctor.last_name}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {doctor.specialization ||
                          "General consultation"}
                      </p>

                      {doctor.qualification && (
                        <p className="mt-1 text-xs text-gray-400">
                          {doctor.qualification}
                        </p>
                      )}
                    </div>

                    {selected && (
                      <CheckCircle2
                        size={20}
                        className="shrink-0 text-gray-900"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Date / time */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<CalendarDays size={19} />}
              title="Date & time"
              description="Choose an available appointment slot."
            />

            {!doctorId ? (
              <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-500">
                Select a doctor first to view available
                times.
              </div>
            ) : availabilityQuery.isLoading ? (
              <div className="mt-5">
                <LoadingState message="Loading availability..." />
              </div>
            ) : availabilityQuery.isError ? (
              <div className="mt-5">
                <ErrorState
                  title="Unable to load availability"
                  description="We could not retrieve this doctor's availability."
                  onRetry={() =>
                    availabilityQuery.refetch()
                  }
                />
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <div>
                  <label
                    htmlFor="appointment-date"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Date
                  </label>

                  <input
                    id="appointment-date"
                    type="date"
                    min={today}
                    value={date}
                    onChange={(event) => {
                      setDate(event.target.value);
                      setTime("");
                    }}
                    className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-gray-700 focus:ring-2 focus:ring-gray-200"
                  />
                </div>

                {date && (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700">
                        Available time
                      </label>

                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <Clock3 size={13} />
                        30 minute slots
                      </span>
                    </div>

                    {slots.length === 0 ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        No availability on this day. Choose
                        another date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() =>
                              setTime(slot)
                            }
                            className={[
                              "rounded-xl border px-3 py-3 text-sm font-semibold transition",
                              time === slot
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                            ].join(" ")}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Details */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<Clock3 size={19} />}
              title="Appointment details"
              description="Tell the doctor what the consultation is about."
            />

            <div className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="appointment-type"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Appointment type
                </label>

                <select
                  id="appointment-type"
                  value={appointmentType}
                  onChange={(event) =>
                    setAppointmentType(
                      event.target.value,
                    )
                  }
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-200"
                >
                  <option value="CONSULTATION">
                    Consultation
                  </option>
                  <option value="FOLLOW_UP">
                    Follow Up
                  </option>
                  <option value="CHECKUP">
                    Checkup
                  </option>
                  <option value="EMERGENCY">
                    Emergency
                  </option>
                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>

              <TextArea
                id="reason"
                label="Reason for visit"
                value={reason}
                onChange={setReason}
                placeholder="Briefly describe why you need the appointment..."
              />

              <TextArea
                id="notes"
                label="Additional notes"
                value={notes}
                onChange={setNotes}
                placeholder="Anything else the doctor should know..."
              />
            </div>
          </section>

          {createMutation.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Unable to create the appointment. The selected
              slot may no longer be available.
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                !doctorId ||
                !date ||
                !time
              }
              className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-950 px-6 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending
                ? "Booking..."
                : "Book appointment"}
            </button>
          </div>
        </form>
      </main>
    </RoleRoute>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-gray-950">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-gray-700"
      >
        {label}
      </label>

      <textarea
        id={id}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        rows={4}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-700 focus:ring-2 focus:ring-gray-200"
      />
    </div>
  );
}