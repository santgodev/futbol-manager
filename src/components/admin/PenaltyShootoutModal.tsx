"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { updateMatchScore } from "@/app/admin/actions";
import { useRouter } from "next/navigation";

interface PenaltyShootoutModalProps {
  matchId: string;
  tournamentId: string;
  homeTeamName: string;
  awayTeamName: string;
  currentHomeScore: number;
  currentAwayScore: number;
  currentHomePenalties: number | null;
  currentAwayPenalties: number | null;
  currentVersion: number;
  onClose: () => void;
}

export function PenaltyShootoutModal({
  matchId,
  tournamentId,
  homeTeamName,
  awayTeamName,
  currentHomeScore,
  currentAwayScore,
  currentHomePenalties,
  currentAwayPenalties,
  currentVersion,
  onClose
}: PenaltyShootoutModalProps) {
  const [homePenalties, setHomePenalties] = useState(currentHomePenalties || 0);
  const [awayPenalties, setAwayPenalties] = useState(currentAwayPenalties || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    
    try {
      await updateMatchScore(
        matchId,
        currentHomeScore,
        currentAwayScore,
        tournamentId,
        currentVersion,
        homePenalties,
        awayPenalties,
        'FINISHED' // Se asume que registrar penales finaliza el partido.
      );
      
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al registrar la tanda de penales.");
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-24 text-center bg-[#02060d] border border-[#00f0ff]/30 text-white text-3xl font-black py-4 rounded-xl outline-none focus:border-[#00f0ff] focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#040c1a] border border-[#0055cc]/50 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,102,204,0.3)] relative overflow-hidden flex flex-col">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00f0ff]/10 rounded-full blur-[50px]" />
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#0055cc]/30 relative z-10">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest">Tanda de Penales</h2>
            <p className="text-xs text-[#00f0ff]/70 font-mono mt-1">REGISTRAR RESULTADO FINAL</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white/50 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 relative z-10 flex flex-col gap-8">
          
          <div className="flex items-center justify-between gap-4">
            {/* Home */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest text-center truncate w-full">
                {homeTeamName}
              </span>
              <input
                type="number"
                min="0"
                value={homePenalties}
                onChange={(e) => setHomePenalties(parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            
            <div className="text-[#00f0ff]/50 font-black text-2xl pb-2">-</div>
            
            {/* Away */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest text-center truncate w-full">
                {awayTeamName}
              </span>
              <input
                type="number"
                min="0"
                value={awayPenalties}
                onChange={(e) => setAwayPenalties(parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold text-white/70 bg-white/5 hover:bg-white/10 rounded-lg uppercase tracking-widest transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 text-xs font-bold text-[#02060d] bg-[#00f0ff] hover:bg-white hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] rounded-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Finalizar Partido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
