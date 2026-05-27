interface CardEvent {
  type: "YELLOW_CARD" | "RED_CARD";
  minute?: number | null;
  player?: { name: string; number?: number | null } | null;
  team?: { name: string } | null;
}

interface CardsStatsWidgetProps {
  yellowCards?: number;
  redCards?: number;
  cardEvents?: CardEvent[];
}

export const CardsStatsWidget = ({
  yellowCards = 0,
  redCards = 0,
  cardEvents = [],
}: CardsStatsWidgetProps) => {
  const hasData = cardEvents.length > 0;

  const yellows = cardEvents.filter((e) => e.type === "YELLOW_CARD");
  const reds = cardEvents.filter((e) => e.type === "RED_CARD");

  return (
    <div className="panel-premium w-full p-4 md:p-5 flex flex-col h-full relative overflow-hidden">
      {/* Top glow */}
      <div className="absolute top-0 left-0 w-1/2 h-[30px] bg-brand-yellow/10 blur-[30px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-[30px] bg-brand-red/10 blur-[30px] pointer-events-none" />

      {/* Header with totals */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
          Tarjetas
        </h3>
        <div className="flex items-center gap-2">
          {/* Yellow total badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-yellow/10 border border-brand-yellow/20 rounded-lg">
            <div className="w-2.5 h-3.5 bg-brand-yellow rounded-[2px] shadow-[0_0_6px_rgba(255,215,0,0.6)]" />
            <span className="text-xs font-black text-brand-yellow">{yellowCards}</span>
          </div>
          {/* Red total badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-red/10 border border-brand-red/20 rounded-lg">
            <div className="w-2.5 h-3.5 bg-brand-red rounded-[2px] shadow-[0_0_6px_rgba(255,51,51,0.6)]" />
            <span className="text-xs font-black text-brand-red">{redCards}</span>
          </div>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 flex flex-col gap-1.5 relative z-10 overflow-y-auto">
        {!hasData ? (
          <div className="flex-1 flex items-center justify-center text-[9px] uppercase tracking-widest text-brand-aqua/50 font-bold border border-dashed border-brand-navy/50 rounded-xl py-4 text-center">
            Sin tarjetas registradas
          </div>
        ) : (
          <>
            {/* Sub-header: separates totals from timeline */}
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-aqua/40 mb-1">
              Eventos recientes
            </span>
            {/* Yellow cards */}
            {yellows.map((event, i) => (
              <div
                key={`y-${i}`}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#02060d]/80 border border-brand-navy/40 hover:border-brand-yellow/30 transition-colors group"
              >
                <div className="w-2.5 h-3.5 bg-brand-yellow rounded-[2px] shadow-[0_0_5px_rgba(255,215,0,0.5)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-white truncate block">
                    {event.player?.name || "Jugador"}
                  </span>
                  <span className="text-[9px] text-brand-aqua/50 uppercase tracking-wider truncate block">
                    {event.team?.name || "—"}
                    {event.player?.number ? ` · #${event.player.number}` : ""}
                  </span>
                </div>
                {event.minute && (
                  <span className="text-[9px] font-mono text-brand-yellow/60 shrink-0">
                    {event.minute}&apos;
                  </span>
                )}
              </div>
            ))}

            {/* Red cards */}
            {reds.map((event, i) => (
              <div
                key={`r-${i}`}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#02060d]/80 border border-brand-navy/40 hover:border-brand-red/30 transition-colors group"
              >
                <div className="w-2.5 h-3.5 bg-brand-red rounded-[2px] shadow-[0_0_5px_rgba(255,51,51,0.5)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-white truncate block">
                    {event.player?.name || "Jugador"}
                  </span>
                  <span className="text-[9px] text-brand-aqua/50 uppercase tracking-wider truncate block">
                    {event.team?.name || "—"}
                    {event.player?.number ? ` · #${event.player.number}` : ""}
                  </span>
                </div>
                {event.minute && (
                  <span className="text-[9px] font-mono text-brand-red/60 shrink-0">
                    {event.minute}&apos;
                  </span>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
