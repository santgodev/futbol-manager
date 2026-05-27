"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield } from "@/components/ui/Shield";
import { createClient } from "@/utils/supabase/client";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/login");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030b17] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-12 h-16 text-[#00f0ff] animate-pulse drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
          <span className="text-xs uppercase tracking-[0.2em] text-[#00f0ff] font-bold">Verificando Credenciales...</span>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#030b17] flex text-white font-sans selection:bg-[#00f0ff]/30 selection:text-white">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-1/4 w-[800px] h-[800px] bg-[#0066cc]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 border-r border-[#0055cc]/30 bg-[#02060d]/80 backdrop-blur-xl flex-col relative z-20">
        <div className="h-24 flex items-center px-6 border-b border-[#0055cc]/30">
          <Link href="/admin" className="relative block h-12 w-[160px] select-none group">
            <img 
              src="/logo.png" 
              alt="Pegasight Sport" 
              className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(0,240,255,0.25)] transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]"
            />
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
      <main className="flex-1 relative overflow-y-auto z-10 pb-16 md:pb-0">
        {/* Cinematic Grain Overlay */}
        <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
        
        {/* Mobile Top Header */}
        <header className="md:hidden sticky top-0 z-40 bg-[#02060d]/90 backdrop-blur-xl border-b border-[#0055cc]/30 px-6 py-3 flex items-center justify-between">
          <Link href="/admin" className="relative block h-8 w-[110px] select-none">
            <img 
              src="/logo.png" 
              alt="Pegasight Sport" 
              className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(0,240,255,0.25)]"
            />
          </Link>
          
          <form action="/auth/signout" method="post">
            <button className="text-[10px] text-red-400 border border-red-500/30 bg-red-500/5 px-3 py-2 rounded hover:bg-red-500/20 transition-colors uppercase tracking-widest font-bold">
              Salir
            </button>
          </form>
        </header>

        <div className="p-4 md:p-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-[#02060d]/95 backdrop-blur-xl border-t border-[#0055cc]/30 z-50 flex">
        <AdminSidebarNav isMobile={true} />
      </div>
    </div>
  );
}
