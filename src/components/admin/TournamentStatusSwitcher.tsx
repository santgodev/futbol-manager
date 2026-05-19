"use client";

import { useState } from "react";
import { updateTournament } from "@/app/admin/actions";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function TournamentStatusSwitcher({ tournament }: { tournament: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await updateTournament(tournament.id, { status: newStatus });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleRegStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await updateTournament(tournament.id, { registration_status: newStatus });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 items-center bg-black/40 p-4 border border-brand-navy/30">
       <div className="flex flex-col gap-1">
         <span className="text-[8px] text-brand-aqua/50 uppercase tracking-widest font-bold">Estado del Torneo</span>
         <select 
           value={tournament.status}
           onChange={(e) => handleStatusChange(e.target.value)}
           disabled={loading}
           className="bg-brand-navy/30 border border-brand-navy/50 text-brand-sand text-[10px] px-2 py-2 uppercase tracking-widest outline-none focus:border-brand-teal"
         >
           <option value="PRÓXIMAMENTE">PRÓXIMAMENTE</option>
           <option value="EN CURSO">EN CURSO</option>
           <option value="FINALIZADO">FINALIZADO</option>
         </select>
       </div>

       <div className="flex flex-col gap-1">
         <span className="text-[8px] text-brand-aqua/50 uppercase tracking-widest font-bold">Inscripciones</span>
         <select 
           value={tournament.registration_status}
           onChange={(e) => handleRegStatusChange(e.target.value)}
           disabled={loading}
           className="bg-brand-navy/30 border border-brand-navy/50 text-brand-sand text-[10px] px-2 py-2 uppercase tracking-widest outline-none focus:border-brand-teal"
         >
           <option value="OPEN">ABIERTAS</option>
           <option value="CLOSED">CERRADAS</option>
         </select>
       </div>
       {loading && <Loader2 className="w-3 h-3 animate-spin text-brand-teal mt-4" />}
    </div>
  );
}
