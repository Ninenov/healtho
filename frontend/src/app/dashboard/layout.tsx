import { ProtectedRoute } from "@/components/navigation/ProtectedRoute";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}