import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { TournamentHero } from "@/components/tournament/TournamentHero";
import { MatchCenter } from "@/components/tournament/MatchCenter";
import { TournamentCalendar } from "@/components/tournament/TournamentCalendar";
import { DashboardGrid } from "@/components/home/DashboardGrid";
import { TournamentRules } from "@/components/tournament/TournamentRules";
import { KnockoutBracket } from "@/components/tournament/KnockoutBracket";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TournamentDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const supabase = await createClient();

  // Fetch the tournament
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select(`
      *,
      tournament_teams (count)
    `)
    .eq("slug", id)
    .single();

  if (tournamentError || !tournament) {
    console.error(tournamentError);
    return notFound();
  }

  // Calculate teams count from the related table, but the query returns [{count: X}]
  const teams_count = Number(tournament.tournament_teams?.[0]?.count || 0);
  
  // Format the tournament object to match our component props
  const tournamentProps = {
    ...tournament,
    teams_count
  };

  // Fetch the rules
  const { data: rules } = await supabase
    .from("tournament_rules")
    .select("*")
    .eq("tournament_id", tournament.id)
    .order("order_index", { ascending: true });

  // Fetch matches
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

  // Fetch standings
  const { data: standings } = await supabase
    .from("tournament_teams")
    .select(`
      *,
      team:teams!tournament_teams_team_id_fkey(name, logo_url)
    `)
    .eq("tournament_id", tournament.id)
    .order("points", { ascending: false })
    .order("goals_for", { ascending: false });

  // Fetch scorers
  const { data: scorers } = await supabase
    .from("tournament_players")
    .select(`
      *,
      player:players!tournament_players_player_id_fkey(name),
      team:teams!tournament_players_team_id_fkey(name)
    `)
    .eq("tournament_id", tournament.id)
    .order("goals", { ascending: false });

  return (
    <div id="top" className="min-h-screen bg-brand-deep text-brand-text font-sans selection:bg-brand-blue selection:text-white relative pb-20 md:pb-0">
      
      {/* Cinematic Grain Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />

      <Header />
      
      <main>
        <TournamentHero tournament={tournamentProps} />
        
        {/* Statistics & Standings Grid (identical premium design to homepage!) */}
        <div className="w-full">
          <DashboardGrid tournamentId={tournament.id} />
        </div>

        <MatchCenter matches={matches || []} />
        <TournamentCalendar matches={matches || []} />
        <KnockoutBracket matches={matches || []} totalTeams={teams_count} />
        <TournamentRules rules={rules || []} />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export async function generateStaticParams() {
  const { createClient: createSimpleClient } = await import("@supabase/supabase-js");
  const supabase = createSimpleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: tournaments } = await supabase.from("tournaments").select("slug");
  return (tournaments || []).map((t) => ({ id: t.slug }));
}
