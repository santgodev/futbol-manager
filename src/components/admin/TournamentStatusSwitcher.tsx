"use client";

import { useState } from "react";
import { updateTournament } from "@/app/admin/actions";
import { Loader2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const selectClass = "bg-[#040c1a]/80 border border-[#0055cc]/50 focus:border-[#00f0ff] px-3 py-2 text-white text-xs rounded-lg outline-none transition-all appearance-none cursor-pointer pr-8";

export function TournamentStatusSwitcher({ tournament, isDisabled = false, onUpdate }: { tournament: any, isDisabled?: boolean, onUpdate?: () => void }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = async (field: string, value: string) => {
    setLoading(true);
    try {
      await updateTournament(tournament.id, { [field]: value });
      if (onUpdate) onUpdate();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {loading && <Loader2 className="w-3 h-3 animate-spin text-[#00f0ff]" />}

      <div className="relative flex flex-col gap-1">
        <label className="text-[9px] text-[#00f0ff]/50 uppercase tracking-widest font-bold">Estado</label>
        <div className="relative">
          <select
            value={tournament.status}
            onChange={(e) => update("status", e.target.value)}
            disabled={loading || isDisabled}
            className={`${selectClass} ${isDisabled ? 'opacity-40 cursor-not-allowed border-red-500/30 text-white/40' : ''}`}
            title={isDisabled ? "Bloqueado por inconsistencias críticas de integridad" : ""}
          >
            <option value="PRÓXIMAMENTE"        className="bg-[#040c1a]">Próximamente</option>
            <option value="INSCRIPCIONES ABIERTAS" className="bg-[#040c1a]">Inscripciones</option>
            <option value="EN CURSO"            className="bg-[#040c1a]">En Curso</option>
            <option value="FINALIZADO"          className="bg-[#040c1a]">Finalizado</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00f0ff]/50 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
