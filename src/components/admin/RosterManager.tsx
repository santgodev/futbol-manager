"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  createAndRegisterPlayer, 
  addPlayerToTournamentTeam, 
  removePlayerFromTournamentTeam,
  updatePlayerGoals 
} from "@/app/admin/actions";
import { Plus, Trash2, Check, Loader2, Award, Users, Search, Activity } from "lucide-react";

interface Player {
  id: string;
  name: string;
}

interface TournamentPlayer {
  tournament_id: string;
  player_id: string;
  goals: number | null;
  player: Player | null;
  tournament: {
    id: string;
    name: string;
  } | null;
}

interface RosterManagerProps {
  teamId: string;
  tournaments: any[]; // Array of tournaments team belongs to
  initialPlayers: TournamentPlayer[];
  globalPlayers: Player[];
}

export function RosterManager({ teamId, tournaments, initialPlayers, globalPlayers }: RosterManagerProps) {
  const router = useRouter();
  
  // Track tab type per tournament: 'existing' or 'new'
  const [tabStates, setTabStates] = useState<Record<string, "existing" | "new">>(
    tournaments.reduce((acc, t) => ({ ...acc, [t.id]: "existing" }), {})
  );

  const [selectedPlayerId, setSelectedPlayerId] = useState<Record<string, string>>({});
  const [newPlayerName, setNewPlayerName] = useState<Record<string, string>>({});
  const [playerSearchQuery, setPlayerSearchQuery] = useState<Record<string, string>>({});
  
  const [loadingStates, setLoadingStates] = useState<Record<string, "idle" | "adding" | "success">>({});
  const [deletingStates, setDeletingStates] = useState<Record<string, boolean>>({});
  const [updatingGoals, setUpdatingGoals] = useState<Record<string, boolean>>({});
  
  // Goals local state to avoid resetting input immediately on database refresh
  const [localGoals, setLocalGoals] = useState<Record<string, number>>({});

  const handleRegisterExisting = async (tournamentId: string) => {
    const playerId = selectedPlayerId[tournamentId];
    if (!playerId) return;

    setLoadingStates(prev => ({ ...prev, [tournamentId]: "adding" }));
    try {
      await addPlayerToTournamentTeam(playerId, tournamentId, teamId);
      setLoadingStates(prev => ({ ...prev, [tournamentId]: "success" }));
      setSelectedPlayerId(prev => ({ ...prev, [tournamentId]: "" }));
      setPlayerSearchQuery(prev => ({ ...prev, [tournamentId]: "" }));
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, [tournamentId]: "idle" }));
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error(err);
      setLoadingStates(prev => ({ ...prev, [tournamentId]: "idle" }));
    }
  };

  const handleRegisterNew = async (tournamentId: string) => {
    const name = newPlayerName[tournamentId];
    if (!name || !name.trim()) return;

    setLoadingStates(prev => ({ ...prev, [tournamentId]: "adding" }));
    try {
      await createAndRegisterPlayer(name.trim(), tournamentId, teamId);
      setLoadingStates(prev => ({ ...prev, [tournamentId]: "success" }));
      setNewPlayerName(prev => ({ ...prev, [tournamentId]: "" }));
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, [tournamentId]: "idle" }));
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error(err);
      setLoadingStates(prev => ({ ...prev, [tournamentId]: "idle" }));
    }
  };

  const handleRemove = async (tournamentId: string, playerId: string) => {
    const key = `${tournamentId}-${playerId}`;
    if (!confirm("¿Seguro que quieres eliminar a este jugador de la plantilla del torneo?")) return;
    
    setDeletingStates(prev => ({ ...prev, [key]: true }));
    try {
      await removePlayerFromTournamentTeam(playerId, tournamentId, teamId);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingStates(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleUpdateGoals = async (tournamentId: string, playerId: string) => {
    const key = `${tournamentId}-${playerId}`;
    const goals = localGoals[key] ?? 0;
    
    setUpdatingGoals(prev => ({ ...prev, [key]: true }));
    try {
      await updatePlayerGoals(playerId, tournamentId, teamId, goals);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingGoals(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="flex flex-col gap-12">
      {tournaments.map((t) => {
        const tournament = t.tournament;
        if (!tournament) return null;

        // Players registered for this specific tournament and team
        const tournamentPlayers = initialPlayers.filter(
          (tp) => tp.tournament_id === tournament.id
        );

        const currentTab = tabStates[tournament.id] || "existing";
        const searchQuery = playerSearchQuery[tournament.id] || "";
        const selectedId = selectedPlayerId[tournament.id] || "";
        const isAdding = loadingStates[tournament.id] === "adding";
        const isSuccess = loadingStates[tournament.id] === "success";

        // Filter global players that are not already in this tournament roster
        const registeredPlayerIds = new Set(tournamentPlayers.map((p) => p.player_id));
        const availableGlobalPlayers = globalPlayers
          .filter((p) => !registeredPlayerIds.has(p.id))
          .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

        return (
          <div 
            key={tournament.id} 
            className="panel-premium"
          >
            {/* Header decorativo superior */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-teal via-brand-aqua to-brand-navy" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-4 border-b border-brand-navy/20">
              <div>
                <span className="text-[9px] text-brand-teal font-black uppercase tracking-[0.3em] block mb-1">
                  Torneo Activo
                </span>
                <h3 className="text-xl md:text-2xl font-black text-brand-sand uppercase tracking-tighter hero-title !not-italic">
                  {tournament.name}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs bg-brand-navy/10 px-4 py-2 border border-brand-navy/20 text-brand-sand">
                <Users className="w-4 h-4 text-brand-teal" />
                <span className="font-bold uppercase tracking-widest text-[10px]">
                  Plantilla: {tournamentPlayers.length} Jugadores
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* List of players - column span 7 */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <h4 className="text-[10px] text-brand-aqua/60 font-black uppercase tracking-widest mb-2">
                  Jugadores Registrados
                </h4>

                <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {tournamentPlayers.map((tp) => {
                    const player = tp.player;
                    if (!player) return null;

                    const key = `${tournament.id}-${player.id}`;
                    const isDeleting = deletingStates[key] || false;
                    const isUpdating = updatingGoals[key] || false;
                    
                    // Default local goals input value to db value if not yet set
                    const currentGoalsValue = localGoals[key] !== undefined ? localGoals[key] : (tp.goals ?? 0);

                    return (
                      <div 
                        key={player.id} 
                        className="flex items-center justify-between p-4 bg-black/40 border border-brand-navy/20 hover:border-brand-teal/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-navy/20 flex items-center justify-center border border-brand-navy/30">
                            <span className="text-[10px] font-black text-brand-teal uppercase">
                              {player.name.slice(0, 2)}
                            </span>
                          </div>
                          <span className="font-bold text-xs md:text-sm uppercase tracking-wider text-brand-sand">
                            {player.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* Goals input */}
                          <div className="flex items-center gap-2">
                            <Award className="w-3.5 h-3.5 text-brand-teal/60" />
                            <input 
                              type="number" 
                              min="0"
                              value={currentGoalsValue}
                              onChange={(e) => {
                                const val = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                                setLocalGoals(prev => ({ ...prev, [key]: isNaN(val) ? 0 : val }));
                              }}
                              className="w-10 h-8 bg-black border border-brand-navy/50 text-center text-xs font-bold text-brand-sand outline-none focus:border-brand-teal"
                              placeholder="0"
                            />
                            {(localGoals[key] !== undefined && localGoals[key] !== (tp.goals ?? 0)) && (
                              <button 
                                onClick={() => handleUpdateGoals(tournament.id, player.id)}
                                disabled={isUpdating}
                                className="bg-brand-teal/20 text-brand-teal px-2 py-1 text-[9px] font-bold uppercase tracking-widest hover:bg-brand-teal hover:text-brand-deep transition-all"
                              >
                                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Guardar"}
                              </button>
                            )}
                          </div>

                          {/* Delete button */}
                          <button 
                            onClick={() => handleRemove(tournament.id, player.id)}
                            disabled={isDeleting}
                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors disabled:opacity-50"
                            title="Eliminar de la plantilla"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {tournamentPlayers.length === 0 && (
                    <div className="p-12 text-center border border-dashed border-brand-navy/30 bg-black/10">
                      <Users className="w-8 h-8 text-brand-navy/40 mx-auto mb-3" />
                      <span className="text-[10px] text-brand-aqua/40 uppercase tracking-widest font-black block">
                        No hay jugadores registrados
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Add player form - column span 5 */}
              <div className="lg:col-span-5 bg-black/30 border border-brand-navy/20 p-6 flex flex-col gap-6">
                <div className="flex border-b border-brand-navy/30">
                  <button 
                    onClick={() => setTabStates(prev => ({ ...prev, [tournament.id]: "existing" }))}
                    className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-widest text-center transition-all ${
                      currentTab === "existing" 
                        ? "border-b-2 border-brand-teal text-white" 
                        : "text-brand-aqua/40 hover:text-brand-sand"
                    }`}
                  >
                    Buscar Existente
                  </button>
                  <button 
                    onClick={() => setTabStates(prev => ({ ...prev, [tournament.id]: "new" }))}
                    className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-widest text-center transition-all ${
                      currentTab === "new" 
                        ? "border-b-2 border-brand-teal text-white" 
                        : "text-brand-aqua/40 hover:text-brand-sand"
                    }`}
                  >
                    Crear Nuevo
                  </button>
                </div>

                {currentTab === "existing" ? (
                  <div className="flex flex-col gap-4">
                    <span className="text-[9px] text-brand-aqua/40 uppercase tracking-widest font-bold">
                      Selecciona un jugador del sistema
                    </span>

                    {/* Search bar inside select */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-brand-aqua/30" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setPlayerSearchQuery(prev => ({ ...prev, [tournament.id]: e.target.value }))}
                        placeholder="Buscar jugador..."
                        className="input-premium !pl-10 !bg-black/60"
                      />
                    </div>

                    <select
                      value={selectedId}
                      onChange={(e) => setSelectedPlayerId(prev => ({ ...prev, [tournament.id]: e.target.value }))}
                      className="select-premium"
                    >
                      <option value="">Seleccionar Jugador...</option>
                      {availableGlobalPlayers.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>

                    <button 
                      onClick={() => handleRegisterExisting(tournament.id)}
                      disabled={!selectedId || isAdding}
                      className="w-full btn-premium-teal mt-2"
                    >
                      {isAdding ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isSuccess ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {isAdding ? "Registrando..." : isSuccess ? "¡Registrado!" : "Añadir a Plantilla"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <span className="text-[9px] text-brand-aqua/40 uppercase tracking-widest font-bold">
                      Crea un jugador y regístralo
                    </span>

                    <input 
                      type="text"
                      value={newPlayerName[tournament.id] || ""}
                      onChange={(e) => setNewPlayerName(prev => ({ ...prev, [tournament.id]: e.target.value }))}
                      placeholder="Nombre completo del jugador"
                      className="input-premium"
                    />

                    <button 
                      onClick={() => handleRegisterNew(tournament.id)}
                      disabled={!(newPlayerName[tournament.id] || "").trim() || isAdding}
                      className="w-full btn-premium-teal mt-2"
                    >
                      {isAdding ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isSuccess ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {isAdding ? "Creando..." : isSuccess ? "¡Creado y Registrado!" : "Crear y Añadir"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
