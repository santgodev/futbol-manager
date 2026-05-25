"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Shield } from "@/components/ui/Shield";
import { RosterManager } from "@/components/admin/RosterManager";
import { GlobalRosterManager } from "@/components/admin/GlobalRosterManager";

export function TeamDetailsClient({ id }: { id: string }) {
  const router = useRouter();

  const [team, setTeam] = useState<any>(null);
  const [teamTournaments, setTeamTournaments] = useState<any[]>([]);
  const [rosterPlayers, setRosterPlayers] = useState<any[]>([]);
  const [globalPlayers, setGlobalPlayers] = useState<any[]>([]);
  const [globalTeamPlayers, setGlobalTeamPlayers] = useState<any[]>([]);
  const [unassignedPlayers, setUnassignedPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    if (!id) return;
    const supabase = createClient();

    // 1. Fetch team details
    const { data: teamData } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();

    if (!teamData) {
      router.push("/admin/teams");
      return;
    }
    setTeam(teamData);

    // 2. Fetch tournaments this team is registered in
    const { data: tournamentsData } = await supabase
      .from("tournament_teams")
      .select("tournament:tournaments(id, name, slug)")
      .eq("team_id", id);
    if (tournamentsData) setTeamTournaments(tournamentsData);

    // 3. Fetch players registered for this team, grouped by tournament
    const { data: playersData } = await supabase
      .from("tournament_players")
      .select("*, player:players(id, name), tournament:tournaments(id, name)")
      .eq("team_id", id);
    if (playersData) setRosterPlayers(playersData);

    // 4. Fetch all global players (to suggest/add existing ones)
    const { data: allPlayers } = await supabase
      .from("players")
      .select("*")
      .order("name");
    if (allPlayers) setGlobalPlayers(allPlayers);

    // 5. Fetch players belonging globally to this team
    const { data: teamPlayers } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", id)
      .order("name");
    if (teamPlayers) setGlobalTeamPlayers(teamPlayers);

    // 6. Fetch unassigned players globally (free agents)
    const { data: freePlayers } = await supabase
      .from("players")
      .select("*")
      .is("team_id", null)
      .order("name");
    if (freePlayers) setUnassignedPlayers(freePlayers);

    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030b17] flex items-center justify-center text-white">
        <Shield className="w-12 h-16 text-brand-teal animate-pulse" />
      </div>
    );
  }

  if (!team) return null;

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto">
      <Link href="/admin/teams" className="text-[10px] text-brand-aqua/60 uppercase tracking-widest hover:text-brand-teal transition-colors mb-8 inline-block">
        ← Volver a Equipos
      </Link>

      <header className="mb-12 pb-6 border-b border-brand-navy/30 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-[#00f0ff] hero-title !not-italic mb-2 drop-shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            {team.name}
          </h1>
          <p className="text-brand-aqua/50 text-xs uppercase tracking-widest">
            Ficha Técnica y Gestión de Nómina
          </p>
        </div>

        {team.logo_url && (
          <div className="w-16 h-16 rounded-xl bg-[#001122] border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.2)] flex items-center justify-center p-2">
            <img src={team.logo_url} alt={team.name} className="max-w-full max-h-full object-contain" />
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Info & Tournaments */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <section className="panel-premium p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-sand mb-4">Información General</h2>
            <div className="flex flex-col gap-3">
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                <span className="text-[9px] text-brand-aqua/50 uppercase tracking-widest font-bold block mb-1">Ciudad Base</span>
                <span className="text-[10px] font-mono text-white/70 block">{team.city || "Sin especificar"}</span>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                <span className="text-[9px] text-brand-aqua/50 uppercase tracking-widest font-bold block mb-1">Creado el</span>
                <span className="text-xs text-white/90 font-bold">{new Date(team.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </section>

          <section className="panel-premium p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-sand mb-4">Torneos Inscritos</h2>
            <div className="flex flex-col gap-3">
              {teamTournaments?.map(({ tournament }: any) => (
                <Link 
                  key={tournament.id} 
                  href={`/admin/tournaments/${tournament.id}`}
                  className="flex items-center gap-3 bg-black/30 hover:bg-[#001122] border border-white/5 hover:border-brand-teal/40 transition-colors rounded-lg p-3 group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">🏆</span>
                  <span className="text-xs font-bold text-white/80 group-hover:text-brand-teal uppercase tracking-wide">
                    {tournament.name}
                  </span>
                </Link>
              ))}
              {(!teamTournaments || teamTournaments.length === 0) && (
                <div className="bg-black/30 p-4 rounded-lg border border-white/5 border-dashed text-center">
                  <span className="text-[10px] text-brand-aqua/40 uppercase tracking-widest font-bold">No inscrito en ningún torneo</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Side: Roster Managers */}
        <div className="md:col-span-2 flex flex-col gap-8">
          {/* Global Club Roster */}
          <section className="panel-premium p-6">
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-sand mb-2">Plantilla del Club (Nómina Global)</h2>
              <p className="text-[10px] text-brand-aqua/50 uppercase tracking-widest">
                Administra los jugadores oficiales del club. Los jugadores creados o agregados aquí pertenecerán al club globalmente y estarán libres para ser inscritos en torneos específicos.
              </p>
            </div>

            <GlobalRosterManager 
              teamId={id} 
              initialPlayers={globalTeamPlayers || []} 
              unassignedPlayers={unassignedPlayers || []}
              onRosterChanged={fetchAllData}
            />
          </section>

          {/* Tournament Roster (per tournament) */}
          <section className="panel-premium p-6">
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-sand mb-2">Inscripción en Torneos Activos</h2>
              <p className="text-[10px] text-brand-aqua/50 uppercase tracking-widest">
                Inscribe jugadores de la plantilla global en los torneos donde el club esté participando para que puedan registrar estadísticas en vivo (goles, tarjetas, etc.).
              </p>
            </div>

            <RosterManager 
              teamId={id} 
              tournaments={teamTournaments.map(tt => tt.tournament) || []}
              initialPlayers={rosterPlayers || []}
              globalPlayers={globalTeamPlayers || []}
              onRosterChanged={fetchAllData}
            />
          </section>
        </div>

      </div>
    </div>
  );
}
