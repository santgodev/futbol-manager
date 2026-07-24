"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FeaturedTournamentCard } from "./FeaturedTournamentCard";
import { StandingsWidget } from "./StandingsWidget";
import { ScorersWidget } from "./ScorersWidget";
import { UpcomingMatchesWidget } from "./UpcomingMatchesWidget";
import { CardsStatsWidget } from "./CardsStatsWidget";
import { GlobalSearchResults } from "./GlobalSearchResults";
import { createClient } from "@/utils/supabase/client";

export const DashboardGrid = ({ tournamentId }: { tournamentId?: string }) => {
  const [data, setData] = useState<{
    activeTournament: any;
    globalTournaments: any[];
    standings: any[];
    scorers: any[];
    upcomingMatches: any[];
    yellowCards: number;
    redCards: number;
    cardEvents: any[];
  } | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      try {
        let activeTournament = null;
        let globalTournaments = null;
        let standings: any[] = [];
        let scorers: any[] = [];
        let upcomingMatches: any[] = [];
        let yellowCards = 0;
        let redCards = 0;
        let cardEvents: any[] = [];

        if (tournamentId) {
          const { data: tData } = await supabase
            .from("tournaments")
            .select("id, slug, name, image_url, status, location, start_date")
            .eq("id", tournamentId)
            .single();
          activeTournament = tData;
        } else {
          const { data: latestTournaments } = await supabase
            .from("tournaments")
            .select("id, slug, name, image_url, status, location, start_date")
            .order("created_at", { ascending: false })
            .limit(20);
          globalTournaments = latestTournaments || [];
        }

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

        setData({
          activeTournament,
          globalTournaments: globalTournaments || [],
          standings,
          scorers,
          upcomingMatches,
          yellowCards,
          redCards,
          cardEvents
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tournamentId]);

  if (!tournamentId) {
    return (
      <section id="torneos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-6 scroll-mt-24 min-h-[400px]">
        {loading || !data ? (
          <div className="flex flex-col justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-[#0088ff] border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-white/40 text-sm">Cargando torneos destacados...</div>
          </div>
        ) : (
          <GlobalSearchResults initialTournaments={data.globalTournaments} />
        )}
      </section>
    );
  }

  if (loading || !data) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-6">
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#0088ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section id="dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-6 scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div id="posiciones" className="lg:col-span-4 min-h-[410px] scroll-mt-20 order-2 lg:order-none">
          <StandingsWidget standings={data.standings} tournamentId={data.activeTournament?.id} />
        </div>
        <div id="goleador" className={`lg:col-span-4 ${data.scorers.length > 0 ? "min-h-[410px]" : ""} scroll-mt-20 order-3 lg:order-none`}>
          <ScorersWidget scorers={data.scorers} tournamentId={data.activeTournament?.id} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-4 order-1 lg:order-none">
          <div id="partidos" className="w-full scroll-mt-20">
            <UpcomingMatchesWidget matches={data.upcomingMatches} />
          </div>
          <div id="tarjetas" className="w-full scroll-mt-20">
            <CardsStatsWidget yellowCards={data.yellowCards} redCards={data.redCards} cardEvents={data.cardEvents} />
          </div>
        </div>
      </div>
    </section>
  );
};

