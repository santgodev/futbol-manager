"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  createGlobalPlayer, 
  addPlayerToTeamGlobally, 
  removePlayerFromTeamGlobally,
  updateGlobalPlayer
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash2, Check, Loader2, Users, Search, Edit2, MoreHorizontal, X } from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { format } from "date-fns";
import styles from "./club-workspace.module.css";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

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
  const [newPlayerPosition, setNewPlayerPosition] = useState("");
  
  // Search state
  const [rosterSearch, setRosterSearch] = useState("");
  const [showSigning, setShowSigning] = useState(false);
  const searchId = useId();
  const [loadingState, setLoadingState] = useState<"idle" | "adding" | "success">("idle");
  const [deletingStates, setDeletingStates] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editing States
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editPlayerName, setEditPlayerName] = useState("");
  const [editPlayerNumber, setEditPlayerNumber] = useState("");
  const [editPlayerDob, setEditPlayerDob] = useState<Date | undefined>(undefined);
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
      setTimeout(() => {
        setLoadingState("idle");
        router.refresh();
        onRosterChanged?.();
      }, 1000);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(getErrorMessage(err, "Error al fichar jugador"));
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
      setNewPlayerPosition("");
      setTimeout(() => {
        setLoadingState("idle");
        router.refresh();
        onRosterChanged?.();
      }, 1000);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(getErrorMessage(err, "Error al crear jugador"));
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
      setErrorMsg(getErrorMessage(err, "No se pudo retirar al jugador"));
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
    } catch (err: unknown) {
      console.error(err);
      alert(getErrorMessage(err, "Error al actualizar jugador"));
    } finally {
      setEditLoading(false);
    }
  };

  const isAdding = loadingState === "adding";
  const isSuccess = loadingState === "success";


  // Sort players by dorsal number ascending, nulls at the end sorted by name
  const sortedPlayers = [...initialPlayers].sort((a, b) => {
    if (a.number == null && b.number != null) return 1;
    if (a.number != null && b.number == null) return -1;
    if (a.number != null && b.number != null) {
      return a.number - b.number;
    }
    return a.name.localeCompare(b.name);
  });

  const visiblePlayers = sortedPlayers.filter((player) => player.name.toLocaleLowerCase().includes(rosterSearch.toLocaleLowerCase()));

  return (
    <section className={`${styles.workspace} py-8 sm:py-10`} aria-labelledby="roster-title">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h2 id="roster-title" className="text-2xl font-semibold">Plantilla</h2>
          <span className="text-sm tabular-nums text-muted-foreground">{initialPlayers.length} jugadores</span>
        </div>
        <Button onClick={() => setShowSigning(!showSigning)} aria-expanded={showSigning} aria-controls="club-signing"
          className="h-11 rounded-md bg-primary px-4 text-primary-foreground hover:bg-primary/90 lg:hidden">
          {showSigning ? <X className="size-4" /> : <Plus className="size-4" />}
          {showSigning ? "Cerrar fichajes" : "Añadir jugador"}
        </Button>
      </div>

      {errorMsg && <p role="alert" className="mb-5 rounded-md bg-red-400/10 p-3 text-sm text-red-300">{errorMsg}</p>}

      <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-2 min-w-0 lg:order-1">
          <label htmlFor={searchId} className="sr-only">Buscar en plantilla</label>
          <div className="relative mb-5">
            <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <Input id={searchId} value={rosterSearch} onChange={(event) => setRosterSearch(event.target.value)}
              placeholder="Buscar en plantilla" className={`${styles.control} pl-10`} />
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-background">
          <Table className="table-fixed" aria-label="Plantilla del club">
            <TableHeader className="bg-muted/60">
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col" className="px-3 text-xs text-muted-foreground sm:px-4">Jugador</TableHead>
                <TableHead scope="col" className="hidden w-32 text-xs text-muted-foreground sm:table-cell">Posición</TableHead>
                <TableHead scope="col" className="w-14 text-center text-xs text-muted-foreground">Dorsal</TableHead>
                <TableHead scope="col" className="w-14"><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {visiblePlayers.map((player) => (
              <TableRow key={player.id} className="even:bg-white/[0.015] focus-within:bg-muted/50">
                {editingPlayerId === player.id ? (
                  <TableCell colSpan={4} className="whitespace-normal p-0">
                  <form onSubmit={(event) => { event.preventDefault(); void handleSaveEdit(player.id); }} className="space-y-4 bg-card p-4">
                    <h3 className="text-base font-semibold">Editar jugador</h3>
                    <PlayerFields name={editPlayerName} onName={setEditPlayerName} number={editPlayerNumber} onNumber={setEditPlayerNumber}
                      dob={editPlayerDob} onDob={setEditPlayerDob} position={editPlayerPosition} onPosition={setEditPlayerPosition} />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" className="h-11" onClick={() => setEditingPlayerId(null)} disabled={editLoading}>Cancelar</Button>
                      <Button type="submit" className="h-11" disabled={editLoading || !editPlayerName.trim()}>
                        {editLoading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}Guardar
                      </Button>
                    </div>
                  </form>
                  </TableCell>
                ) : (
                  <>
                  <TableCell className="whitespace-normal px-3 py-4 sm:px-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className={`${styles.playerAvatar} size-9`}><AvatarFallback className="text-xs font-medium">
                      {player.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toLocaleUpperCase()}
                    </AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold">{player.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground sm:hidden">{player.position || "Sin posición"}</p>
                    </div>
                  </div>
                  </TableCell>
                  <TableCell className="hidden whitespace-normal text-sm text-muted-foreground sm:table-cell">{player.position || "Sin posición"}</TableCell>
                  <TableCell className="text-center font-mono text-sm tabular-nums text-muted-foreground">{player.number != null ? `#${player.number}` : "-"}</TableCell>
                  <TableCell className="px-1">
                    <Menu.Root>
                      <Menu.Trigger render={<Button variant="ghost" size="icon" className="size-11 shrink-0 rounded-md text-muted-foreground" />}
                        aria-label={`Acciones de ${player.name}`} title={`Acciones de ${player.name}`} disabled={deletingStates[player.id]}>
                        {deletingStates[player.id] ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-5" />}
                      </Menu.Trigger>
                      <Menu.Portal><Menu.Positioner align="end" sideOffset={4} className="z-50">
                        <Menu.Popup className="min-w-52 rounded-md border border-border bg-popover p-1 text-sm text-popover-foreground shadow-lg outline-none">
                          <Menu.Item onClick={() => startEditing(player)} className="flex min-h-11 cursor-default items-center gap-2 rounded-sm px-3 outline-none data-highlighted:bg-secondary"><Edit2 className="size-4" />Editar ficha</Menu.Item>
                          <Menu.Item onClick={() => handleRemove(player.id)} className="flex min-h-11 cursor-default items-center gap-2 rounded-sm px-3 text-red-300 outline-none data-highlighted:bg-secondary"><Trash2 className="size-4" />Retirar de plantilla</Menu.Item>
                        </Menu.Popup>
                      </Menu.Positioner></Menu.Portal>
                    </Menu.Root>
                  </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
          </Table>
          {!visiblePlayers.length && (
            <div className="flex flex-col items-center py-14 text-center">
              <Users className="mb-4 size-8 text-muted-foreground" />
              <h3 className="text-base font-medium">{initialPlayers.length ? "Sin coincidencias" : "Tu plantilla empieza aquí"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{initialPlayers.length ? "Prueba con otro nombre." : "Todavía no hay jugadores en este club."}</p>
              {!initialPlayers.length && <Button variant="ghost" className="mt-4 h-11 lg:hidden" onClick={() => setShowSigning(true)}><Plus className="size-4" />Añadir jugador</Button>}
            </div>
          )}
          </div>
        </div>

        <aside id="club-signing" className={`${styles.signing} ${showSigning ? "block" : "hidden"} order-1 min-w-0 rounded-lg p-5 lg:order-2 lg:block`}>
          <h3 className="text-lg font-semibold">Añadir jugador</h3>
          <p className="mt-1 text-sm text-muted-foreground">Fichajes del club</p>
          <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "existing" | "new")} className="mt-5 gap-5">
            <TabsList className="h-11! w-full rounded-md bg-muted">
              <TabsTrigger value="existing" className="h-10 text-sm">Existente</TabsTrigger>
              <TabsTrigger value="new" className="h-10 text-sm">Nuevo jugador</TabsTrigger>
            </TabsList>
            <TabsContent value="existing">
              <form onSubmit={(event) => { event.preventDefault(); void handleRegisterExisting(); }} className="space-y-5">
                <div className={styles.field}>
                  <label htmlFor="free-player">Jugador libre</label>
                  <SearchableSelect id="free-player" options={unassignedPlayers.map((player) => ({ value: player.id, label: player.name }))}
                    value={selectedPlayerId} onValueChange={setSelectedPlayerId} placeholder="Buscar por nombre..." disabled={isAdding || isSuccess} />
                  <span className="text-xs">{unassignedPlayers.length ? `${unassignedPlayers.length} jugadores disponibles` : "No hay jugadores libres disponibles."}</span>
                </div>
                <Button type="submit" disabled={!selectedPlayerId || isAdding || isSuccess} className="h-11 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  {isAdding ? <Loader2 className="size-4 animate-spin" /> : isSuccess ? <Check className="size-4" /> : <Plus className="size-4" />}
                  {isAdding ? "Fichando..." : isSuccess ? "Jugador fichado" : "Fichar jugador"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="new">
              <form onSubmit={(event) => { event.preventDefault(); void handleRegisterNew(); }} className="space-y-5">
                <PlayerFields name={newPlayerName} onName={setNewPlayerName} number={newPlayerNumber} onNumber={setNewPlayerNumber}
                  dob={newPlayerDob} onDob={setNewPlayerDob} position={newPlayerPosition} onPosition={setNewPlayerPosition} />
                <Button type="submit" disabled={!newPlayerName.trim() || isAdding || isSuccess} className="h-11 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  {isAdding ? <Loader2 className="size-4 animate-spin" /> : isSuccess ? <Check className="size-4" /> : <Plus className="size-4" />}
                  {isAdding ? "Registrando..." : isSuccess ? "Jugador registrado" : "Crear y fichar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <p role="status" className="sr-only">{isAdding ? "Procesando fichaje" : isSuccess ? "Fichaje completado" : ""}</p>
        </aside>
      </div>
    </section>
  );
}

function PlayerFields({ name, onName, number, onNumber, dob, onDob, position, onPosition }: {
  name: string; onName: (value: string) => void;
  number: string; onNumber: (value: string) => void;
  dob: Date | undefined; onDob: (value: Date | undefined) => void;
  position: string; onPosition: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-4">
      <label className={styles.field}>Nombre completo
        <Input value={name} onChange={(event) => onName(event.target.value)} required placeholder="Nombre y apellido" className={styles.control} />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[80px_minmax(0,1fr)]">
        <label className={styles.field}>Dorsal
          <Input type="number" value={number} onChange={(event) => onNumber(event.target.value)} placeholder="10" className={styles.control} />
        </label>
        <label className={styles.field}>Nacimiento
          <Input type="date" value={dob ? format(dob, "yyyy-MM-dd") : ""} onChange={(event) => onDob(event.target.value ? new Date(event.target.value + "T12:00:00") : undefined)} className={styles.control} />
        </label>
      </div>
      <div className={styles.field}>
        <label htmlFor={id}>Posición</label>
        <SearchableSelect id={id} value={position} onValueChange={onPosition} placeholder="Sin especificar"
          options={["", "Portero", "Defensa", "Mediocampista", "Delantero"].map((value) => ({ value, label: value || "Sin especificar" }))} />
      </div>
    </div>
  );
}
