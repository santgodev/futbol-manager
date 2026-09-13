"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { TournamentHero } from "@/components/tournament/TournamentHero";
import { TournamentTabsView } from "@/components/tournament/TournamentTabsView";
import { TournamentRules } from "@/components/tournament/TournamentRules";
import { DashboardGrid } from "@/components/home/DashboardGrid";
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

        // 2.5. Fetch categories
        const { data: categories } = await supabase
          .from("tournament_categories")
          .select("*")
          .eq("tournament_id", tournament.id)
          .order("display_order", { ascending: true });

        // 3. Fetch matches (ascending order for rounds to display correctly)
        const { data: matches } = await supabase
          .from("matches")
          .select(`
            *,
            home_team:teams!matches_home_team_id_fkey(name, logo_url),
            away_team:teams!matches_away_team_id_fkey(name, logo_url),
            match_sets(
              id,
              set_number,
              home_points,
              away_points,
              status,
              winner_team_id
            )
          `)
          .eq("tournament_id", tournament.id)
          .order("match_date", { ascending: true })
          .order("match_time", { ascending: true });

        // 4. Fetch standings (includes group_name)
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
          volleyball_points_for: st.volleyball_points_for || 0,
          volleyball_points_against: st.volleyball_points_against || 0,
          points: st.points || 0,
        }));

        setData({
          tournament: tournamentProps,
          rules: rules || [],
          categories: categories || [],
          matches: matches || [],
          standings: mappedStandings,
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
      <div className="min-h-screen bg-[#05080b] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-[3px] border-[#0a84ff] border-t-transparent rounded-full animate-spin" />
        <div className="text-[#707b86] text-[13px]">Cargando torneo...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#05080b] flex flex-col items-center justify-center gap-2">
        <h1 className="text-white text-xl font-bold">Torneo no encontrado</h1>
        <p className="text-[#707b86] text-[13px]">El torneo que buscas no existe o fue eliminado.</p>
      </div>
    );
  }

  return (
    <div id="top" className="min-h-screen bg-[#05080b] text-[#f7f9fb] font-sans relative pb-20 md:pb-0">
      <Header />
      <main>
        {/* Hero section with tournament name, dates, location */}
        <TournamentHero tournament={data.tournament} />

        {/* Dashboard stats strip */}
        <div className="w-full">
          <DashboardGrid tournamentId={data.tournament.id} />
        </div>

        {/* Main tabbed content: Fixture / Standings / Ranking / Bracket */}
        <TournamentTabsView
          tournament={data.tournament}
          categories={data.categories}
          matches={data.matches}
          standings={data.standings}
          totalTeams={data.tournament.teams_count}
        />

        {/* Tournament rules (below tabs) */}
        <TournamentRules rules={data.rules} />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
