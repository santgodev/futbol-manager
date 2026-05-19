import { ReactNode } from "react";
import Link from "next/link";
import { Shield } from "@/components/ui/Shield";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-brand-deep flex text-brand-sand font-sans selection:bg-brand-teal selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-brand-navy/30 bg-brand-deep/50 flex flex-col">
        <div className="h-24 flex items-center px-8 border-b border-brand-navy/30">
          <Link href="/admin" className="flex items-center gap-3">
            <Shield className="w-6 h-8 text-brand-teal" />
            <span className="font-bold tracking-widest text-sm uppercase">Pegasight</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-8 flex flex-col gap-2 px-4">
          <Link href="/admin" className="px-4 py-3 bg-brand-navy/20 border-l-2 border-brand-teal text-brand-sand text-xs font-bold uppercase tracking-widest hover:bg-brand-navy/30 transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/tournaments" className="px-4 py-3 text-brand-aqua/50 text-xs font-bold uppercase tracking-widest hover:bg-brand-navy/10 hover:text-brand-aqua transition-colors">
            Torneos
          </Link>
          <Link href="/admin/teams" className="px-4 py-3 text-brand-aqua/50 text-xs font-bold uppercase tracking-widest hover:bg-brand-navy/10 hover:text-brand-aqua transition-colors">
            Equipos
          </Link>
        </nav>

        <div className="p-8 border-t border-brand-navy/30">
          <div className="flex flex-col gap-1 mb-4">
            <span className="text-[10px] text-brand-aqua/50 uppercase tracking-widest">Usuario</span>
            <span className="text-xs font-bold truncate">{user.email}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button className="text-[10px] text-red-400 uppercase tracking-widest font-bold hover:text-red-300 transition-colors">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        {/* Cinematic Grain Overlay */}
        <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
        {children}
      </main>
    </div>
  );
}
