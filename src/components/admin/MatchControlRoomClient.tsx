"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LiveControlRoom } from "@/components/admin/LiveControlRoom";
import { Shield } from "@/components/ui/Shield";

export function MatchControlRoomClient({ id }: { id: string }) {
  const router = useRouter();

  const [match, setMatch] = useState<any>(null);
  const [homePlayers, setHomePlayers] = useState<any[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    if (!id) return;
    const supabase = createClient();

    const { data: matchData, error } = await supabase
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

    if (error || !matchData) {
      router.push("/admin");
      return;
    }

    // Sort events chronologically
    if (matchData.match_events) {
      matchData.match_events.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    setMatch(matchData);

    // Fetch Rosters
    const { data: homePls } = await supabase
      .from("players")
      .select("id, team_id, name, number, position, photo_url")
      .eq("team_id", matchData.home_team_id || "")
      .eq("is_active", true)
      .order("number", { ascending: true });
    if (homePls) setHomePlayers(homePls);

    const { data: awayPls } = await supabase
      .from("players")
      .select("id, team_id, name, number, position, photo_url")
      .eq("team_id", matchData.away_team_id || "")
      .eq("is_active", true)
      .order("number", { ascending: true });
    if (awayPls) setAwayPlayers(awayPls);

    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030b17] flex items-center justify-center text-white">
        <Shield className="w-12 h-16 text-brand-teal animate-pulse" />
      </div>
    );
  }

  if (!match) return null;

  return (
    <LiveControlRoom 
      match={match} 
      homePlayers={homePlayers} 
      awayPlayers={awayPlayers} 
    />
  );
}
