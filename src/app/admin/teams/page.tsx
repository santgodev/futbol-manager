import { createClient } from "@/utils/supabase/server";
import { Shield } from "lucide-react";
import Link from "next/link";

export default async function AdminTeamsPage() {
  const supabase = await createClient();

  const { data: teams } = await supabase
    .from("teams")
    .select(`
      *, 
      players(count)
    `)
    .order("name", { ascending: true });

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto">
      <Link href="/admin" className="text-[10px] text-brand-aqua/60 uppercase tracking-widest hover:text-brand-teal transition-colors mb-8 inline-block">
        ← Volver al Dashboard
      </Link>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-brand-navy/30">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-brand-sand hero-title !not-italic mb-2">
            Clubes y Equipos
          </h1>
          <p className="text-brand-aqua/50 text-xs uppercase tracking-widest">
            Directorio global de equipos registrados
          </p>
        </div>
        <Link 
          href="/admin/teams/new"
          className="btn-premium-teal"
        >
          + Registrar Equipo
        </Link>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {teams?.map((team) => {
          const playersCount = (team.players as any)?.[0]?.count || 0;
          return (
            <Link 
              key={team.id} 
              href={`/admin/teams/${team.id}`}
              className="group flex flex-col items-center panel-premium-interactive"
            >
              {team.logo_url ? (
                <div className="w-20 h-20 mb-6 flex items-center justify-center">
                  <img src={team.logo_url} alt={team.name} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <Shield className="w-16 h-20 text-brand-aqua/20 group-hover:text-brand-teal transition-colors mb-6" />
              )}
              
              <span className="font-bold text-sm text-center tracking-wide uppercase text-brand-sand group-hover:text-white transition-colors mb-2">
                {team.name}
              </span>
              
              <span className="text-[10px] text-brand-aqua/50 uppercase tracking-widest text-center">
                {playersCount} Jugador{playersCount !== 1 ? 'es' : ''}
              </span>
            </Link>
          );
        })}
      </div>

      {(!teams || teams.length === 0) && (
        <div className="p-12 text-center border border-dashed border-brand-navy/30 bg-brand-deep mt-8">
          <Shield className="w-12 h-16 text-brand-navy/30 mx-auto mb-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-sand mb-2">No hay equipos</h3>
          <p className="text-brand-aqua/50 text-xs uppercase tracking-widest max-w-md mx-auto">
            Registra tu primer equipo para comenzar a gestionar el torneo.
          </p>
        </div>
      )}
    </div>
  );
}
