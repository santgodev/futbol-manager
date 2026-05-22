import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Shield } from "@/components/ui/Shield";
import { RosterManager } from "@/components/admin/RosterManager";
import { GlobalRosterManager } from "@/components/admin/GlobalRosterManager";

export default async function AdminTeamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  // 1. Fetch team details
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .single();

  if (!team) return notFound();

  // 2. Fetch tournaments this team is registered in
  const { data: teamTournaments } = await supabase
    .from("tournament_teams")
    .select("tournament:tournaments(id, name, slug)")
    .eq("team_id", id);

  // 3. Fetch players registered for this team, grouped by tournament
  const { data: rosterPlayers } = await supabase
    .from("tournament_players")
    .select("*, player:players(id, name), tournament:tournaments(id, name)")
    .eq("team_id", id);

  // 4. Fetch all global players (to suggest/add existing ones)
  const { data: globalPlayers } = await supabase
    .from("players")
    .select("*")
    .order("name");

  // 5. Fetch players belonging globally to this team
  const { data: globalTeamPlayers } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", id)
    .order("name");

  // 6. Fetch unassigned players globally (free agents)
  const { data: unassignedPlayers } = await supabase
    .from("players")
    .select("*")
    .is("team_id", null)
    .order("name");

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto">
      <Link href="/admin/teams" className="text-[10px] text-brand-aqua/60 uppercase tracking-widest hover:text-brand-teal transition-colors mb-8 inline-block">
        ← Volver a Equipos
      </Link>

      <header className="mb-16 border-b border-brand-navy/30 pb-8 flex items-center justify-between gap-6">
         <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-brand-sand hero-title !not-italic mb-2">
            {team.name}
          </h1>
          <p className="text-brand-aqua/50 text-xs uppercase tracking-widest">
            Gestión de Plantillas y Jugadores por Torneo
          </p>
        </div>
        
        {team.logo_url ? (
          <div className="w-20 h-20 bg-brand-navy/5 border border-brand-navy/20 p-2 flex items-center justify-center overflow-hidden">
            <img src={team.logo_url} className="max-w-full max-h-full object-contain" alt={team.name} />
          </div>
        ) : (
          <Shield className="w-16 h-20 text-brand-aqua/20" />
        )}
      </header>

      <section>
        <GlobalRosterManager 
          teamId={id} 
          initialPlayers={globalTeamPlayers || []} 
          unassignedPlayers={unassignedPlayers || []} 
        />

        <div className="mb-12 border-t border-brand-navy/30" />

        <div className="mb-6">
          <span className="text-[9px] text-brand-teal font-black uppercase tracking-[0.3em] block mb-1">
            Competiciones
          </span>
          <h3 className="text-xl md:text-2xl font-black text-brand-sand uppercase tracking-tighter hero-title !not-italic">
            Inscripciones y Plantillas de Torneo
          </h3>
          <p className="text-brand-aqua/50 text-xs uppercase tracking-widest mt-1">
            Asigna los jugadores del club a cada uno de los torneos activos en los que participa el equipo.
          </p>
        </div>

        <RosterManager 
          teamId={id} 
          tournaments={teamTournaments || []} 
          initialPlayers={rosterPlayers || []} 
          globalPlayers={globalPlayers || []} 
        />
        
        {(!teamTournaments || teamTournaments.length === 0) && (
          <div className="p-12 text-center border border-dashed border-brand-navy/30 bg-brand-deep mt-8">
            <Shield className="w-12 h-16 text-brand-navy/30 mx-auto mb-4" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-sand mb-2">Equipo sin Torneos</h3>
            <p className="text-brand-aqua/50 text-xs uppercase tracking-widest max-w-md mx-auto">
              Inscribe a este equipo en un torneo desde la administración del torneo para poder gestionar su plantilla por competición.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
