"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { TournamentHero } from "@/components/tournament/TournamentHero";
import { MatchCenter } from "@/components/tournament/MatchCenter";
import { TournamentCalendar } from "@/components/tournament/TournamentCalendar";
import { DashboardGrid } from "@/components/home/DashboardGrid";
import { TournamentRules } from "@/components/tournament/TournamentRules";
import { KnockoutBracket } from "@/components/tournament/KnockoutBracket";
import { PublicGroupStandings } from "@/components/tournament/PublicGroupStandings";
import { createClient } from "@/utils/supabase/client";

export function TournamentClientWrapper({ slug }: { slug: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        
        // 1. Fetch tournament
        const { data: tournament, error: tournamentError } = await supabase
          .from("tournaments")
          .select(`*, tournament_teams (count)`)
          .eq("slug", slug)
          .single();

        if (tournamentError || !tournament) {
          setError(true);
          setLoading(false);
          return;
        }

        const teams_count = Number(tournament.tournament_teams?.[0]?.count || 0);
        const tournamentProps = { ...tournament, teams_count };

        // 2. Fetch rules
        const { data: rules } = await supabase
          .from("tournament_rules")
          .select("*")
          .eq("tournament_id", tournament.id)
          .order("order_index", { ascending: true });

        // 3. Fetch matches
        const { data: matches } = await supabase
          .from("matches")
          .select(`
            *,
            home_team:teams!matches_home_team_id_fkey(name, logo_url),
            away_team:teams!matches_away_team_id_fkey(name, logo_url)
          `)
          .eq("tournament_id", tournament.id)
          .order("match_date", { ascending: false })
          .order("match_time", { ascending: false });

        // 4. Fetch standings
        const { data: standings } = await supabase
          .from("tournament_standings_view")
          .select("*")
          .eq("tournament_id", tournament.id)
          .order("points", { ascending: false })
          .order("goal_difference", { ascending: false })
          .order("goals_for", { ascending: false });

        const mappedStandings = (standings || []).map((st: any) => ({
          team_id: st.team_id,
          team_name: st.team_name || "Desconocido",
          logo_url: st.logo_url || null,
          group_name: st.group_name || null,
          played: st.played || 0,
          won: st.won || 0,
          drawn: st.drawn || 0,
          lost: st.lost || 0,
          goals_for: st.goals_for || 0,
          goals_against: st.goals_against || 0,
          goal_difference: st.goal_difference || 0,
          points: st.points || 0
        }));

        setData({
          tournament: tournamentProps,
          rules: rules || [],
          matches: matches || [],
          standings: mappedStandings
        });
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-deep flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#0088ff] border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-[#00f0ff] uppercase tracking-widest text-xs font-black animate-pulse">Cargando Torneo...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-brand-deep flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl font-bold">Torneo no encontrado</h1>
      </div>
    );
  }

  return (
    <div id="top" className="min-h-screen bg-brand-deep text-brand-text font-sans selection:bg-brand-blue selection:text-white relative pb-20 md:pb-0">
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
      <Header />
      <main>
        <TournamentHero tournament={data.tournament} />
        <div className="w-full">
          <DashboardGrid tournamentId={data.tournament.id} />
        </div>
        <MatchCenter matches={data.matches} />
        <PublicGroupStandings standings={data.standings} />
        <TournamentCalendar matches={data.matches} />
        <KnockoutBracket matches={data.matches} totalTeams={data.tournament.teams_count} />
        <TournamentRules rules={data.rules} />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
