import { Stethoscope } from "lucide-react";

export default function DoctorClinicalPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-500">
          Doctor workspace
        </p>

        <h1 className="mt-1 text-2xl font-semibold text-gray-950">
          Clinical
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Access clinical encounters and patient information.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Stethoscope
            size={22}
            className="text-gray-500"
          />
        </div>

        <h2 className="mt-4 font-medium text-gray-900">
          Clinical workspace
        </h2>

        <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
          Clinical work is accessed from active appointments.
        </p>
      </div>
    </div>
  );
}