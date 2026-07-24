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
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: "linear-gradient(160deg, #001133 0%, #002266 55%, #000a1a 100%)" }}>
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-12 h-16 text-[#00f0ff] animate-pulse drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
          <span className="text-xs uppercase tracking-[0.2em] text-[#00f0ff] font-bold">Verificando Credenciales...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex text-white font-sans selection:bg-[#00f0ff]/30 selection:text-white" style={{ background: "linear-gradient(160deg, #001133 0%, #002266 55%, #000a1a 100%)" }}>

      {/* ── Background Atmosphere ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Radial atmosphere glow */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 60% 20%, rgba(0,136,255,0.12) 0%, rgba(0,240,255,0.06) 40%, transparent 70%)" }}
        />
        {/* Cyberpunk grid floor */}
        <div className="absolute inset-x-0 bottom-0 h-[40%] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(to top, rgba(0,240,255,0.05) 1px, transparent 1px), linear-gradient(to right, rgba(0,240,255,0.05) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
              transform: "perspective(500px) rotateX(60deg) scale(2.5)",
              transformOrigin: "top center",
              maskImage: "linear-gradient(to bottom, transparent 0%, black 70%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 70%, transparent 100%)",
            }}
          />
        </div>
        {/* Top-right corner glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0066cc]/8 rounded-full blur-[120px]" />
        {/* Bottom-left accent */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00f0ff]/4 rounded-full blur-[100px]" />
      </div>

      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden md:flex w-64 border-r border-[#00f0ff]/10 flex-col relative z-20 shrink-0" style={{ background: "rgba(0,17,51,0.85)", backdropFilter: "blur(20px)" }}>
        {/* Sidebar top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent" />

        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-[#00f0ff]/10 w-full">
          <Link href="/admin" className="relative block h-14 w-[180px] select-none group">
            <img
              src="/logo.png"
              alt="Pegasight Sport"
              className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(0,240,255,0.25)] transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]"
            />
          </Link>
        </div>

        <AdminSidebarNav />

        {/* User section */}
        <div className="p-6 border-t border-[#00f0ff]/10">
          <div className="flex flex-col gap-1 mb-5">
            <span className="text-[9px] text-[#00f0ff]/50 uppercase tracking-[0.25em] font-semibold">Sesión Activa</span>
            <span className="text-xs font-bold truncate text-white/80">{user.email}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button className="w-full flex items-center justify-center gap-2 text-[10px] text-red-400 border border-red-500/20 bg-red-500/5 py-2.5 rounded-lg hover:bg-red-500/15 hover:text-red-300 hover:border-red-500/40 transition-all uppercase tracking-widest font-bold">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 relative overflow-y-auto z-10 pb-16 md:pb-0">
        {/* Cinematic Grain Overlay */}
        <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.025]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />

        {/* Mobile Top Header */}
        <header className="md:hidden sticky top-0 z-40 border-b border-[#00f0ff]/10 px-4 py-3 flex items-center justify-between" style={{ background: "rgba(0,17,51,0.92)", backdropFilter: "blur(20px)" }}>
          <Link href="/admin" className="relative block h-12 w-[150px] select-none">
            <img
              src="/logo.png"
              alt="Pegasight Sport"
              className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(0,240,255,0.25)]"
            />
          </Link>
          {/* Top header glow line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent" />

          <form action="/auth/signout" method="post">
            <button className="text-[10px] text-red-400 border border-red-500/20 bg-red-500/5 px-3 py-2 rounded-lg hover:bg-red-500/15 transition-colors uppercase tracking-widest font-bold">
              Salir
            </button>
          </form>
        </header>

        <div>
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 border-t border-[#00f0ff]/10 z-50 flex" style={{ background: "rgba(0,17,51,0.95)", backdropFilter: "blur(20px)" }}>
        {/* Bottom nav top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent" />
        <AdminSidebarNav isMobile={true} />
      </div>
    </div>
  );
}
