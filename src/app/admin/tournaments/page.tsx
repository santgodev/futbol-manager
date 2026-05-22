import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Shield } from "lucide-react";

export default async function AdminTournamentsPage() {
  const supabase = await createClient();

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*, tournament_teams(count), matches(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <Link href="/admin" className="text-[10px] text-brand-aqua/60 uppercase tracking-widest hover:text-brand-teal transition-colors mb-8 inline-block">
        ← Volver al Dashboard
      </Link>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-brand-navy/30">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-brand-sand hero-title !not-italic mb-2">
            Gestión de Torneos
          </h1>
          <p className="text-brand-aqua/50 text-xs uppercase tracking-widest">
            Administra tus ligas y competiciones
          </p>
        </div>
        <Link 
          href="/admin/tournaments/new"
          className="btn-premium-teal"
        >
          + Crear Torneo
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments?.map((tournament) => (
          <Link 
            key={tournament.id} 
            href={`/admin/tournaments/${tournament.id}`}
            className="group flex flex-col panel-premium-interactive"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 bg-brand-navy/20 border border-brand-navy/30 rounded-xl group-hover:border-brand-teal/50 transition-colors">
                <Shield className="w-8 h-8 text-brand-teal" />
              </div>
              <span className="text-[9px] text-brand-teal font-black uppercase tracking-widest border border-brand-teal/30 bg-black px-3 py-1 rounded-full">
                {tournament.status}
              </span>
            </div>
            
            <div className="flex flex-col mb-6">
              <span className="font-bold text-xl tracking-wide uppercase text-brand-sand group-hover:text-white transition-colors mb-1 line-clamp-1">
                {tournament.name}
              </span>
              <span className="text-[10px] text-brand-aqua/50 uppercase tracking-widest">
                📍 {tournament.location}
              </span>
            </div>
            
            <div className="flex items-center gap-8 mt-auto pt-5 border-t border-brand-navy/20">
              <div className="flex flex-col">
                <span className="text-[9px] text-brand-aqua/40 uppercase tracking-widest mb-1">Equipos</span>
                <span className="font-bold text-brand-sand text-lg group-hover:text-brand-teal transition-colors">{(tournament.tournament_teams as any)?.[0]?.count || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-brand-aqua/40 uppercase tracking-widest mb-1">Partidos</span>
                <span className="font-bold text-brand-sand text-lg group-hover:text-brand-teal transition-colors">{(tournament.matches as any)?.[0]?.count || 0}</span>
              </div>
            </div>
          </Link>
        ))}

        {(!tournaments || tournaments.length === 0) && (
          <div className="col-span-full p-12 text-center border border-dashed border-brand-navy/30 bg-brand-deep">
            <Shield className="w-12 h-16 text-brand-navy/30 mx-auto mb-4" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-sand mb-2">No hay torneos creados</h3>
            <p className="text-brand-aqua/50 text-xs uppercase tracking-widest max-w-md mx-auto mb-6">
              Crea tu primer torneo para comenzar a gestionar el campeonato.
            </p>
            <Link 
              href="/admin/tournaments/new"
              className="btn-premium-navy inline-flex"
            >
              Crear el primer torneo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
