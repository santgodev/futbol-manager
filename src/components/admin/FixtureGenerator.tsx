"use client";

import { useState } from "react";
import { generateRoundRobinFixture } from "@/app/admin/actions";
import { Loader2, Wand2, X, AlertTriangle } from "lucide-react";

export function FixtureGenerator({
  tournamentId,
  teamsCount,
  hasGroupMatches,
  onUpdate
}: {
  tournamentId: string;
  teamsCount: number;
  hasGroupMatches: boolean;
  onUpdate?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const numTeams = teamsCount;
  const isOdd = numTeams % 2 !== 0;
  const virtualTeams = isOdd ? numTeams + 1 : numTeams;
  const numRounds = virtualTeams - 1;
  const matchesPerRound = virtualTeams / 2;
  const totalMatchesToGenerate = numRounds * (isOdd ? matchesPerRound - 1 : matchesPerRound);

  const canGenerate = teamsCount >= 3 && !hasGroupMatches;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setErrorMsg("");
    try {
      await generateRoundRobinFixture(tournamentId);
      if (onUpdate) onUpdate();
      setIsOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al generar el fixture.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={!canGenerate}
        className={`w-full h-full min-h-[44px] flex items-center justify-center gap-2 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all
          ${canGenerate 
            ? "bg-gradient-to-r from-[#00f0ff]/10 to-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 hover:bg-[#00f0ff]/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]" 
            : "bg-white/5 text-white/30 cursor-not-allowed"
          }
        `}
      >
        <Wand2 size={16} />
        {hasGroupMatches ? "Fixture Ya Creado" : "Generar Fixture Automático"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-[#02060d] border border-[#00f0ff]/50 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(0,240,255,0.2)] relative flex flex-col">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent rounded-t-2xl z-10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#00f0ff]/20 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="flex justify-between items-center p-6 border-b border-[#00f0ff]/20 relative z-10 shrink-0">
              <div className="flex flex-col">
                <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Wand2 size={18} className="text-[#00f0ff]" />
                  Fixture Inteligente
                </h2>
                <p className="text-[10px] text-[#00f0ff]/70 font-mono mt-1 tracking-widest">
                  ALGORITMO ROUND-ROBIN
                </p>
              </div>
              <button 
                onClick={() => !loading && setIsOpen(false)}
                className="text-white/50 hover:text-white p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 relative z-10 flex flex-col gap-6">
              
              <div className="bg-[#001122] border border-[#0055cc]/30 rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em] text-center">
                  Resumen de Generación
                </h3>
                
                <div className="grid grid-cols-3 gap-2 text-center divide-x divide-[#0055cc]/30">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-white">{numTeams}</span>
                    <span className="text-[9px] text-[#00f0ff] uppercase tracking-widest mt-1">Equipos</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-white">{numRounds}</span>
                    <span className="text-[9px] text-[#00f0ff] uppercase tracking-widest mt-1">Jornadas</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-white">{totalMatchesToGenerate}</span>
                    <span className="text-[9px] text-[#00f0ff] uppercase tracking-widest mt-1">Partidos</span>
                  </div>
                </div>
              </div>

              {hasGroupMatches && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    <strong>BLOQUEO DE SEGURIDAD:</strong> Ya existen partidos de fase de grupos en este torneo. 
                    El generador está deshabilitado para evitar duplicar el calendario.
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-center">
                  {errorMsg}
                </div>
              )}

              <p className="text-[10px] text-white/40 text-center uppercase tracking-widest leading-relaxed">
                Los partidos se crearán con fecha y hora vacía para que puedas agendarlos en el editor de marcadores.
              </p>

              <button
                onClick={handleGenerate}
                disabled={loading || !canGenerate}
                className="w-full h-12 bg-[#00f0ff] hover:bg-white text-[#02060d] rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generando...
                  </>
                ) : (
                  "Confirmar Generación"
                )}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </>
  );
}
