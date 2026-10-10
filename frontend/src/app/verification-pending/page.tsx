import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  ShieldCheck,
} from "lucide-react";

export default function VerificationPendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-2xl sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Clock3 size={30} />
        </div>

        <p className="mt-6 text-sm font-medium text-slate-500">
          Doctor verification
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Verification pending
        </h1>

        <p className="mt-4 text-sm leading-6 text-slate-500">
          Your doctor account has been created successfully.
          Our verification process must be completed before
          clinical access is enabled.
        </p>

        <div className="mt-7 space-y-3 text-left">
          <Status
            icon={<CheckCircle2 size={17} />}
            title="Account created"
            description="Your HealthOS identity is active."
          />

          <Status
            icon={<ShieldCheck size={17} />}
            title="Professional verification"
            description="Your professional details are awaiting review."
          />

          <Status
            icon={<Clock3 size={17} />}
            title="Clinical access"
            description="Enabled after verification."
          />
        </div>

        <Link
          href="/login"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Return to sign in
        </Link>
      </div>
    </main>
  );
}

function Status({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 p-4">
      <div className="mt-0.5 text-slate-700">
        {icon}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}