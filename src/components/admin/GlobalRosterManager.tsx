"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  createGlobalPlayer, 
  addPlayerToTeamGlobally, 
  removePlayerFromTeamGlobally,
  updateGlobalPlayer
} from "@/app/admin/actions";
import { Plus, Trash2, Check, Loader2, Users, Search, Calendar as CalendarIcon, Edit2, X } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Register Spanish locale for react-datepicker
registerLocale("es", es);

interface Player {
  id: string;
  name: string;
  number?: number | null;
  date_of_birth?: string | null;
  position?: string | null;
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
  
  // Registration Form States
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");
  const [newPlayerDob, setNewPlayerDob] = useState<Date | undefined>(undefined);
  const [showNewDatePicker, setShowNewDatePicker] = useState(false);
  const [newPlayerPosition, setNewPlayerPosition] = useState("");
  
  // Search state
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [loadingState, setLoadingState] = useState<"idle" | "adding" | "success">("idle");
  const [deletingStates, setDeletingStates] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editing States
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editPlayerName, setEditPlayerName] = useState("");
  const [editPlayerNumber, setEditPlayerNumber] = useState("");
  const [editPlayerDob, setEditPlayerDob] = useState<Date | undefined>(undefined);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [editPlayerPosition, setEditPlayerPosition] = useState("");
  const [editLoading, setEditLoading] = useState(false);

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
      const jerseyNum = newPlayerNumber ? parseInt(newPlayerNumber, 10) : null;
      const dobStr = newPlayerDob ? format(newPlayerDob, "yyyy-MM-dd") : null;
      await createGlobalPlayer(
        newPlayerName.trim(),
        teamId,
        jerseyNum,
        dobStr,
        newPlayerPosition || null
      );
      setLoadingState("success");
      setNewPlayerName("");
      setNewPlayerNumber("");
      setNewPlayerDob(undefined);
      setShowNewDatePicker(false);
      setNewPlayerPosition("");
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

  const startEditing = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditPlayerName(player.name);
    setEditPlayerNumber(player.number != null ? String(player.number) : "");
    setEditPlayerPosition(player.position || "");
    setEditPlayerDob(player.date_of_birth ? new Date(player.date_of_birth + "T12:00:00") : undefined);
    setShowEditDatePicker(false);
  };

  const handleSaveEdit = async (playerId: string) => {
    if (!editPlayerName || !editPlayerName.trim()) return;
    setEditLoading(true);
    try {
      const jerseyNum = editPlayerNumber ? parseInt(editPlayerNumber, 10) : null;
      const dobStr = editPlayerDob ? format(editPlayerDob, "yyyy-MM-dd") : null;
      await updateGlobalPlayer(
        playerId,
        editPlayerName.trim(),
        isNaN(jerseyNum as number) ? null : jerseyNum,
        dobStr,
        editPlayerPosition || null
      );
      setEditingPlayerId(null);
      router.refresh();
      onRosterChanged?.();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al actualizar jugador");
    } finally {
      setEditLoading(false);
    }
  };

  // Filter unassigned global players based on search query
  const filteredAvailablePlayers = unassignedPlayers
    .filter((p) => p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()));

  const isAdding = loadingState === "adding";
  const isSuccess = loadingState === "success";

  const POSITIONS = ["Portero", "Defensa", "Mediocampista", "Delantero"];

  const currentYear = new Date().getFullYear();

  // Sort players by dorsal number ascending, nulls at the end sorted by name
  const sortedPlayers = [...initialPlayers].sort((a, b) => {
    if (a.number == null && b.number != null) return 1;
    if (a.number != null && b.number == null) return -1;
    if (a.number != null && b.number != null) {
      return a.number - b.number;
    }
    return a.name.localeCompare(b.name);
  });

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
        {/* List of players - column span 6 */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <h4 className="text-[10px] text-brand-aqua/60 font-black uppercase tracking-widest mb-2">
            Nómina de Jugadores
          </h4>

          <div className="flex flex-col gap-2 pr-2">
            {sortedPlayers.map((player) => {
              const isDeleting = deletingStates[player.id] || false;
              const isEditing = editingPlayerId === player.id;

              if (isEditing) {
                return (
                  <div 
                    key={player.id} 
                    className="flex flex-col gap-3 p-4 bg-[#001122]/90 border border-brand-teal/40 rounded-xl relative animate-fade-in"
                  >
                    <span className="text-[8px] text-brand-gold font-black uppercase tracking-widest">
                      Editando Ficha de Jugador
                    </span>

                    <input 
                      type="text"
                      value={editPlayerName}
                      onChange={(e) => setEditPlayerName(e.target.value)}
                      placeholder="Nombre del jugador"
                      className="input-premium !bg-black/40 !border-brand-teal/20 focus:!border-brand-teal !py-2 text-xs"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] text-brand-aqua/50 uppercase tracking-widest font-bold">Dorsal</label>
                        <input 
                          type="number"
                          value={editPlayerNumber}
                          onChange={(e) => setEditPlayerNumber(e.target.value)}
                          placeholder="Ej: 10"
                          className="input-premium !bg-black/40 !border-brand-teal/20 focus:!border-brand-teal !py-2 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] text-brand-aqua/50 uppercase tracking-widest font-bold">Posición</label>
                        <select
                          value={editPlayerPosition}
                          onChange={(e) => setEditPlayerPosition(e.target.value)}
                          className="select-premium !bg-black/40 !border-brand-teal/20 focus:!border-brand-teal !py-2 text-xs"
                        >
                          <option value="">Posición...</option>
                          {POSITIONS.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Date picker for edit mode */}
                    <div className="flex flex-col gap-1 relative">
                      <label className="text-[8px] text-brand-aqua/50 uppercase tracking-widest font-bold">Nacimiento</label>
                      <button
                        type="button"
                        onClick={() => setShowEditDatePicker(!showEditDatePicker)}
                        className="input-premium flex items-center justify-between text-left w-full !bg-black/40 !border-brand-teal/20 focus:!border-brand-teal !py-2 text-xs"
                      >
                        <span className={editPlayerDob ? "text-brand-sand" : "text-brand-aqua/30"}>
                          {editPlayerDob ? format(editPlayerDob, "dd 'de' MMMM, yyyy", { locale: es }) : "Elegir Fecha..."}
                        </span>
                        <CalendarIcon size={12} className="text-brand-teal/60" />
                      </button>

                      {showEditDatePicker && (
                        <div className="absolute left-0 bottom-full mb-2 z-50 p-1 bg-[#02060d] border border-[#00f0ff]/30 shadow-[0_10px_35px_rgba(0,0,0,0.9)] rounded-xl">
                          <DatePicker
                            selected={editPlayerDob}
                            onChange={(date: Date | null) => {
                              if (date) {
                                setEditPlayerDob(date);
                                setShowEditDatePicker(false);
                              }
                            }}
                            locale="es"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            inline
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-brand-teal/10">
                      <button
                        onClick={() => setEditingPlayerId(null)}
                        className="px-3 py-1.5 border border-brand-navy/40 text-brand-aqua/60 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit(player.id)}
                        disabled={editLoading || !editPlayerName.trim()}
                        className="px-4 py-1.5 bg-brand-teal/20 hover:bg-brand-teal/30 border border-brand-teal/40 text-brand-teal text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5"
                      >
                        {editLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        Guardar
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={player.id} 
                  className="flex items-center justify-between p-4 bg-black/40 border border-brand-navy/20 hover:border-brand-teal/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-brand-navy/20 flex items-center justify-center border border-brand-navy/30 shrink-0">
                      {player.number != null ? (
                        <span className="text-[11px] font-black text-brand-gold tabular-nums">
                          #{player.number}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-brand-gold uppercase">
                          {player.name.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs md:text-sm uppercase tracking-wider text-brand-sand truncate">
                        {player.name}
                      </span>
                      {player.position && (
                        <span className="text-[9px] text-brand-aqua/50 uppercase tracking-widest mt-0.5">
                          {player.position}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => startEditing(player)}
                      className="text-brand-aqua/50 hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 p-2 rounded transition-colors"
                      title="Editar ficha"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
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

        {/* Add player form - column span 6 */}
        <div className="lg:col-span-6 bg-[#050b14]/60 border border-brand-teal/20 p-6 flex flex-col gap-6 rounded-2xl">
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
                placeholder="Nombre completo del jugador *"
                className="input-premium !bg-[#001122]/80 !border-brand-teal/30 focus:!border-brand-teal"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-brand-aqua/50 uppercase tracking-widest font-bold">Dorsal #</label>
                  <input 
                    type="number"
                    min="1"
                    max="99"
                    value={newPlayerNumber}
                    onChange={(e) => setNewPlayerNumber(e.target.value)}
                    placeholder="Ej: 10"
                    className="input-premium !bg-[#001122]/80 !border-brand-teal/30 focus:!border-brand-teal !py-2"
                  />
                </div>
                
                {/* Premium Popover Library Date Selector */}
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[9px] text-brand-aqua/50 uppercase tracking-widest font-bold">Nacimiento</label>
                  <button
                    type="button"
                    onClick={() => setShowNewDatePicker(!showNewDatePicker)}
                    className="input-premium flex items-center justify-between text-left w-full !bg-[#001122]/80 !border-brand-teal/30 focus:!border-brand-teal !py-2"
                  >
                    <span className={newPlayerDob ? "text-brand-sand font-mono text-xs" : "text-brand-aqua/30 text-xs"}>
                      {newPlayerDob ? format(newPlayerDob, "dd 'de' MMMM, yyyy", { locale: es }) : "Nacimiento..."}
                    </span>
                    <CalendarIcon size={13} className="text-brand-teal/60" />
                  </button>

                  {showNewDatePicker && (
                    <div className="absolute right-0 bottom-full mb-2 z-50 p-1 bg-[#02060d] border border-[#00f0ff]/30 shadow-[0_10px_35px_rgba(0,0,0,0.9)] rounded-xl">
                      <DatePicker
                        selected={newPlayerDob}
                        onChange={(date: Date | null) => {
                          if (date) {
                            setNewPlayerDob(date);
                            setShowNewDatePicker(false);
                          }
                        }}
                        locale="es"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        inline
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-brand-aqua/50 uppercase tracking-widest font-bold">Posición</label>
                <select
                  value={newPlayerPosition}
                  onChange={(e) => setNewPlayerPosition(e.target.value)}
                  className="select-premium !bg-[#001122]/80 !border-brand-teal/30 focus:!border-brand-teal"
                >
                  <option value="">Sin especificar</option>
                  {POSITIONS.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

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
