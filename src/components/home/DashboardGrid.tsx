import { Trophy } from "lucide-react";
import Link from "next/link";
import { FeaturedTournamentCard } from "./FeaturedTournamentCard";
import { StandingsWidget } from "./StandingsWidget";
import { ScorersWidget } from "./ScorersWidget";
import { UpcomingMatchesWidget } from "./UpcomingMatchesWidget";
import { CardsStatsWidget } from "./CardsStatsWidget";
import { GlobalSearchResults } from "./GlobalSearchResults";
import { createClient } from "@/utils/supabase/server";

export const DashboardGrid = async ({ tournamentId }: { tournamentId?: string }) => {
  const supabase = await createClient();

  let activeTournament = null;
  let globalTournaments = null;
  let tError = null;

  if (tournamentId) {
    const { data: tData, error } = await supabase
      .from("tournaments")
      .select("id, slug, name, image_url, status, location, start_date")
      .eq("id", tournamentId)
      .single();
    activeTournament = tData;
    tError = error;
  } else {
    // Fetch multiple active tournaments for the global carousel
    const { data: latestTournaments, error: latestError } = await supabase
      .from("tournaments")
      .select("id, slug, name, image_url, status, location, start_date")
      .order("created_at", { ascending: false })
      .limit(20);
    globalTournaments = latestTournaments || [];
    tError = latestError;
  }

  // If no tournamentId is provided, we are on the global landing page.
  // We just return the carousel and skip the specific dashboard grid.
  if (!tournamentId) {
    return (
      <section id="torneos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-6 scroll-mt-24 min-h-[400px]">
        <GlobalSearchResults initialTournaments={globalTournaments || []} />
      </section>
    );
  }

  console.log("DEBUG: activeTournament =", activeTournament, "Error =", tError);

  let standings: any[] = [];
  let scorers: any[] = [];
  let upcomingMatches: any[] = [];

  if (activeTournament) {
    const { data: stdData } = await supabase
      .from("tournament_standings_view")
      .select("*")
      .eq("tournament_id", activeTournament.id)
      .limit(5);
    if (stdData) standings = stdData;

    const { data: scrData } = await supabase
      .from("tournament_top_scorers_view")
      .select("*")
      .eq("tournament_id", activeTournament.id)
      .order("goals", { ascending: false })
      .limit(3);
    if (scrData) scorers = scrData;

    const { data: matchesData } = await supabase
      .from("matches")
      .select(`
        id, match_date, match_time, status, stage,
        home_team:teams!matches_home_team_id_fkey(name, logo_url),
        away_team:teams!matches_away_team_id_fkey(name, logo_url)
      `)
      .eq("tournament_id", activeTournament.id)
      .eq("status", "SCHEDULED")
      .order("match_date", { ascending: true })
      .order("match_time", { ascending: true })
      .limit(3);
    if (matchesData) upcomingMatches = matchesData;
  }
  return (
    <section id="dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-6 scroll-mt-24">
      {/* 5-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-stretch">

        {/* Col 1 — Featured Tournament Card (3 cols) */}
        <div id="equipos" className="lg:col-span-3 min-h-[410px] scroll-mt-24">
          <FeaturedTournamentCard tournament={activeTournament} isPublic={!!tournamentId} />
        </div>

        {/* Col 2 — Posiciones (3 cols) */}
            <div id="posiciones" className="lg:col-span-3 min-h-[410px] scroll-mt-24">
              <StandingsWidget standings={standings} />
            </div>

            {/* Col 3 — Goleador (3 cols) */}
            <div id="goleador" className="lg:col-span-3 min-h-[410px] scroll-mt-24">
              <ScorersWidget scorers={scorers} />
            </div>

            {/* Col 4 + 5 — Próximos Partidos + Tarjetas stacked (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-6 lg:gap-4">
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
