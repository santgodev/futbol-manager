import { Trophy } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
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
        <Suspense fallback={
          <div className="flex flex-col justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-[#0088ff] border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-white/40 text-sm">Cargando torneos destacados...</div>
          </div>
        }>
          <GlobalSearchResults initialTournaments={globalTournaments || []} />
        </Suspense>
      </section>
    );
  }

  console.log("DEBUG: activeTournament =", activeTournament, "Error =", tError);

  let standings: any[] = [];
  let scorers: any[] = [];
  let upcomingMatches: any[] = [];
  let yellowCards = 0;
  let redCards = 0;
  let cardEvents: any[] = [];

  if (activeTournament) {
    const { data: stdData } = await supabase
      .from("tournament_standings_view")
      .select("*")
      .eq("tournament_id", activeTournament.id)
      .order("points", { ascending: false })
      .order("goal_difference", { ascending: false })
      .order("goals_for", { ascending: false })
      .limit(5);
    if (stdData) standings = stdData;

    const { data: scrData } = await supabase
      .from("tournament_top_scorers_view")
      .select("*")
      .eq("tournament_id", activeTournament.id)
      .order("goals", { ascending: false })
      .limit(5);
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

    // Tarjetas reales con info de jugador y equipo
    const { data: cardsData } = await supabase
      .from("match_events")
      .select(`
        type, minute,
        player:players!match_events_player_id_fkey(name, number),
        team:teams!match_events_team_id_fkey(name)
      `)
      .eq("tournament_id", activeTournament.id)
      .in("type", ["YELLOW_CARD", "RED_CARD"])
      .order("created_at", { ascending: false });
    if (cardsData) {
      yellowCards = cardsData.filter((e: any) => e.type === "YELLOW_CARD").length;
      redCards = cardsData.filter((e: any) => e.type === "RED_CARD").length;
      cardEvents = cardsData as any[];
    }
  }
  return (
    <section id="dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-6 scroll-mt-20">
      {/* 
        Mobile:  order-1 Próximos, order-2 Posiciones, order-3 Goleadores, order-4 Tarjetas
        Desktop: 3-column grid unchanged (posiciones | goleadores | próximos+tarjetas)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

        {/* Col 1 — Posiciones (4 cols) | order-2 on mobile */}
        <div id="posiciones" className="lg:col-span-4 min-h-[410px] scroll-mt-20 order-2 lg:order-none">
          <StandingsWidget standings={standings} />
        </div>

        {/* Col 2 — Goleadores (4 cols) | order-3 on mobile */}
        <div id="goleador" className="lg:col-span-4 min-h-[410px] scroll-mt-20 order-3 lg:order-none">
          <ScorersWidget scorers={scorers} />
        </div>

        {/* Col 3 — Próximos Partidos + Tarjetas stacked (4 cols) | order-1 on mobile */}
        <div className="lg:col-span-4 flex flex-col gap-4 order-1 lg:order-none">
          <div id="partidos" className="flex-1 min-h-[199px] scroll-mt-20">
            <UpcomingMatchesWidget matches={upcomingMatches} />
          </div>
          <div id="tarjetas" className="flex-1 min-h-[199px] scroll-mt-20">
            <CardsStatsWidget yellowCards={yellowCards} redCards={redCards} cardEvents={cardEvents} />
          </div>
        </div>
      </div>
    </section>
  );
};

