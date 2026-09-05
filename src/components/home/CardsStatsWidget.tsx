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
    <div className="w-full p-6 flex flex-col h-full relative overflow-hidden rounded-[2rem] bg-[#02457A]/40 backdrop-blur-xl border border-[#018ABE]/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">

      {/* Header with totals */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white">
          Tarjetas
        </h3>
        <div className="flex items-center gap-2">
          {/* Yellow total badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#001B48] border border-[#018ABE]/30 rounded-full shadow-sm">
            <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm" />
            <span className="text-xs font-bold text-[#D6E8EE]">{yellowCards}</span>
          </div>
          {/* Red total badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#001B48] border border-[#018ABE]/30 rounded-full shadow-sm">
            <div className="w-2.5 h-3.5 bg-red-500 rounded-sm" />
            <span className="text-xs font-bold text-[#D6E8EE]">{redCards}</span>
          </div>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 flex flex-col gap-2 relative z-10 overflow-y-auto">
        {!hasData ? (
          <div className="flex-1 flex items-center justify-center text-[10px] uppercase tracking-widest text-[#97CADB]/60 font-bold border border-dashed border-[#018ABE]/30 rounded-[1.5rem] py-4 text-center">
            Sin tarjetas registradas
          </div>
        ) : (
          <>
            {/* Sub-header: separates totals from timeline */}
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#97CADB] mb-2 px-2">
              Eventos recientes
            </span>
            {/* Yellow cards */}
            {yellows.map((event, i) => (
              <div
                key={`y-${i}`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-[#018ABE]/20 bg-[#02457A]/80 hover:bg-[#001B48] hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-3 h-4 bg-yellow-400 rounded-sm shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#D6E8EE] truncate block group-hover:text-white transition-colors">
                    {event.player?.name || "Jugador"}
                  </span>
                  <span className="text-[10px] text-[#97CADB] font-bold uppercase tracking-widest truncate block">
                    {event.team?.name || "—"}
                    {event.player?.number ? ` · #${event.player.number}` : ""}
                  </span>
                </div>
                {event.minute && (
                  <span className="text-xs font-black text-[#018ABE] font-mono shrink-0 group-hover:text-white transition-colors">
                    {event.minute}&apos;
                  </span>
                )}
              </div>
            ))}

            {/* Red cards */}
            {reds.map((event, i) => (
              <div
                key={`r-${i}`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-[#018ABE]/20 bg-[#02457A]/80 hover:bg-[#001B48] hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-3 h-4 bg-red-500 rounded-sm shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#D6E8EE] truncate block group-hover:text-white transition-colors">
                    {event.player?.name || "Jugador"}
                  </span>
                  <span className="text-[10px] text-[#97CADB] font-bold uppercase tracking-widest truncate block">
                    {event.team?.name || "—"}
                    {event.player?.number ? ` · #${event.player.number}` : ""}
                  </span>
                </div>
                {event.minute && (
                  <span className="text-xs font-black text-[#018ABE] font-mono shrink-0 group-hover:text-white transition-colors">
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
