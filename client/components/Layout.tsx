import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-full bg-[#f8fafc] font-exo overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content que rola verticalmente */}
      <div className="flex flex-col items-start gap-4 flex-1 px-4 sm:px-10 pb-20 bg-[#f8fafc] pt-[80px] md:pt-[40px] overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
