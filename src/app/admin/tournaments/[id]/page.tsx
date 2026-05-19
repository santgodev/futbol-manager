import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MatchEditor } from "@/components/admin/MatchEditor";
import { TournamentTeamManager } from "@/components/admin/TournamentTeamManager";
import { TournamentStatusSwitcher } from "@/components/admin/TournamentStatusSwitcher";
import { MatchCreator } from "@/components/admin/MatchCreator";

export default async function AdminTournamentDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*, tournament_teams(*, team:teams(name, logo_url))")
    .eq("id", id)
    .single();

  if (!tournament) return notFound();

  // Fetch all available teams in the database
  const { data: availableTeams } = await supabase
    .from("teams")
    .select("*")
    .order("name");


  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(name),
      away_team:teams!matches_away_team_id_fkey(name),
      match_logs (
        id, old_home_score, new_home_score, old_away_score, new_away_score, created_at, changed_by
      )
    `)
    .eq("tournament_id", id)
    .order("match_date", { ascending: false })
    .order("match_time", { ascending: false });

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto">
      <Link href="/admin" className="text-[10px] text-brand-aqua/60 uppercase tracking-widest hover:text-brand-teal transition-colors mb-8 inline-block">
        ← Volver al Dashboard
      </Link>
      
      <header className="mb-16 border-b border-brand-navy/30 pb-8">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-brand-sand hero-title !not-italic">
            {tournament.name}
          </h1>
          <TournamentStatusSwitcher tournament={tournament} />
        </div>
        <p className="text-brand-aqua/50 text-xs uppercase tracking-widest">
          {tournament.location} • Gestión de Torneo
        </p>
      </header>

      <section className="mb-16">
        <TournamentTeamManager 
          tournamentId={id} 
          availableTeams={availableTeams || []} 
          currentTeams={tournament.tournament_teams || []} 
        />
      </section>

      <section className="mb-16">
        <MatchCreator 
          tournamentId={id} 
          teams={tournament.tournament_teams || []} 
        />
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-widest uppercase text-brand-sand">Editor de Marcadores</h2>
          <Link href={`/t/${tournament.slug}`} target="_blank" className="bg-brand-navy/30 text-brand-sand px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-brand-navy transition-colors">
            Ver Torneo en Vivo ↗
          </Link>
        </div>

        <div className="mt-8 flex flex-col gap-6">
          {matches?.map(match => (
            <MatchEditor key={match.id} match={match} tournamentId={id} />
          ))}
          {(!matches || matches.length === 0) && (
             <div className="p-12 text-center border border-dashed border-brand-navy/30">
               <span className="text-brand-aqua/50 text-xs uppercase tracking-widest">No hay partidos registrados</span>
             </div>
          )}
        </div>
      </section>
    </div>
  );
}
