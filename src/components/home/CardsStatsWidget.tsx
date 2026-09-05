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
    <div className="w-full p-6 flex flex-col h-full relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">

      {/* Header with totals */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800">
          Tarjetas
        </h3>
        <div className="flex items-center gap-2">
          {/* Yellow total badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-100 rounded-full shadow-sm">
            <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm" />
            <span className="text-xs font-bold text-yellow-600">{yellowCards}</span>
          </div>
          {/* Red total badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full shadow-sm">
            <div className="w-2.5 h-3.5 bg-red-500 rounded-sm" />
            <span className="text-xs font-bold text-red-600">{redCards}</span>
          </div>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 flex flex-col gap-2 relative z-10 overflow-y-auto">
        {!hasData ? (
          <div className="flex-1 flex items-center justify-center text-[10px] uppercase tracking-widest text-slate-400 font-bold border border-dashed border-slate-200 rounded-2xl py-4 text-center">
            Sin tarjetas registradas
          </div>
        ) : (
          <>
            {/* Sub-header: separates totals from timeline */}
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-2">
              Eventos recientes
            </span>
            {/* Yellow cards */}
            {yellows.map((event, i) => (
              <div
                key={`y-${i}`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-3 h-4 bg-yellow-400 rounded-sm shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-700 truncate block">
                    {event.player?.name || "Jugador"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate block">
                    {event.team?.name || "—"}
                    {event.player?.number ? ` · #${event.player.number}` : ""}
                  </span>
                </div>
                {event.minute && (
                  <span className="text-xs font-black text-indigo-600 font-mono shrink-0">
                    {event.minute}&apos;
                  </span>
                )}
              </div>
            ))}

            {/* Red cards */}
            {reds.map((event, i) => (
              <div
                key={`r-${i}`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-3 h-4 bg-red-500 rounded-sm shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-700 truncate block">
                    {event.player?.name || "Jugador"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate block">
                    {event.team?.name || "—"}
                    {event.player?.number ? ` · #${event.player.number}` : ""}
                  </span>
                </div>
                {event.minute && (
                  <span className="text-xs font-black text-indigo-600 font-mono shrink-0">
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
