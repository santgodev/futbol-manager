"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FeaturedTournamentCard } from "./FeaturedTournamentCard";
import { StandingsWidget } from "./StandingsWidget";
import { ScorersWidget } from "./ScorersWidget";
import { UpcomingMatchesWidget } from "./UpcomingMatchesWidget";
import { GlobalSearchResults } from "./GlobalSearchResults";
import { createClient } from "@/utils/supabase/client";

export const DashboardGrid = ({ tournamentId }: { tournamentId?: string }) => {
  const [data, setData] = useState<{
    activeTournament: any;
    globalTournaments: any[];
    standings: any[];
    scorers: any[];
    upcomingMatches: any[];
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

        if (tournamentId) {
          const { data: tData } = await supabase
            .from("tournaments")
            .select("id, slug, name, image_url, status, location, start_date, sport")
            .eq("id", tournamentId)
            .single();
          activeTournament = tData;
        } else {
          const { data: latestTournaments } = await supabase
            .from("tournaments")
            .select("id, slug, name, image_url, status, location, start_date, sport")
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
          if (scrData && scrData.length > 0) {
            scorers = scrData;
          } else {
            // Fallback: Si hubo goles aprobados por Anotador antes del fix (en match_results.sets_data o match_events)
            const { data: approvedResults } = await supabase
              .from("match_results")
              .select("sets_data, match:match_id(home_team_id, away_team_id, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name))")
              .eq("tournament_id", activeTournament.id)
              .eq("status", "APPROVED");

            const fallbackMap = new Map<string, any>();
            for (const r of approvedResults || []) {
              if (!r.sets_data) continue;
              try {
                const evs = typeof r.sets_data === "string" ? JSON.parse(r.sets_data) : r.sets_data;
                if (!Array.isArray(evs)) continue;
                const mInfo: any = Array.isArray(r.match) ? r.match[0] : r.match;
                for (const ev of evs) {
                  if (ev.type === "GOAL") {
                    const pId = ev.player_id || ev.player?.name || "anon";
                    const pName = ev.player?.name || ev.description || "Jugador";
                    const tName =
                      ev.team_id === mInfo?.home_team_id
                        ? mInfo?.home_team?.name
                        : ev.team_id === mInfo?.away_team_id
                        ? mInfo?.away_team?.name
                        : "";
                    const cur = fallbackMap.get(pId) || {
                      player_id: pId,
                      player_name: pName,
                      team_id: ev.team_id,
                      team_name: tName || "Equipo",
                      goals: 0,
                      number: ev.player?.number || null,
                      photo_url: null,
                    };
                    cur.goals += 1;
                    fallbackMap.set(pId, cur);
                  }
                }
              } catch {
                // ignore malformed JSON
              }
            }
            scorers = Array.from(fallbackMap.values())
              .sort((a, b) => b.goals - a.goals)
              .slice(0, 5);
          }

          const { data: matchesData } = await supabase
            .from("matches")
            .select(`
              id, home_team_id, away_team_id, match_date, match_time, status, stage,
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

        setData({
          activeTournament,
          globalTournaments: globalTournaments || [],
          standings,
          scorers,
          upcomingMatches
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
          <div className="flex flex-col justify-center items-center py-16">
            <div className="w-7 h-7 border-[3px] border-[#0a84ff] border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-[#707b86] text-[13px]">Cargando torneos...</div>
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
          <div className="w-7 h-7 border-[3px] border-[#0a84ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const isVolleyball = data.activeTournament?.sport === "VOLLEYBALL" || data.activeTournament?.sport === "BEACH_VOLLEYBALL";

  return (
    <section id="dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-6 scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div id="posiciones" className={`${isVolleyball ? "lg:col-span-6" : "lg:col-span-4"} min-h-[410px] scroll-mt-20 order-2 lg:order-none`}>
          <StandingsWidget standings={data.standings} tournamentId={data.activeTournament?.id} sport={data.activeTournament?.sport} />
        </div>
        
        {!isVolleyball && (
          <div id="goleador" className={`lg:col-span-4 ${data.scorers.length > 0 ? "min-h-[410px]" : ""} scroll-mt-20 order-3 lg:order-none`}>
            <ScorersWidget scorers={data.scorers} tournamentId={data.activeTournament?.id} sport={data.activeTournament?.sport} />
          </div>
        )}

        <div className={`${isVolleyball ? "lg:col-span-6" : "lg:col-span-4"} flex flex-col gap-4 order-1 lg:order-none`}>
          <div id="partidos" className="w-full scroll-mt-20">
            <UpcomingMatchesWidget matches={data.upcomingMatches} />
          </div>
        </div>
      </div>
    </section>
  );
};

