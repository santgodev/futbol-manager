"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Shield } from "@/components/ui/Shield";
import { createClient } from "@/utils/supabase/client";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
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
      <div className="min-h-screen flex items-center justify-center text-white bg-bg-main">
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-12 h-16 text-[#00f0ff] animate-pulse drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
          <span className="text-xs uppercase tracking-[0.2em] text-[#00f0ff] font-bold">Verificando Credenciales...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen flex text-white font-sans selection:bg-sky-300/25 selection:text-white bg-bg-main">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-x-0 top-0 h-[600px]"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(10,132,255,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "linear-gradient(#a7b0ba 1px, transparent 1px), linear-gradient(90deg, #a7b0ba 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden md:flex w-64 border-r border-border-default flex-col relative z-20 shrink-0 bg-bg-secondary">
        {/* Sidebar top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-300/35 to-transparent" />

        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-white/10 w-full">
          <Link href="/" className="relative block h-14 w-[180px] select-none group">
            <img
              src="/logo.png"
              alt="Pegasight Sport"
              className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(0,240,255,0.25)] transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]"
            />
          </Link>
        </div>

        <AdminSidebarNav />

        {/* User section */}
        <div className="p-6 border-t border-white/10">
          <div className="flex flex-col gap-1 mb-5">
            <span className="text-[9px] text-[#00f0ff]/50 uppercase tracking-[0.25em] font-semibold">Sesión Activa</span>
            <span className="text-xs font-bold truncate text-white/80">{user?.email ?? ""}</span>
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
        {/* Mobile Top Header */}
        <header className="md:hidden sticky top-0 z-40 border-b border-border-default px-4 py-3 flex items-center justify-between bg-bg-secondary">
          <Link href="/" className="relative block h-12 w-[150px] select-none">
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
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 border-t border-border-default z-50 flex bg-bg-secondary">
        {/* Bottom nav top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent" />
        <AdminSidebarNav isMobile={true} />
      </div>
    </div>
  );
}
