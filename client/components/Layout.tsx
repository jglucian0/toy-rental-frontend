import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc] font-exo">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col items-start gap-4 flex-1 p-10 pb-20 bg-[#f8fafc]">
        {children}
      </div>
    </div>
  );
}
