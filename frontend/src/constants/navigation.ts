import { ROLES, type Role } from "@/constants/roles";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const NAVIGATION: Record<Role, NavItem[]> = {
  [ROLES.PATIENT]: [
    { label: "Dashboard", href: "/dashboard/patient", icon: "LayoutDashboard" },
    { label: "Appointments", href: "/dashboard/patient/appointments", icon: "CalendarDays" },
    { label: "Clinical Records", href: "/dashboard/patient/records", icon: "FileText" },
    { label: "Notifications", href: "/dashboard/patient/notifications", icon: "Bell" },
    { label: "Profile", href: "/dashboard/patient/profile", icon: "User" },
  ],

  [ROLES.DOCTOR]: [
    { label: "Dashboard", href: "/dashboard/doctor", icon: "LayoutDashboard" },
    { label: "Appointments", href: "/dashboard/doctor/appointments", icon: "CalendarDays" },
    { label: "Patients", href: "/dashboard/doctor/patients", icon: "Users" },
    { label: "Availability", href: "/dashboard/doctor/availability", icon: "Clock" },
    { label: "Clinical", href: "/dashboard/doctor/clinical", icon: "Stethoscope" },
    { label: "Notifications", href: "/dashboard/doctor/notifications", icon: "Bell" },
  ],

  [ROLES.HOSPITAL]: [
    {
      label: "Dashboard",
      href: "/dashboard/hospital",
      icon: "LayoutDashboard",
    },
    {
      label: "Patients",
      href: "/dashboard/hospital/patients",
      icon: "Users",
    },
    {
      label: "Appointments",
      href: "/dashboard/hospital/appointments",
      icon: "CalendarDays",
    },
    {
      label: "Operations",
      href: "/dashboard/hospital/operations",
      icon: "Building2",
    },
  ],

  [ROLES.ADMIN]: [
    { label: "Dashboard", href: "/dashboard/admin", icon: "LayoutDashboard" },
    { label: "Users", href: "/dashboard/admin/users", icon: "Users" },
    { label: "Hospitals", href: "/dashboard/admin/hospitals", icon: "Building2" },
    { label: "Audit Logs", href: "/dashboard/admin/audit", icon: "ShieldCheck" },
    { label: "Analytics", href: "/dashboard/admin/analytics", icon: "BarChart3" },
  ],
};