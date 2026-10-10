import { z } from "zod";

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    phone: z
      .string()
      .min(1, "Phone number is required"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    first_name: z
      .string()
      .min(1, "First name is required"),

    last_name: z
      .string()
      .min(1, "Last name is required"),

    email: z
      .string()
      .email("Enter a valid email")
      .optional()
      .or(z.literal("")),

    role: z.enum(["PATIENT", "DOCTOR"]),

    specialization: z.string().optional(),

    qualification: z.string().optional(),

    license_number: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "DOCTOR") {
      return;
    }

    if (!data.specialization?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["specialization"],
        message: "Specialization is required.",
      });
    }

    if (!data.qualification?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["qualification"],
        message: "Qualification is required.",
      });
    }

    if (!data.license_number?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["license_number"],
        message: "License number is required.",
      });
    }
  });

export type LoginFormData =
  z.infer<typeof loginSchema>;

export type RegisterFormData =
  z.infer<typeof registerSchema>;