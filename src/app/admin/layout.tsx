import { ReactNode } from "react";
import Link from "next/link";
import { Shield } from "@/components/ui/Shield";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#030b17] flex text-white font-sans selection:bg-[#00f0ff]/30 selection:text-white">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-1/4 w-[800px] h-[800px] bg-[#0066cc]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 border-r border-[#0055cc]/30 bg-[#02060d]/80 backdrop-blur-xl flex flex-col relative z-20">
        <div className="h-24 flex items-center px-8 border-b border-[#0055cc]/30">
          <Link href="/admin" className="flex items-center gap-3 group">
            <Shield className="w-6 h-8 text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all group-hover:scale-105" />
            <span className="font-bold tracking-widest text-sm uppercase text-white group-hover:text-[#00f0ff] transition-colors">Pegasight</span>
          </Link>
        </div>
        
        <AdminSidebarNav />

        <div className="p-8 border-t border-[#0055cc]/30 bg-[#001122]/30">
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-[10px] text-[#00f0ff]/60 uppercase tracking-widest font-semibold">Usuario</span>
            <span className="text-xs font-bold truncate text-white">{user.email}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button className="w-full flex items-center justify-center gap-2 text-[10px] text-red-400 border border-red-500/30 bg-red-500/5 py-2.5 rounded hover:bg-red-500/20 hover:text-red-300 transition-colors uppercase tracking-widest font-bold">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto z-10">
        {/* Cinematic Grain Overlay */}
        <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
        {children}
      </main>
    </div>
  );
}
