import { X, Trophy, AlertCircle, Calendar } from "lucide-react";

interface PublicTeamModalProps {
  teamId: string;
  standings: any[];
  matches: any[];
  onClose: () => void;
}

export function PublicTeamModal({ teamId, standings, matches, onClose }: PublicTeamModalProps) {
  const teamStanding = standings.find((s) => s.team_id === teamId);
  const teamMatches = matches.filter((m) => m.home_team_id === teamId || m.away_team_id === teamId);
  
  // Extract all goal events for this team from all matches
  const goals: any[] = [];
  teamMatches.forEach((m) => {
    if (m.match_events) {
      m.match_events.forEach((ev: any) => {
        if (ev.team_id === teamId && ev.type === "GOAL" && ev.player) {
          goals.push({
            playerName: ev.player.name,
            matchDate: m.match_date
          });
        }
      });
    }
  });

  const topScorers = Object.entries(
    goals.reduce((acc, curr) => {
      acc[curr.playerName] = (acc[curr.playerName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  if (!teamStanding) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#030b17] border border-[#0055cc]/30 w-full max-w-xl max-h-[90vh] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,85,204,0.3)] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative p-6 md:p-8 bg-gradient-to-br from-[#001122] to-black border-b border-[#0055cc]/20 flex flex-col sm:flex-row items-center gap-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>

          {teamStanding.logo_url ? (
            <img src={teamStanding.logo_url} alt={teamStanding.team_name} className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-2xl bg-black/40 border border-white/5 p-2 shadow-2xl" />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#0055cc]/20 to-transparent border border-white/10 flex items-center justify-center text-3xl font-black text-white shadow-2xl shrink-0">
              {teamStanding.team_name.substring(0, 2).toUpperCase()}
            </div>
          )}

          <div className="text-center sm:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider leading-tight">
              {teamStanding.team_name}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
                Grupo {teamStanding.group_name || "-"}
              </span>
              <span className="text-xs text-white/40 font-mono">
                {teamStanding.points} Pts
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* Stats Grid */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 border-b border-white/5 pb-2">Estadísticas</h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1 font-semibold">PJ</div>
                <div className="text-xl font-black text-white font-mono">{teamStanding.played}</div>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
                <div className="text-xs text-emerald-500/60 uppercase tracking-wider mb-1 font-semibold">G</div>
                <div className="text-xl font-black text-emerald-400 font-mono">{teamStanding.won}</div>
              </div>
              <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
                <div className="text-xs text-amber-500/60 uppercase tracking-wider mb-1 font-semibold">E</div>
                <div className="text-xl font-black text-amber-400 font-mono">{teamStanding.drawn}</div>
              </div>
              <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
                <div className="text-xs text-red-500/60 uppercase tracking-wider mb-1 font-semibold">P</div>
                <div className="text-xl font-black text-red-400 font-mono">{teamStanding.lost}</div>
              </div>
            </div>
          </div>

          {/* Goleadores */}
          {topScorers.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 border-b border-white/5 pb-2 flex items-center gap-2">
                <Trophy size={12} className="text-[#00f0ff]" />
                Top Goleadores
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {topScorers.slice(0, 6).map(([name, count], idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-sm font-bold text-white truncate pr-2">{name}</span>
                    <span className="text-[#00f0ff] font-black font-mono text-lg">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matches */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 border-b border-white/5 pb-2 flex items-center gap-2">
              <Calendar size={12} className="text-purple-400" />
              Últimos Partidos
            </h3>
            {teamMatches.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-4 font-mono uppercase">Sin partidos registrados</p>
            ) : (
              <div className="space-y-2">
                {teamMatches.slice(0, 5).map((m) => {
                  const isHome = m.home_team_id === teamId;
                  const opponent = isHome ? m.away_team : m.home_team;
                  const myScore = isHome ? m.home_score : m.away_score;
                  const opScore = isHome ? m.away_score : m.home_score;
                  
                  let resultClass = "text-white/40";
                  let resultIcon = "-";
                  if (m.status === "FINISHED" && myScore !== null && opScore !== null) {
                    if (myScore > opScore) { resultClass = "text-emerald-400 bg-emerald-500/10"; resultIcon = "V"; }
                    else if (myScore < opScore) { resultClass = "text-red-400 bg-red-500/10"; resultIcon = "D"; }
                    else { resultClass = "text-amber-400 bg-amber-500/10"; resultIcon = "E"; }
                  }

                  return (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${resultClass}`}>
                        {resultIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{opponent?.name || "Rival por definir"}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest">{m.match_date || "Sin fecha"} • {m.stage}</div>
                      </div>
                      <div className="text-base font-black font-mono text-white tracking-widest shrink-0">
                        {myScore !== null ? `${myScore} - ${opScore}` : "vs"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
