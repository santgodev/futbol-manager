"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTeam } from "@/app/admin/actions";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Loader2, Shield, AlertTriangle, Plus, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUserProfile } from "@/app/admin/pegasight-actions";

export function TeamForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [tournaments, setTournaments] = useState<{id: string, name: string}[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // State for multiple team forms
  const [teamIds, setTeamIds] = useState<string[]>([crypto.randomUUID()]);
  
  const router = useRouter();

  useEffect(() => {
    async function loadTournaments() {
      try {
        const userProfile = await getCurrentUserProfile();
        if (!userProfile) return;

        const supabase = createClient();
        let query = supabase.from("tournaments").select("id, name").order("created_at", { ascending: false });

        if (userProfile.role === "ADMINISTRADOR_DEL_TORNEO") {
          const assignedIds = userProfile.memberships
            .filter(m => m.role === "ADMINISTRADOR_DEL_TORNEO" && m.status === "ACTIVE")
            .map(m => m.tournament_id);

          if (assignedIds.length === 0) {
            setTournaments([]);
            return;
          }
          query = query.in("id", assignedIds);
        } else if (userProfile.role === "SUPERADMINISTRADOR") {
          query = query.eq("superadmin_id", userProfile.id);
        }
        
        const { data } = await query;
        if (data) setTournaments(data);
      } catch (err) {
        console.error("Error cargando torneos", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadTournaments();
  }, []);

  const addTeam = () => {
    setTeamIds(prev => [...prev, crypto.randomUUID()]);
  };

  const removeTeam = (id: string) => {
    if (teamIds.length > 1) {
      setTeamIds(prev => prev.filter(t => t !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const tournament_id = formData.get("tournament_id") as string;
    
    if (!tournament_id) {
      setErrorMessage("Debes seleccionar un torneo al cual pertenecerán los equipos");
      setStatus("error");
      return;
    }

    const names = formData.getAll("name") as string[];
    const cities = formData.getAll("city") as string[];
    const primaryColors = formData.getAll("primary_color") as string[];
    const logoUrls = formData.getAll("logo_url") as string[];

    const teamsToCreate = names.map((name, index) => ({
      name: name.trim(),
      tournament_id,
      city: cities[index]?.trim() || "",
      primary_color: primaryColors[index] || "#447E8C",
      logo_url: logoUrls[index] || null,
    }));

    if (teamsToCreate.some(t => !t.name)) {
      setErrorMessage("Todos los equipos deben tener un nombre");
      setStatus("error");
      return;
    }

    try {
      await Promise.all(teamsToCreate.map(data => createTeam(data)));
      setStatus("success");
      setTimeout(() => {
        router.push("/admin/teams");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Error al crear equipos");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel-premium max-w-2xl mx-auto relative overflow-hidden">
      
      <div className="flex flex-col gap-6 relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-sand">Registrar Equipos</h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-1 rounded">
            {teamIds.length} {teamIds.length === 1 ? 'Equipo' : 'Equipos'}
          </span>
        </div>
        
        {loadingData ? (
          <div className="flex items-center gap-2 text-brand-aqua/50 text-xs py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando datos...
          </div>
        ) : (
          <>
            {/* Torneo al que pertenece */}
            <div className="flex flex-col gap-2 bg-[#040c1a]/50 p-4 rounded-xl border border-brand-navy/30">
              <label className="text-[10px] text-[#00f0ff]/80 uppercase tracking-widest font-bold ml-1">
                Torneo de Destino *
              </label>
              {tournaments.length === 0 ? (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
                  No tienes torneos activos para asignar equipos. Crea un torneo primero.
                </div>
              ) : (
                <select name="tournament_id" required className="input-premium appearance-none !bg-black/50">
                  <option value="">Selecciona a qué torneo irán estos equipos...</option>
                  {tournaments.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* List of Teams */}
            <div className="flex flex-col gap-6 mt-2">
              {teamIds.map((id, index) => (
                <div key={id} className="p-5 rounded-xl border border-brand-navy/30 bg-[#040c1a]/30 flex flex-col gap-5 relative group transition-all hover:border-brand-navy/60 hover:shadow-[0_0_15px_rgba(0,102,204,0.1)]">
                  
                  <div className="flex items-center justify-between border-b border-brand-navy/30 pb-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/80 flex items-center gap-2">
                      <span className="bg-brand-navy/50 text-[#00f0ff] w-5 h-5 flex items-center justify-center rounded-full text-[10px]">
                        {index + 1}
                      </span>
                      Equipo
                    </h4>
                    {teamIds.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeTeam(id)}
                        className="text-white/30 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors"
                        title="Eliminar este equipo"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Nombre del Equipo */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold ml-1">Nombre del Equipo *</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      className="input-premium" 
                      placeholder="Ej. Real Madrid, Los Galácticos..." 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Ciudad Base */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold ml-1">Ciudad Base</label>
                      <input 
                        type="text" 
                        name="city" 
                        className="input-premium" 
                        placeholder="Ej. Madrid, España" 
                      />
                    </div>

                    {/* Color Principal */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold ml-1">Color Principal</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="color" 
                          name="primary_color" 
                          defaultValue="#447E8C"
                          className="w-11 h-11 bg-black border border-brand-navy/50 rounded-lg cursor-pointer p-0.5"
                        />
                        <span className="text-[9px] uppercase tracking-widest text-brand-aqua/40">
                          Color representativo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Escudo */}
                  <div className="bg-black/20 p-3 rounded-lg">
                    <ImageUpload
                      name="logo_url"
                      label="Escudo del Equipo (Opcional)"
                      bucket="logos"
                      folder="teams"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addTeam}
              className="mt-2 w-full py-3.5 border-2 border-dashed border-[#00f0ff]/20 text-[#00f0ff]/60 hover:border-[#00f0ff]/50 hover:text-[#00f0ff] hover:bg-[#00f0ff]/5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Agregar otro equipo a la lista
            </button>

            {/* Mensaje de Error */}
            {status === "error" && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-lg flex items-center gap-2 mt-4">
                <AlertTriangle size={14} /> {errorMessage}
              </div>
            )}

            {/* Mensaje de Éxito */}
            {status === "success" && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-4 rounded-lg flex items-center gap-2 mt-4">
                <Shield size={14} /> {teamIds.length} {teamIds.length === 1 ? 'Equipo creado' : 'Equipos creados'} correctamente. Redirigiendo...
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-brand-navy/30 mt-4 bg-[#040c1a] sticky bottom-0 z-20 pb-2">
              <Link 
                href="/admin/teams" 
                className="w-full sm:w-auto text-center px-6 py-3 border border-brand-navy/50 text-brand-aqua/60 hover:text-white hover:border-white/30 rounded-xl uppercase tracking-widest text-[10px] font-bold transition-all order-2 sm:order-1"
              >
                Cancelar
              </Link>
              
              <button
                type="submit"
                disabled={status === "submitting" || status === "success" || tournaments.length === 0}
                className="w-full sm:w-auto sm:min-w-[200px] btn-premium-teal order-1 sm:order-2"
              >
                {status === "submitting" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield size={16} />
                )}
                {status === "submitting" ? "Guardando..." : `Guardar ${teamIds.length} ${teamIds.length === 1 ? 'Equipo' : 'Equipos'}`}
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
