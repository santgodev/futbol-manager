import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { LiveControlRoom } from "@/components/admin/LiveControlRoom";

export default async function MatchControlRoomPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: match, error } = await supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, name, primary_color, logo_url),
      away_team:teams!matches_away_team_id_fkey(id, name, primary_color, logo_url),
      match_events(
        id, type, minute, description, created_at, team_id,
        player:players!match_events_player_id_fkey(id, name, number)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !match) notFound();

  // Fetch Rosters
  const { data: homePlayers } = await supabase
    .from("players")
    .select("id, team_id, name, number, position, photo_url")
    .eq("team_id", match.home_team_id)
    .eq("is_active", true)
    .order("number", { ascending: true });

  const { data: awayPlayers } = await supabase
    .from("players")
    .select("id, team_id, name, number, position, photo_url")
    .eq("team_id", match.away_team_id)
    .eq("is_active", true)
    .order("number", { ascending: true });

  // Sort events chronologically
  if (match.match_events) {
    match.match_events.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  return (
    <LiveControlRoom 
      match={match} 
      homePlayers={homePlayers || []} 
      awayPlayers={awayPlayers || []} 
    />
  );
}
