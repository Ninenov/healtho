"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginFormData } from "@/features/auth/schemas";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME } from "@/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await loginUser(data);

      const destination =
        ROLE_HOME[user.role as keyof typeof ROLE_HOME];

      router.replace(destination ?? "/login");
    } catch {
      setError("root", {
        message: "Invalid phone number or password.",
      });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">HealthOS</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Phone
            </label>

            <input
              {...register("phone")}
              type="tel"
              autoComplete="tel"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
            />

            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm text-red-600">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg px-4 py-2 font-medium disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}