"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  createGlobalPlayer, 
  addPlayerToTeamGlobally, 
  removePlayerFromTeamGlobally 
} from "@/app/admin/actions";
import { Plus, Trash2, Check, Loader2, Users, Search } from "lucide-react";

interface Player {
  id: string;
  name: string;
  team_id?: string | null;
}

interface GlobalRosterManagerProps {
  teamId: string;
  initialPlayers: Player[]; // Players belonging globally to this team
  unassignedPlayers: Player[]; // Players globally not belonging to any team
  onRosterChanged?: () => void;
}

export function GlobalRosterManager({ teamId, initialPlayers, unassignedPlayers, onRosterChanged }: GlobalRosterManagerProps) {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<"existing" | "new">("existing");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [loadingState, setLoadingState] = useState<"idle" | "adding" | "success">("idle");
  const [deletingStates, setDeletingStates] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegisterExisting = async () => {
    if (!selectedPlayerId) return;
    setErrorMsg(null);
    setLoadingState("adding");
    try {
      await addPlayerToTeamGlobally(selectedPlayerId, teamId);
      setLoadingState("success");
      setSelectedPlayerId("");
      setPlayerSearchQuery("");
      setTimeout(() => {
        setLoadingState("idle");
        router.refresh();
        onRosterChanged?.();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al fichar jugador");
      setLoadingState("idle");
    }
  };

  const handleRegisterNew = async () => {
    if (!newPlayerName || !newPlayerName.trim()) return;
    setErrorMsg(null);
    setLoadingState("adding");
    try {
      await createGlobalPlayer(newPlayerName.trim(), teamId);
      setLoadingState("success");
      setNewPlayerName("");
      setTimeout(() => {
        setLoadingState("idle");
        router.refresh();
        onRosterChanged?.();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al crear jugador");
      setLoadingState("idle");
    }
  };

  const handleRemove = async (playerId: string) => {
    if (!confirm("¿Seguro que quieres remover a este jugador de la plantilla global de este equipo?")) return;
    
    setDeletingStates(prev => ({ ...prev, [playerId]: true }));
    try {
      await removePlayerFromTeamGlobally(playerId, teamId);
      router.refresh();
      onRosterChanged?.();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingStates(prev => ({ ...prev, [playerId]: false }));
    }
  };

  // Filter unassigned global players based on search query
  const filteredAvailablePlayers = unassignedPlayers
    .filter((p) => p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()));

  const isAdding = loadingState === "adding";
  const isSuccess = loadingState === "success";

  return (
    <div className="panel-premium mb-12">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-gold via-brand-teal to-brand-sand" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-4 border-b border-brand-navy/20">
        <div>
          <span className="text-[9px] text-brand-gold font-black uppercase tracking-[0.3em] block mb-1">
            Plantilla Oficial
          </span>
          <h3 className="text-xl md:text-2xl font-black text-brand-sand uppercase tracking-tighter hero-title !not-italic">
            Jugadores del Club
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs bg-brand-navy/10 px-4 py-2 border border-brand-navy/20 text-brand-sand">
          <Users className="w-4 h-4 text-brand-gold" />
          <span className="font-bold uppercase tracking-widest text-[10px]">
            Total Club: {initialPlayers.length} Jugadores
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List of players - column span 7 */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <h4 className="text-[10px] text-brand-aqua/60 font-black uppercase tracking-widest mb-2">
            Nómina de Jugadores
          </h4>

          <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {initialPlayers.map((player) => {
              const isDeleting = deletingStates[player.id] || false;

              return (
                <div 
                  key={player.id} 
                  className="flex items-center justify-between p-4 bg-black/40 border border-brand-navy/20 hover:border-brand-teal/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-navy/20 flex items-center justify-center border border-brand-navy/30">
                      <span className="text-[10px] font-black text-brand-gold uppercase">
                        {player.name.slice(0, 2)}
                      </span>
                    </div>
                    <span className="font-bold text-xs md:text-sm uppercase tracking-wider text-brand-sand">
                      {player.name}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleRemove(player.id)}
                    disabled={isDeleting}
                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors disabled:opacity-50"
                    title="Remover del club"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })}

            {initialPlayers.length === 0 && (
              <div className="p-6 py-12 text-center border border-dashed border-brand-teal/30 bg-[#050b14]/50 rounded-xl">
                <Users className="w-8 h-8 text-brand-teal/40 mx-auto mb-4" />
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-black block leading-relaxed">
                  El club no tiene jugadores registrados.<br/>¡Añade algunos a continuación!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Add player form - column span 5 */}
        <div className="lg:col-span-5 bg-[#050b14]/60 border border-brand-teal/20 p-6 flex flex-col gap-6 rounded-2xl">
          <div className="flex border-b border-brand-navy/30">
            <button 
              onClick={() => setCurrentTab("existing")}
              className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-widest text-center transition-all ${
                currentTab === "existing" 
                  ? "border-b-2 border-brand-gold text-white" 
                  : "text-brand-aqua/40 hover:text-brand-sand"
              }`}
            >
              Fichar Existente
            </button>
            <button 
              onClick={() => setCurrentTab("new")}
              className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-widest text-center transition-all ${
                currentTab === "new" 
                  ? "border-b-2 border-brand-gold text-white" 
                  : "text-brand-aqua/40 hover:text-brand-sand"
              }`}
            >
              Fichar Nuevo
            </button>
          </div>

          {currentTab === "existing" ? (
            <div className="flex flex-col gap-4">
              <span className="text-[9px] text-brand-aqua/40 uppercase tracking-widest font-bold">
                Buscar jugador libre en el sistema
              </span>

              {/* Search bar inside select */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-brand-aqua/30" />
                <input 
                  type="text"
                  value={playerSearchQuery}
                  onChange={(e) => setPlayerSearchQuery(e.target.value)}
                  placeholder="Filtrar jugadores libres..."
                  className="input-premium !pl-10 !bg-[#001122]/80 !border-brand-teal/30 focus:!border-brand-teal"
                />
              </div>

              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="select-premium !bg-[#001122]/80 !border-brand-teal/30 focus:!border-brand-teal"
              >
                <option value="">Seleccionar Jugador...</option>
                {filteredAvailablePlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <button 
                onClick={handleRegisterExisting}
                disabled={!selectedPlayerId || isAdding}
                className="w-full btn-premium-gold mt-2"
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSuccess ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isAdding ? "Contratando..." : isSuccess ? "¡Fichado!" : "Fichar en el Equipo"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <span className="text-[9px] text-brand-aqua/40 uppercase tracking-widest font-bold">
                Dar de alta nuevo jugador
              </span>

              <input 
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Nombre completo del jugador"
                className="input-premium !bg-[#001122]/80 !border-brand-teal/30 focus:!border-brand-teal"
              />

              <button 
                onClick={handleRegisterNew}
                disabled={!newPlayerName.trim() || isAdding}
                className="w-full btn-premium-gold mt-2"
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSuccess ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isAdding ? "Creando..." : isSuccess ? "¡Creado y Fichado!" : "Registrar y Fichar"}
              </button>
            </div>
          )}

          {/* Error Display */}
          {errorMsg && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
              <span className="text-red-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
