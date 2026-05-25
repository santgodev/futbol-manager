"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

export function HomeSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query !== (searchParams.get("q") || "")) {
        const params = new URLSearchParams(searchParams);
        if (query) {
          params.set("q", query);
          // Automatically scroll down to the results section so the user sees it on mobile
          setTimeout(() => {
            document.getElementById('torneos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        } else {
          params.delete("q");
        }
        
        startTransition(() => {
          router.push(`/?${params.toString()}`, { scroll: false });
        });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router, searchParams]);

  return (
    <div className="relative w-full max-w-md group mt-2">
      <div className="absolute inset-0 bg-[#0088ff] rounded-full blur-[8px] opacity-20 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none"></div>
      <div className="relative flex items-center bg-[#02050a]/80 backdrop-blur-md border-2 border-[#0088ff]/50 rounded-full px-4 py-3 shadow-[0_0_15px_rgba(0,136,255,0.15)] group-focus-within:border-[#0088ff] group-focus-within:shadow-[0_0_20px_rgba(0,136,255,0.4)] transition-all duration-300">
        <Search className={`w-5 h-5 text-[#0088ff] shrink-0 mr-3 opacity-80 ${isPending ? 'animate-pulse' : ''}`} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca tu torneo o equipo..." 
          className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/40 text-sm font-medium"
        />
      </div>
    </div>
  );
}
