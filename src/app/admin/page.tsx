import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Shield } from "@/components/ui/Shield";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch recent tournaments
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*, tournament_teams(count), matches(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <header className="mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-brand-sand hero-title !not-italic mb-4">
          PANEL DE CONTROL
        </h1>
        <p className="text-brand-aqua/60 text-sm uppercase tracking-widest">
          Resumen General del Sistema
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="panel-stat">
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-aqua/60 block mb-4">Torneos Activos</span>
          <span className="text-5xl font-bold text-brand-sand hero-title !not-italic">{tournaments?.length || 0}</span>
        </div>
        <div className="panel-stat">
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-aqua/60 block mb-4">Equipos Totales</span>
          <span className="text-5xl font-bold text-brand-sand hero-title !not-italic">
            {tournaments?.reduce((acc, t) => acc + (t.tournament_teams?.[0]?.count || 0), 0) || 0}
          </span>
        </div>
        <div className="panel-stat">
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-aqua/60 block mb-4">Partidos Disputados</span>
          <span className="text-5xl font-bold text-brand-sand hero-title !not-italic">
            {tournaments?.reduce((acc, t) => acc + (t.matches?.[0]?.count || 0), 0) || 0}
          </span>
        </div>
      </div>

      {/* Tournaments List */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold tracking-widest uppercase text-brand-sand">Mis Torneos</h2>
          <Link 
            href="/admin/tournaments/new"
            className="btn-premium-teal !py-2 !px-6"
          >
            + Nuevo Torneo
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {tournaments?.map((tournament) => (
            <Link 
              key={tournament.id} 
              href={`/admin/tournaments/${tournament.id}`}
              className="group flex items-center justify-between panel-premium-interactive"
            >
              <div className="flex items-center gap-6">
                <Shield className="w-8 h-10 text-brand-aqua/30 group-hover:text-brand-teal transition-colors" />
                <div className="flex flex-col">
                  <span className="font-bold text-lg tracking-wide uppercase text-brand-sand group-hover:text-white transition-colors">
                    {tournament.name}
                  </span>
                  <span className="text-[10px] text-brand-aqua/50 uppercase tracking-widest">
                    {tournament.status} • {tournament.location}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-12 text-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-brand-aqua/50 uppercase tracking-widest mb-1">Equipos</span>
                  <span className="font-bold text-brand-sand">{tournament.tournament_teams?.[0]?.count || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-brand-aqua/50 uppercase tracking-widest mb-1">Partidos</span>
                  <span className="font-bold text-brand-sand">{tournament.matches?.[0]?.count || 0}</span>
                </div>
              </div>
            </Link>
          ))}
          
          {tournaments?.length === 0 && (
            <div className="p-12 border border-dashed border-brand-navy/50 text-center flex flex-col items-center justify-center">
              <span className="text-brand-aqua/50 text-sm uppercase tracking-widest mb-4">No hay torneos registrados</span>
              <Link 
                href="/admin/tournaments/new"
                className="btn-premium-navy"
              >
                Crear el primer torneo
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
