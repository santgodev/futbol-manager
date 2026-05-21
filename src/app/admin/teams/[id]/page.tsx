import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Shield, ArrowLeft, MapPin, Trophy, Users } from "lucide-react";
import { TeamRoster } from "@/components/admin/TeamRoster";

export default async function AdminTeamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select(`
      *,
      players(*),
      tournament_teams(tournament:tournaments(name, status, id))
    `)
    .eq("id", id)
    .single();

  if (!team) return notFound();

  // Active players
  const activePlayers = team.players?.filter(p => p.is_active) || [];
  
  const teamColor = team.primary_color || "#0066cc";

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      
      {/* ── Back ── */}
      <Link href="/admin/teams" className="inline-flex items-center gap-2 text-[#00f0ff]/60 hover:text-[#00f0ff] uppercase tracking-widest text-xs font-bold mb-8 transition-colors">
        <ArrowLeft size={14} /> Volver a Equipos
      </Link>

      {/* ── HEADER ── */}
      <header className="mb-10 bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_40px_rgba(0,100,255,0.08)]">
        {/* Dynamic Glow based on team primary color */}
        <div 
          className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[80px] pointer-events-none opacity-20"
          style={{ backgroundColor: teamColor }}
        />

        <div className="flex flex-col md:flex-row md:items-start gap-6 relative z-10">
          {/* Logo */}
          <div className="shrink-0 w-24 h-24 rounded-xl bg-[#001133] border border-[#0055cc]/30 flex items-center justify-center overflow-hidden shadow-inner p-2">
            {team.logo_url ? (
              <Image src={team.logo_url} alt={team.name} width={96} height={96} className="object-contain" unoptimized />
            ) : (
              <Shield size={40} className="text-[#0055cc]/50" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white hero-title !not-italic truncate drop-shadow-[0_0_12px_rgba(0,240,255,0.3)] mb-2">
              {team.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-widest text-white/50 mb-6">
              {team.city && (
                <span className="flex items-center gap-1.5 text-[#00f0ff]/80">
                  <MapPin size={14} /> {team.city}
                </span>
              )}
              {team.created_at && (
                <span>Creado: {new Date(team.created_at).getFullYear()}</span>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="bg-[#001122]/50 border border-[#0055cc]/20 rounded-lg px-4 py-2 flex items-center gap-3">
                <Users size={16} className="text-[#00f0ff]" />
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm leading-none">{activePlayers.length}</span>
                  <span className="text-white/40 text-[9px] uppercase tracking-widest mt-1">Jugadores</span>
                </div>
              </div>
              <div className="bg-[#001122]/50 border border-[#0055cc]/20 rounded-lg px-4 py-2 flex items-center gap-3">
                <Trophy size={16} className="text-amber-400" />
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm leading-none">{team.tournament_teams?.length || 0}</span>
                  <span className="text-white/40 text-[9px] uppercase tracking-widest mt-1">Torneos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── ROSTER SECTION ── */}
      <section className="bg-[#02060d]/60 backdrop-blur-md border border-[#0055cc]/20 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#0055cc]/20 bg-[#001122]/40">
          <Users size={16} className="text-[#00f0ff]" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">
            Plantilla Oficial (Roster)
          </h2>
        </div>
        
        <div className="p-6">
          <TeamRoster teamId={team.id} initialPlayers={activePlayers} />
        </div>
      </section>

    </div>
  );
}
