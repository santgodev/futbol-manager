"use client";

import { motion } from "framer-motion";
import { Shield } from "@/components/ui/Shield";
import { Flame } from "lucide-react";

function stageLabel(stage: string, roundNumber?: number | null): string {
  switch (stage) {
    case "GROUP": return roundNumber ? `Jornada ${roundNumber}` : "Fase de Grupos";
    case "ROUND_32": return "Ronda de 32";
    case "ROUND_16": return "Octavos de Final";
    case "QUARTERFINAL": return "Cuartos de Final";
    case "SEMIFINAL": return "Semifinal";
    case "FINAL": return "Gran Final";
    case "THIRD_PLACE": return "Tercer Puesto";
    default: return stage;
  }
}

function pickFeaturedMatch(matches: any[]): any | null {
  if (!matches || matches.length === 0) return null;
  const live = matches.find(m => m.status === "LIVE" || m.status === "IN_PLAY");
  if (live) return live;
  const finished = matches
    .filter(m => m.status === "FINISHED")
    .sort((a, b) => new Date(b.match_date ?? 0).getTime() - new Date(a.match_date ?? 0).getTime());
  if (finished.length > 0) return finished[0];
  const scheduled = matches
    .filter(m => m.status === "SCHEDULED")
    .sort((a, b) => new Date(a.match_date ?? 0).getTime() - new Date(b.match_date ?? 0).getTime());
  return scheduled[0] ?? matches[0];
}

/** Calculate momentum: how many consecutive wins does a team have from recent finished matches */
function getMomentumMessage(matches: any[], featuredTeamName: string | null): string | null {
  if (!featuredTeamName) return null;
  const finished = matches
    .filter(m => m.status === "FINISHED" && m.home_score !== null && m.away_score !== null)
    .sort((a, b) => new Date(b.match_date ?? 0).getTime() - new Date(a.match_date ?? 0).getTime());
  if (finished.length < 2) return null;

  let streak = 0;
  let streakTeam: string | null = null;
  for (const m of finished) {
    const homeWon = m.home_score > m.away_score;
    const awayWon = m.away_score > m.home_score;
    const winnerName = homeWon ? m.home_team?.name : awayWon ? m.away_team?.name : null;
    if (!winnerName) break;
    if (streakTeam === null) { streakTeam = winnerName; streak = 1; }
    else if (winnerName === streakTeam) streak++;
    else break;
  }
  if (streak >= 2 && streakTeam) return `${streakTeam} lleva ${streak} victorias seguidas`;
  return null;
}

const TeamLogo = ({ logoUrl, name }: { logoUrl?: string | null; name?: string }) => (
  <div className="w-16 h-20 md:w-24 md:h-28 bg-brand-deep/50 border border-white/5 rounded-xl flex items-center justify-center p-3 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
    {logoUrl
      ? <img src={logoUrl} className="w-full h-full object-contain" alt={name ?? ""} />
      : <Shield className="w-full h-full text-brand-cyan/20" />
    }
  </div>
);

const SmallTeamLogo = ({ logoUrl, name }: { logoUrl?: string | null; name?: string }) => (
  <div className="w-6 h-6 rounded-full bg-brand-navy border border-brand-cyan/10 flex items-center justify-center shrink-0 overflow-hidden">
    {logoUrl
      ? <img src={logoUrl} className="w-full h-full object-cover" alt={name ?? ""} />
      : <Shield className="w-3.5 h-3.5 text-brand-cyan/30" />
    }
  </div>
);

export const MatchCenter = ({ matches }: { matches: any[] }) => {
  if (!matches || matches.length === 0) return null;

  const featuredMatch = pickFeaturedMatch(matches);
  if (!featuredMatch) return null;

  const isScheduled = featuredMatch.status === "SCHEDULED";
  const isLive = featuredMatch.status === "LIVE" || featuredMatch.status === "IN_PLAY";
  const isFinished = featuredMatch.status === "FINISHED";

  const homeScore = isScheduled ? null : (featuredMatch.home_score ?? null);
  const awayScore = isScheduled ? null : (featuredMatch.away_score ?? null);

  const homeWon = homeScore !== null && awayScore !== null && homeScore > awayScore;
  const awayWon = homeScore !== null && awayScore !== null && awayScore > homeScore;

  const recentMatches = matches.filter(m => m.id !== featuredMatch.id).slice(0, 8);
  const momentum = getMomentumMessage(matches, featuredMatch.home_team?.name ?? null);

  return (
    <section id="matches" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff]" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
            Centro de Partidos
          </h2>
        </div>
        <span className={`text-[10px] font-mono uppercase tracking-widest ${isLive ? "text-red-400" : "text-brand-cyan/60"}`}>
          {isLive ? "🔴 EN VIVO" : "Partidos en Vivo & Recientes"}
        </span>
      </div>

      {/* Featured match hero card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-full glass-panel p-6 md:p-10 mb-4 relative overflow-hidden transition-all duration-300
          ${isLive ? "border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.08)]" : "shadow-[0_0_40px_rgba(0,102,255,0.07)] hover:border-brand-cyan/40"}`}
      >
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-blue/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full flex flex-col items-center relative z-10">
          {/* Status badge */}
          <span className={`font-mono font-bold text-xs mb-6 tracking-[0.3em] uppercase px-4 py-1.5 rounded-full flex items-center gap-2 ${
            isLive
              ? "bg-red-500/15 border border-red-500/30 text-red-400"
              : isScheduled
              ? "bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan"
              : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
          }`}>
            {isLive && <span className="w-2 h-2 rounded-full bg-red-500 live-pulse" />}
            {isLive ? "EN VIVO" : isScheduled ? "Programado" : "✓ Final"}
          </span>

          {/* Teams + Score */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl gap-6 md:gap-4">
            {/* Home */}
            <div className={`flex items-center gap-4 flex-1 justify-center md:justify-end w-full ${homeWon ? "opacity-100" : isFinished ? "opacity-60" : ""}`}>
              <span className={`text-lg md:text-3xl font-black italic uppercase tracking-tight text-center md:text-right ${homeWon ? "text-white" : "text-brand-text-muted"}`}>
                {featuredMatch.home_team?.name || "TBD"}
              </span>
              <TeamLogo logoUrl={featuredMatch.home_team?.logo_url} name={featuredMatch.home_team?.name} />
            </div>

            {/* Score */}
            <div className="flex flex-col items-center shrink-0 px-4">
              {homeScore !== null && awayScore !== null ? (
                <div className="text-5xl md:text-7xl font-black tracking-tighter tabular-nums flex items-center gap-3 text-white font-display">
                  <span className={homeWon ? "text-brand-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]" : ""}>{homeScore}</span>
                  <span className="text-brand-cyan/30 font-light text-3xl md:text-5xl">-</span>
                  <span className={awayWon ? "text-brand-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]" : ""}>{awayScore}</span>
                </div>
              ) : (
                <span className="text-3xl md:text-5xl text-brand-cyan/50 font-mono tracking-[0.2em] font-bold">VS</span>
              )}
              <span className="text-[9px] font-mono text-brand-text-muted uppercase tracking-widest mt-2">
                {stageLabel(featuredMatch.stage, featuredMatch.round_number)}
              </span>
              {(featuredMatch.match_date || featuredMatch.match_time) && (
                <span className="text-[9px] font-mono text-brand-text-muted/60 uppercase tracking-widest">
                  {featuredMatch.match_date}{featuredMatch.match_time ? " • " + featuredMatch.match_time.substring(0, 5) : ""}
                </span>
              )}
            </div>

            {/* Away */}
            <div className={`flex items-center gap-4 flex-1 justify-center md:justify-start w-full ${awayWon ? "opacity-100" : isFinished ? "opacity-60" : ""}`}>
              <TeamLogo logoUrl={featuredMatch.away_team?.logo_url} name={featuredMatch.away_team?.name} />
              <span className={`text-lg md:text-3xl font-black italic uppercase tracking-tight text-center md:text-left ${awayWon ? "text-white" : "text-brand-text-muted"}`}>
                {featuredMatch.away_team?.name || "TBD"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Momentum message */}
      {momentum && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-yellow-500/5 border border-yellow-500/20 w-fit"
        >
          <Flame size={14} className="text-yellow-400 shrink-0" />
          <span className="text-[11px] font-bold text-yellow-300 uppercase tracking-wider">
            🔥 {momentum}
          </span>
        </motion.div>
      )}

      {/* Recent matches — horizontal scroll on mobile, grid on desktop */}
      {recentMatches.length > 0 && (
        <>
          <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-cyan/60 font-mono mb-4">
            Otros encuentros
          </div>

          {/* Horizontal scroll on mobile, 3-col grid on md+ */}
          <div className="flex gap-3 overflow-x-auto pb-3 md:pb-0 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible custom-scrollbar">
            {recentMatches.map((match, i) => {
              const mIsScheduled = match.status === "SCHEDULED";
              const mIsLive = match.status === "LIVE" || match.status === "IN_PLAY";
              const mIsFinished = match.status === "FINISHED";
              const mHomeScore = mIsScheduled ? null : match.home_score;
              const mAwayScore = mIsScheduled ? null : match.away_score;
              const mHomeWon = mHomeScore !== null && mAwayScore !== null && mHomeScore > mAwayScore;
              const mAwayWon = mHomeScore !== null && mAwayScore !== null && mAwayScore > mHomeScore;

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="card-match-feed w-[260px] md:w-auto"
                >
                  {/* Card header */}
                  <div className={`flex justify-between items-center px-4 py-2.5 border-b ${
                    mIsLive ? "border-red-500/20 bg-red-500/5" :
                    mIsFinished ? "border-emerald-500/10 bg-emerald-500/5" :
                    "border-brand-navy/50 bg-brand-navy/20"
                  }`}>
                    <span className="text-[9px] text-brand-text-muted font-mono tracking-widest">
                      {match.match_date ?? "Por definir"}
                    </span>
                    <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                      mIsFinished ? "text-emerald-400" :
                      mIsLive ? "text-red-400" :
                      "text-brand-cyan"
                    }`}>
                      {mIsLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-pulse" />}
                      {mIsFinished ? "FINAL" : mIsLive ? "VIVO" : "PROG."}
                    </span>
                  </div>

                  {/* Scores */}
                  <div className="flex flex-col gap-1.5 p-4">
                    {/* Home row */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SmallTeamLogo logoUrl={match.home_team?.logo_url} name={match.home_team?.name} />
                        <span className={`font-bold text-xs uppercase tracking-wider truncate ${mHomeWon ? "text-white" : "text-brand-text-muted"}`}>
                          {match.home_team?.name ?? "TBD"}
                        </span>
                      </div>
                      <span className={`font-black text-sm font-mono ml-2 ${mHomeWon ? "text-brand-cyan drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" : "text-brand-text-muted"}`}>
                        {mHomeScore !== null ? mHomeScore : "—"}
                      </span>
                    </div>

                    {/* Away row */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SmallTeamLogo logoUrl={match.away_team?.logo_url} name={match.away_team?.name} />
                        <span className={`font-bold text-xs uppercase tracking-wider truncate ${mAwayWon ? "text-white" : "text-brand-text-muted"}`}>
                          {match.away_team?.name ?? "TBD"}
                        </span>
                      </div>
                      <span className={`font-black text-sm font-mono ml-2 ${mAwayWon ? "text-brand-cyan drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" : "text-brand-text-muted"}`}>
                        {mAwayScore !== null ? mAwayScore : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="px-4 pb-3 border-t border-white/5">
                    <span className="text-[9px] text-brand-cyan/30 font-mono uppercase tracking-widest">
                      {stageLabel(match.stage, match.round_number)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
