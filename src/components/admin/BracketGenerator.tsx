"use client";

import { useState } from "react";
import { generateKnockoutBracket } from "@/app/admin/actions";
import { Trophy, Shield, Loader2, AlertTriangle, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface BracketGeneratorProps {
  tournamentId: string;
  isGroupStageComplete: boolean;
  pendingGroupMatchesCount: number;
  registeredTeamsCount: number;
  matchesPlayed: number;
}

export function BracketGenerator({ 
  tournamentId,
  isGroupStageComplete,
  pendingGroupMatchesCount,
  registeredTeamsCount,
  matchesPlayed
}: BracketGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Calculate valid bracket sizes dynamically based on how many teams are in the tournament
  const availableOptions = [2, 4, 8].filter(num => num <= registeredTeamsCount);
  const [teamsCount, setTeamsCount] = useState<2 | 4 | 8>((availableOptions.includes(4) ? 4 : (availableOptions[0] || 2)) as 2 | 4 | 8);
  const router = useRouter();

  const handleGenerate = async () => {
    setStatus("generating");
    setErrorMessage("");
    try {
      await generateKnockoutBracket(tournamentId, teamsCount);
      setStatus("success");
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Error al generar bracket");
    }
  };

  const getPreviewText = () => {
    switch (teamsCount) {
      case 2: return "Se creará directamente la FINAL (1º vs 2º).";
      case 4: return "Se crearán 2 SEMIFINALES (1º vs 4º y 2º vs 3º) y la FINAL vacía.";
      case 8: return "Se crearán 4 CUARTOS DE FINAL, 2 SEMIFINALES vacías y la FINAL vacía.";
    }
  };

  if (!isGroupStageComplete) {
    const requiredGroupMatches = registeredTeamsCount >= 2 ? (registeredTeamsCount * (registeredTeamsCount - 1)) / 2 : 0;
    const progressPercentage = requiredGroupMatches > 0 
      ? Math.min(100, Math.round((matchesPlayed / requiredGroupMatches) * 100))
      : 0;

    return (
      <div className="flex flex-col items-center justify-center p-8 py-12 bg-[#050b14]/80 border border-amber-500/20 rounded-2xl relative overflow-hidden text-center shadow-inner">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/30">
          <AlertTriangle className="w-6 h-6 text-amber-500 animate-pulse" />
        </div>
        
        <h3 className="text-md font-black text-white uppercase tracking-widest mb-1">Eliminatorias Bloqueadas</h3>
        <span className="text-[9px] text-amber-500/80 uppercase tracking-widest font-black mb-3">Fase de Grupos en Curso</span>
        
        <p className="text-white/50 text-xs max-w-md mb-6 leading-relaxed">
          Se han completado <strong className="text-white font-mono">{matchesPlayed}</strong> de los <strong className="text-white font-mono">{requiredGroupMatches}</strong> partidos de grupos requeridos (todos contra todos para {registeredTeamsCount} equipos). Debes finalizar todos los enfrentamientos para calcular la clasificación deportiva y habilitar los cruces de playoffs.
        </p>

        <div className="flex items-center gap-3 bg-black/40 border border-white/5 px-4 py-2 rounded-xl text-[10px] text-brand-teal font-mono font-bold mb-6">
          <span>Progreso de Grupos:</span>
          <span className="text-white bg-brand-teal/20 px-2 py-0.5 rounded">{progressPercentage}%</span>
        </div>

        <button 
          disabled
          className="bg-white/5 border border-white/10 text-white/30 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] rounded-lg cursor-not-allowed flex items-center gap-2 hover:bg-white/5 transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
          title="Completa todos los partidos de la fase de grupos para habilitar"
        >
          Generar Eliminatorias 🔒
        </button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-b from-[#001122] to-transparent border border-[#00f0ff]/20 rounded-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[#00f0ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="w-16 h-16 rounded-full bg-[#00f0ff]/10 flex items-center justify-center mb-4 border border-[#00f0ff]/30 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <Trophy className="w-8 h-8 text-[#00f0ff]" />
        </div>
        
        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Fase Eliminatoria</h3>
        <p className="text-[#00f0ff]/60 text-sm mb-8 max-w-md text-center font-bold">
          Genera el árbol de eliminación directa basado en los resultados de la Fase de Grupos.
        </p>

        <button 
          onClick={() => setIsOpen(true)}
          className="bg-transparent border-2 border-[#00f0ff] text-[#00f0ff] px-8 py-3 font-black uppercase tracking-[0.2em] hover:bg-[#00f0ff] hover:text-[#00050a] transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
        >
          Configurar Bracket
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#000810] border border-[#00f0ff] rounded-xl relative shadow-[0_0_50px_rgba(0,240,255,0.15)] animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Banner */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-[#00f0ff] font-black text-2xl uppercase tracking-tighter flex items-center gap-3">
            <Trophy className="w-6 h-6" />
            Configuración de Eliminatorias
          </h2>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-bold">
            Selecciona cuántos equipos avanzan
          </p>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-[#00f0ff]/50 hover:text-white uppercase tracking-widest text-xs font-bold"
        >
          Cancelar ×
        </button>
      </div>

      {/* Selector */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {availableOptions.map((num) => (
          <button
            key={num}
            onClick={() => setTeamsCount(num as 2|4|8)}
            className={`p-4 border flex flex-col items-center justify-center gap-2 transition-all ${
              teamsCount === num 
                ? 'bg-[#00f0ff]/10 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                : 'bg-white/5 border-white/10 hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/5'
            }`}
          >
            <span className={`text-3xl font-black ${teamsCount === num ? 'text-[#00f0ff]' : 'text-white/50'}`}>
              {num}
            </span>
            <span className={`text-[10px] uppercase tracking-widest font-bold ${teamsCount === num ? 'text-white' : 'text-white/40'}`}>
              Equipos
            </span>
          </button>
        ))}
      </div>

      {/* Preview Info */}
      <div className="bg-[#001122] border border-[#0055cc]/30 p-6 mb-8 flex gap-4">
        <Shield className="w-6 h-6 text-[#00f0ff] shrink-0" />
        <div>
          <h4 className="text-white text-sm font-black uppercase tracking-widest mb-1">Previsualización</h4>
          <p className="text-[#00f0ff]/80 text-sm">{getPreviewText()}</p>
          <p className="text-white/40 text-xs mt-2 uppercase tracking-widest">
            Nota: Se tomarán los {teamsCount} primeros lugares de la tabla de posiciones actual.
          </p>
        </div>
      </div>

      {status === 'error' && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 flex gap-3 text-red-500 text-sm font-bold">
          <AlertTriangle className="w-5 h-5 shrink-0" /> 
          {errorMessage}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleGenerate}
        disabled={status === 'generating' || status === 'success'}
        className="w-full bg-[#00f0ff] text-[#00050a] py-4 text-sm font-black uppercase tracking-[0.2em] hover:bg-white hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,240,255,0.3)]"
      >
        {status === 'generating' && <Loader2 className="w-5 h-5 animate-spin" />}
        {status === 'success' && <Trophy className="w-5 h-5" />}
        {status === 'idle' && 'Generar Eliminatorias'}
        {status === 'generating' && 'Calculando Cruces...'}
        {status === 'success' && '¡Bracket Generado!'}
      </button>

    </div>
  );
}
