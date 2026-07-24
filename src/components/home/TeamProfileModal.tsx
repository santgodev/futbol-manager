"use client";

import { useEffect, useState } from "react";
import { X, Shield, Calendar, Clock, Loader2 } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface TeamProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: any;
  tournamentId?: string;
}

export function TeamProfileModal({ isOpen, onClose, team, tournamentId }: TeamProfileModalProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && team && tournamentId) {
      const fetchMatches = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("matches")
          .select(`
            id, match_date, match_time, status, home_score, away_score,
            home_team:teams!matches_home_team_id_fkey(id, name, logo_url),
            away_team:teams!matches_away_team_id_fkey(id, name, logo_url)
          `)
          .eq("tournament_id", tournamentId)
          .or(`home_team_id.eq.${team.team_id},away_team_id.eq.${team.team_id}`)
          .order("match_date", { ascending: false })
          .order("match_time", { ascending: false });

        if (!error && data) {
          setMatches(data);
        }
        setLoading(false);
      };
      fetchMatches();
    } else {
      setMatches([]);
    }
  }, [isOpen, team, tournamentId]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !team || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="w-full max-w-lg bg-[#001f4d] border border-brand-blue/40 shadow-[0_10px_50px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-b from-[#003380] to-[#001f4d] border-b border-brand-blue/20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-brand-aqua/60 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-black/40 border border-brand-cyan/40 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                {team.logo_url ? (
                  <Image src={team.logo_url} alt={team.team_name} width={80} height={80} className="object-cover" unoptimized />
                ) : (
                  <Shield size={40} className="text-brand-cyan/50" />
                )}
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-white text-center hero-title !not-italic drop-shadow-[0_0_10px_rgba(0,136,255,0.8)]">
                {team.team_name}
              </h2>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            {/* Stats Grid */}
            <div>
              <h3 className="text-[10px] font-bold text-brand-aqua/60 uppercase tracking-widest mb-4">
                Estadísticas del Torneo
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "⚽ Jugados", value: team.played ?? team.matches_played ?? "0" },
                  { label: "✅ Victorias", value: team.won ?? team.wins ?? "0" },
                  { label: "➖ Empates", value: team.drawn ?? team.draws ?? "0" },
                  { label: "❌ Derrotas", value: team.lost ?? team.losses ?? "0" },
                  { label: "🔥 Goles a Favor", value: team.goals_for ?? "0" },
                  { label: "🧤 Goles en Contra", value: team.goals_against ?? "0" },
                  { label: "⚖️ Dif. Goles", value: team.goal_difference !== undefined ? (team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference) : "0" },
                  { label: "⭐ Puntos", value: team.points ?? "0", highlight: true }
                ].map(({ label, value, highlight }, i) => (
                  <div key={i} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${highlight ? 'bg-brand-cyan/10 border-brand-cyan/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'bg-black/20 border-brand-blue/20'}`}>
                    <span className={`text-[10px] sm:text-[9px] uppercase tracking-wider text-center w-full ${highlight ? 'text-brand-cyan font-bold' : 'text-brand-aqua/50'}`}>{label}</span>
                    <span className={`text-xl font-black font-mono mt-1 ${highlight ? 'text-white' : 'text-brand-sand'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Match History */}
            <div>
              <h3 className="text-[10px] font-bold text-brand-aqua/60 uppercase tracking-widest mb-4">
                Historial de Partidos
              </h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center p-6 bg-black/20 rounded-xl border border-brand-blue/20 text-brand-aqua/50 text-xs">
                  Este equipo no tiene partidos registrados aún.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {matches.map((m) => {
                    const isHome = m.home_team?.id === team.team_id;
                    const opponent = isHome ? m.away_team : m.home_team;
                    const myScore = isHome ? m.home_score : m.away_score;
                    const theirScore = isHome ? m.away_score : m.home_score;
                    
                    let resultColor = "text-brand-aqua/50";
                    let resultBg = "bg-black/20 border-brand-blue/20";
                    let resultText = "-";
                    
                    if (m.status === "FINISHED") {
                      if (myScore > theirScore) {
                        resultColor = "text-green-400";
                        resultBg = "bg-green-500/10 border-green-500/30";
                        resultText = "V";
                      } else if (myScore < theirScore) {
                        resultColor = "text-red-400";
                        resultBg = "bg-red-500/10 border-red-500/30";
                        resultText = "D";
                      } else {
                        resultColor = "text-yellow-400";
                        resultBg = "bg-yellow-500/10 border-yellow-500/30";
                        resultText = "E";
                      }
                    }

                    return (
                      <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-brand-blue/30">
                        {/* Result Badge */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 border ${resultBg} ${resultColor}`}>
                          {resultText}
                        </div>
                        
                        {/* Opponent */}
                        <div className="flex-1 px-4 flex items-center gap-3 min-w-0">
                          <span className="text-[10px] text-brand-aqua/50 font-bold uppercase">{isHome ? 'VS' : '@'}</span>
                          <div className="w-6 h-6 rounded-full bg-black/40 border border-brand-blue/30 flex items-center justify-center overflow-hidden shrink-0">
                            {opponent?.logo_url ? (
                              <Image src={opponent.logo_url} alt={opponent.name} width={24} height={24} className="object-cover" unoptimized />
                            ) : (
                              <Shield size={12} className="text-brand-aqua/30" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-white uppercase truncate">{opponent?.name}</span>
                        </div>

                        {/* Score or Date */}
                        <div className="shrink-0 text-right">
                          {m.status === "FINISHED" ? (
                            <span className={`text-lg font-black font-mono ${resultColor}`}>
                              {myScore} - {theirScore}
                            </span>
                          ) : (
                            <div className="flex flex-col items-end gap-1">
                              <span className="flex items-center gap-1 text-[9px] text-brand-aqua/60 uppercase tracking-widest">
                                <Calendar size={10} /> {m.match_date ? new Date(m.match_date + "T00:00:00").toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : 'TBD'}
                              </span>
                              <span className="flex items-center gap-1 text-[9px] text-brand-cyan font-mono">
                                <Clock size={10} /> {m.match_time ? m.match_time.slice(0, 5) : 'TBD'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
