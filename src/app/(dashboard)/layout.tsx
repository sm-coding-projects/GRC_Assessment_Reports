import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-surface-alt">
          <div className="mx-auto max-w-[1200px] px-4 pt-14 pb-12 sm:px-6 md:pl-8 md:pr-6 md:pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
