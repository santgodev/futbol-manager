"use client";

import { X, CheckCircle, Clock, Goal, AlertTriangle } from "lucide-react";

interface FinalizeMatchModalProps {
  isKnockout: boolean;
  isTied: boolean;
  onConfirm: () => void;
  onExtraTime: () => void;
  onPenalties: () => void;
  onClose: () => void;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
}

export function FinalizeMatchModal({
  isKnockout,
  isTied,
  onConfirm,
  onExtraTime,
  onPenalties,
  onClose,
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore
}: FinalizeMatchModalProps) {
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#040c1a] border border-red-500/50 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(255,0,0,0.2)] relative overflow-hidden flex flex-col">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-[50px]" />
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-red-500/20 relative z-10">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
              Finalizar Partido
            </h2>
            <p className="text-xs text-red-400/70 font-mono mt-1">ACCION IRREVERSIBLE</p>
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
          
          <div className="flex items-center justify-center gap-8 bg-[#001122]/50 p-6 rounded-xl border border-[#0055cc]/30">
            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest text-center truncate w-full">
                {homeTeamName}
              </span>
              <span className="text-4xl font-black text-white tabular-nums">{homeScore}</span>
            </div>
            <span className="text-2xl font-black text-[#00f0ff]/30">-</span>
            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest text-center truncate w-full">
                {awayTeamName}
              </span>
              <span className="text-4xl font-black text-white tabular-nums">{awayScore}</span>
            </div>
          </div>

          <div className="text-center">
            {isKnockout && isTied ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex flex-col items-center gap-3 shadow-[inset_0_0_20px_rgba(234,179,8,0.05)]">
                <AlertTriangle className="text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" size={32} />
                <p className="text-sm text-yellow-100 font-bold uppercase tracking-widest">Empate Eliminatorio</p>
                <p className="text-xs text-yellow-400/80 leading-relaxed px-2">
                  Debes definir un ganador. Elige si quieres continuar jugando (Tiempo Extra) o pasar directamente a la Tanda de Penales.
                </p>
              </div>
            ) : (
              <p className="text-sm text-white/70">
                ¿Estás seguro de finalizar el partido? Esto calculará los puntos y cerrará el evento oficialmente.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {isKnockout && isTied ? (
              <>
                <button 
                  onClick={onPenalties}
                  className="w-full h-12 rounded-xl bg-[#00f0ff]/20 border border-[#00f0ff]/50 hover:bg-[#00f0ff] hover:text-black text-[#00f0ff] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]"
                >
                  <Goal size={16} /> Ir a Tanda de Penales
                </button>
                <button 
                  onClick={onExtraTime}
                  className="w-full h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500 hover:text-black text-yellow-400 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.5)]"
                >
                  <Clock size={16} /> Seguir Jugando (Tiempo Extra)
                </button>
                <button 
                  onClick={onClose}
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs transition-all mt-2"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={onClose}
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={onConfirm}
                  className="w-full h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black text-emerald-400 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                >
                  <CheckCircle size={16} /> Finalizar
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
