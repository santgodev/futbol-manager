"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FeaturedTournamentsCarousel } from "./FeaturedTournamentsCarousel";
import { createClient } from "@/utils/supabase/client";
import { Trophy, Shield, Activity, MapPin } from "lucide-react";
import Link from "next/link";

export function GlobalSearchResults({ initialTournaments }: { initialTournaments: any[] }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  
  const [tournaments, setTournaments] = useState<any[]>(initialTournaments);
  const [teams, setTeams] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query) {
      setTournaments(initialTournaments);
      setTeams([]);
      return;
    }

    const fetchResults = async () => {
      setIsSearching(true);
      const supabase = createClient();

      // Buscamos torneos en toda la base de datos
      const { data: tData } = await supabase
        .from("tournaments")
        .select("id, slug, name, image_url, status, location, start_date")
        .ilike("name", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      // Buscamos equipos en toda la base de datos
      const { data: teamsData } = await supabase
        .from("teams")
        .select("id, name, logo_url, city")
        .ilike("name", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      setTournaments(tData || []);
      setTeams(teamsData || []);
      setIsSearching(false);
    };

    fetchResults();
  }, [query, initialTournaments]);

  if (!query) {
    return <FeaturedTournamentsCarousel tournaments={initialTournaments} title="Torneos Destacados" />;
  }

  return (
    <div className="w-full relative py-6">
      <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide mb-6">
        Resultados para "{searchParams.get("q")}"
      </h2>

      {isSearching ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#0088ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Resultados de Torneos */}
          {tournaments.length > 0 && (
            <div>
              <FeaturedTournamentsCarousel tournaments={tournaments} title="Torneos Encontrados" />
            </div>
          )}

          {/* Resultados de Equipos */}
          {teams.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white/80 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0088ff]" />
                Equipos Encontrados
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {teams.map((team) => (
                  <div key={team.id} className="bg-[#030812] border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-[#0088ff]/50 transition-colors">
                    {team.logo_url ? (
                      <img src={team.logo_url} alt={team.name} className="w-16 h-16 rounded-full object-cover bg-white/5" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#040814] border border-white/10 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                    <div className="text-center">
                      <h4 className="text-white font-bold text-sm truncate w-full max-w-[120px]">{team.name}</h4>
                      {team.city && (
                        <p className="text-white/40 text-xs flex items-center justify-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {team.city}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tournaments.length === 0 && teams.length === 0 && (
            <div className="w-full py-12 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10">
              <Activity className="w-12 h-12 text-[#0088ff]/20 mb-4" />
              <h3 className="text-xl font-bold text-white/70">No se encontraron resultados</h3>
              <p className="text-white/40 text-sm mt-2">Intenta con otros términos de búsqueda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
