import { createClient } from "@/utils/supabase/server";
import { Shield } from "@/components/ui/Shield";
import Link from "next/link";

export default async function AdminTeamsPage() {
  const supabase = await createClient();

  const { data: teams } = await supabase
    .from("teams")
    .select("*, tournament_teams(count)")
    .order("name", { ascending: true });

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-brand-sand hero-title !not-italic mb-2">
            BASE DE EQUIPOS
          </h1>
          <p className="text-brand-aqua/60 text-xs uppercase tracking-widest">
            Directorio global de clubes y equipos
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
        {teams?.map((team) => (
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
              {team.tournament_teams?.[0]?.count || 0} Torneos
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
