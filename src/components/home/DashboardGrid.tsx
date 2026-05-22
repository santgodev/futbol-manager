import { Trophy } from "lucide-react";
import Link from "next/link";
import { FeaturedTournamentCard } from "./FeaturedTournamentCard";
import { StandingsWidget } from "./StandingsWidget";
import { ScorersWidget } from "./ScorersWidget";
import { UpcomingMatchesWidget } from "./UpcomingMatchesWidget";
import { CardsStatsWidget } from "./CardsStatsWidget";
import { createClient } from "@/utils/supabase/server";

export const DashboardGrid = async () => {
  const supabase = await createClient();

  // Fetch the latest active tournament
  const { data: latestTournament, error: tError } = await supabase
    .from("tournaments")
    .select("id, name, image_url, status, location, start_date")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  console.log("DEBUG: latestTournament =", latestTournament, "Error =", tError);

  let standings: any[] = [];
  let scorers: any[] = [];
  let upcomingMatches: any[] = [];

  if (latestTournament) {
    const { data: stdData } = await supabase
      .from("tournament_standings_view")
      .select("*")
      .eq("tournament_id", latestTournament.id)
      .limit(5);
    if (stdData) standings = stdData;

    const { data: scrData } = await supabase
      .from("tournament_top_scorers_view")
      .select("*")
      .eq("tournament_id", latestTournament.id)
      .limit(3);
    if (scrData) scorers = scrData;

    const { data: matchesData } = await supabase
      .from("matches")
      .select(`
        id, match_date, match_time, status, stage,
        home_team:teams!matches_home_team_id_fkey(name, logo_url),
        away_team:teams!matches_away_team_id_fkey(name, logo_url)
      `)
      .eq("tournament_id", latestTournament.id)
      .eq("status", "SCHEDULED")
      .order("match_date", { ascending: true })
      .order("match_time", { ascending: true })
      .limit(3);
    if (matchesData) upcomingMatches = matchesData;
  }
  return (
    <section id="torneos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-6 scroll-mt-24">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Trophy size={18} className="text-brand-yellow" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
            Torneos Destacados
          </h2>
        </div>
        <Link
          href="/torneos"
          className="text-xs text-brand-cyan hover:text-white transition-colors tracking-wider"
        >
          Ver todos
        </Link>
      </div>

      {/* 5-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">

        {/* Col 1 — Featured Tournament Card (3 cols) */}
        <div id="equipos" className="lg:col-span-3 min-h-[410px] scroll-mt-24">
          <FeaturedTournamentCard tournament={latestTournament} />
        </div>

        {/* Col 2 — Posiciones (3 cols) */}
        <div id="posiciones" className="lg:col-span-3 min-h-[410px] scroll-mt-24">
          <StandingsWidget standings={standings} />
        </div>

        {/* Col 3 — Goleador (2 cols) */}
        <div id="goleador" className="lg:col-span-2 min-h-[410px] scroll-mt-24">
          <ScorersWidget scorers={scorers} />
        </div>

        {/* Col 4 + 5 — Próximos Partidos + Tarjetas stacked (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div id="partidos" className="flex-1 min-h-[199px] scroll-mt-24">
            <UpcomingMatchesWidget matches={upcomingMatches} />
          </div>
          <div id="tarjetas" className="flex-1 min-h-[199px] scroll-mt-24">
            <CardsStatsWidget />
          </div>
        </div>

      </div>
    </section>
  );
};
