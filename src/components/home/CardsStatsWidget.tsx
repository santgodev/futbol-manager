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
    <div className="w-full p-5 flex flex-col h-full relative overflow-hidden rounded-xl bg-[#1A1D24] border border-[#2D3342] shadow-xl">

      {/* Header with totals */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">
          Tarjetas
        </h3>
        <div className="flex items-center gap-2">
          {/* Yellow total badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#222732] border border-[#2D3342] rounded-lg">
            <div className="w-2.5 h-3.5 bg-[#eab308] rounded-[2px]" />
            <span className="text-xs font-bold text-slate-300">{yellowCards}</span>
          </div>
          {/* Red total badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#222732] border border-[#2D3342] rounded-lg">
            <div className="w-2.5 h-3.5 bg-[#ef4444] rounded-[2px]" />
            <span className="text-xs font-bold text-slate-300">{redCards}</span>
          </div>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 flex flex-col gap-1.5 relative z-10 overflow-y-auto">
        {!hasData ? (
          <div className="flex-1 flex items-center justify-center text-[10px] uppercase tracking-widest text-slate-500 font-bold border border-dashed border-[#2D3342] rounded-xl py-4 text-center">
            Sin tarjetas registradas
          </div>
        ) : (
          <>
            {/* Sub-header: separates totals from timeline */}
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              Eventos recientes
            </span>
            {/* Yellow cards */}
            {yellows.map((event, i) => (
              <div
                key={`y-${i}`}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#151921] border border-[#2D3342] hover:bg-[#222732] transition-colors group"
              >
                <div className="w-2.5 h-3.5 bg-[#eab308] rounded-[2px] shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-slate-200 truncate block">
                    {event.player?.name || "Jugador"}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest truncate block">
                    {event.team?.name || "—"}
                    {event.player?.number ? ` · #${event.player.number}` : ""}
                  </span>
                </div>
                {event.minute && (
                  <span className="text-[9px] font-mono text-slate-400 shrink-0">
                    {event.minute}&apos;
                  </span>
                )}
              </div>
            ))}

            {/* Red cards */}
            {reds.map((event, i) => (
              <div
                key={`r-${i}`}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#151921] border border-[#2D3342] hover:bg-[#222732] transition-colors group"
              >
                <div className="w-2.5 h-3.5 bg-[#ef4444] rounded-[2px] shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-slate-200 truncate block">
                    {event.player?.name || "Jugador"}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest truncate block">
                    {event.team?.name || "—"}
                    {event.player?.number ? ` · #${event.player.number}` : ""}
                  </span>
                </div>
                {event.minute && (
                  <span className="text-[9px] font-mono text-slate-400 shrink-0">
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
