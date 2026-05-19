import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Shield } from "@/components/ui/Shield";

export default async function AdminTournamentsPage() {
  const supabase = await createClient();

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*, tournament_teams(count), matches(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-brand-sand hero-title !not-italic mb-2">
            GESTIÓN DE TORNEOS
          </h1>
          <p className="text-brand-aqua/60 text-xs uppercase tracking-widest">
            Administra tus ligas y competiciones
          </p>
        </div>
        <Link 
          href="/admin/tournaments/new"
          className="bg-brand-teal text-brand-deep px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors inline-block"
        >
          + Crear Torneo
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments?.map((tournament) => (
          <Link 
            key={tournament.id} 
            href={`/admin/tournaments/${tournament.id}`}
            className="group flex flex-col p-6 bg-brand-deep border border-brand-navy/30 hover:border-brand-teal hover:bg-brand-navy/10 transition-all"
          >
            <div className="flex items-start justify-between mb-8">
              <Shield className="w-10 h-12 text-brand-aqua/30 group-hover:text-brand-teal transition-colors" />
              <span className="text-[10px] text-brand-aqua/50 uppercase tracking-widest border border-brand-navy/50 px-2 py-1">
                {tournament.status}
              </span>
            </div>
            
            <div className="flex flex-col mb-6">
              <span className="font-bold text-xl tracking-wide uppercase text-brand-sand group-hover:text-white transition-colors mb-1">
                {tournament.name}
              </span>
              <span className="text-xs text-brand-aqua/50 uppercase tracking-widest">
                {tournament.location}
              </span>
            </div>
            
            <div className="flex items-center gap-6 mt-auto pt-6 border-t border-brand-navy/30">
              <div className="flex flex-col">
                <span className="text-[10px] text-brand-aqua/50 uppercase tracking-widest mb-1">Equipos</span>
                <span className="font-bold text-brand-sand text-sm">{tournament.tournament_teams?.[0]?.count || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-brand-aqua/50 uppercase tracking-widest mb-1">Partidos</span>
                <span className="font-bold text-brand-sand text-sm">{tournament.matches?.[0]?.count || 0}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
