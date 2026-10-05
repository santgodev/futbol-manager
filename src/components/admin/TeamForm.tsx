"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTeam } from "@/app/admin/actions";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUserProfile } from "@/app/admin/pegasight-actions";

export function TeamForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [tournaments, setTournaments] = useState<{id: string, name: string}[]>([]);
  const [loadingData, setLoadingData] = useState(true);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const tournament_id = formData.get("tournament_id") as string;
    
    if (!tournament_id) {
      setErrorMessage("Debes seleccionar un torneo al cual pertenecerá el equipo");
      setStatus("error");
      return;
    }

    const data = {
      name: formData.get("name") as string,
      tournament_id,
      city: formData.get("city") as string,
      primary_color: formData.get("primary_color") as string,
      logo_url: (formData.get("logo_url") as string) || null,
    };

    if (!data.name) {
      setErrorMessage("El nombre del equipo es obligatorio");
      setStatus("error");
      return;
    }

    try {
      const res = await createTeam(data);
      if (res.success) {
        setStatus("success");
        setTimeout(() => {
          router.push("/admin/teams");
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Error al crear equipo");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel-premium max-w-xl mx-auto relative overflow-hidden">
      
      <div className="flex flex-col gap-6 relative z-10">
        <h3 className="text-sm font-bold uppercase tracking-widest text-brand-sand">Registrar Nuevo Equipo</h3>
        
        {loadingData ? (
          <div className="flex items-center gap-2 text-brand-aqua/50 text-xs py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando datos...
          </div>
        ) : (
          <>
            {/* Torneo al que pertenece */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold ml-1">Torneo *</label>
              {tournaments.length === 0 ? (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
                  No tienes torneos activos para asignar equipos. Crea un torneo primero.
                </div>
              ) : (
                <select name="tournament_id" required className="input-premium appearance-none">
                  <option value="">Selecciona un torneo...</option>
                  {tournaments.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
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
                  className="w-12 h-12 bg-black border border-brand-navy/50 rounded cursor-pointer p-1"
                />
                <span className="text-[10px] uppercase tracking-widest text-brand-aqua/40">
                  Se usará para personalizar la visualización del equipo
                </span>
              </div>
            </div>

            {/* Escudo */}
            <ImageUpload
              name="logo_url"
              label="Escudo del Equipo (Opcional)"
              bucket="logos"
              folder="teams"
            />

            {/* Mensaje de Error */}
            {status === "error" && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-lg flex items-center gap-2">
                <AlertTriangle size={14} /> {errorMessage}
              </div>
            )}

            {/* Mensaje de Éxito */}
            {status === "success" && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-4 rounded-lg flex items-center gap-2">
                <Shield size={14} /> Equipo creado correctamente. Redirigiendo...
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-brand-navy/30 mt-4">
              <Link 
                href="/admin/teams" 
                className="w-full sm:w-auto text-center px-6 py-3 border border-brand-navy/50 text-brand-aqua/60 hover:text-white hover:border-white/30 rounded-xl uppercase tracking-widest text-[10px] font-bold transition-all order-2 sm:order-1"
              >
                Cancelar
              </Link>
              
              <button
                type="submit"
                disabled={status === "submitting" || status === "success" || tournaments.length === 0}
                className="w-full sm:w-auto sm:min-w-[160px] btn-premium-teal order-1 sm:order-2"
              >
                {status === "submitting" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield size={16} />
                )}
                {status === "submitting" ? "Creando..." : "Registrar Equipo"}
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
