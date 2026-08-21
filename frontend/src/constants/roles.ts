export const ROLES = {
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR",
  HOSPITAL: "HOSPITAL",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];