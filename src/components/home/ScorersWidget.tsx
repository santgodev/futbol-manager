import { Medal, Goal } from "lucide-react";
import Image from "next/image";

export const ScorersWidget = ({ scorers = [] }: { scorers?: any[] }) => {
  return (
    <div className="glass-panel w-full p-5 flex flex-col h-full min-h-[410px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Medal className="text-brand-yellow" size={16} />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
            Goleadores
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 flex-1">
        {scorers.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[10px] uppercase tracking-widest text-white/30 font-bold">
            Aún no hay goleadores
          </div>
        ) : (
          scorers.map((scorer, idx) => {
            const isFirst = idx === 0;
            return (
              <div
                key={scorer.player_id}
                className={`relative flex items-center gap-2 p-2 rounded-lg border transition-all ${
                  isFirst
                    ? "bg-gradient-to-r from-brand-cyan/20 to-transparent border-brand-cyan/30"
                    : "bg-white/[0.02] border-white/5 hover:border-brand-cyan/20"
                }`}
              >
                {/* Pos */}
                <div className="w-4 text-center shrink-0">
                  <span
                    className={`text-xs font-bold ${
                      isFirst ? "text-brand-cyan" : "text-brand-text-muted"
                    }`}
                  >
                    {idx + 1}
                  </span>
                </div>

                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border overflow-hidden ${
                    isFirst
                      ? "border-brand-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)] bg-black/50"
                      : "border-brand-cyan/20 bg-brand-navy"
                  }`}
                >
                  {scorer.photo_url ? (
                    <Image src={scorer.photo_url} alt={scorer.player_name} width={32} height={32} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <span className="text-[10px] text-brand-cyan font-bold">{scorer.number || '-'}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <span
                    className={`text-xs font-bold truncate uppercase tracking-wide ${
                      isFirst ? "text-white" : "text-brand-text-muted"
                    }`}
                  >
                    {scorer.player_name}
                  </span>
                  <span className="text-[9px] text-brand-text-muted font-medium truncate uppercase tracking-wide">
                    {scorer.team_name}
                  </span>
                </div>

                {/* Goals */}
                <div className="flex items-center gap-1 px-2 py-1 bg-black/30 rounded-md border border-white/5 shrink-0">
                  <span className={`text-base font-black font-mono ${isFirst ? "text-brand-cyan drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]" : "text-white"}`}>
                    {scorer.goals}
                  </span>
                  <Goal size={12} className={isFirst ? "text-brand-cyan" : "text-white/30"} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
