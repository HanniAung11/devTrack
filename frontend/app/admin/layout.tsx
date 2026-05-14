import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex min-h-screen flex-1 flex-col overflow-auto bg-zinc-50 p-4 pt-14 md:p-8 lg:p-10 lg:pt-10">
        {children}
      </main>
    </div>
  );
}
