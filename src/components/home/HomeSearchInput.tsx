"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

export function HomeSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query !== (searchParams.get("q") || "")) {
        const params = new URLSearchParams(searchParams);
        if (query) {
          params.set("q", query);
          setTimeout(() => {
            document.getElementById("torneos")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    <div className="relative w-full max-w-md">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
          focused
            ? "border-[#0a84ff] bg-[#0a0f14] shadow-[0_0_0_3px_rgba(10,132,255,0.15)]"
            : "border-[#202830] bg-[#0a0f14] hover:border-[#2c3540]"
        }`}
      >
        <Search
          className={`w-4 h-4 shrink-0 transition-colors ${
            focused ? "text-[#0a84ff]" : "text-[#707b86]"
          } ${isPending ? "animate-pulse" : ""}`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Busca tu torneo o equipo..."
          className="w-full bg-transparent border-none outline-none text-[#f7f9fb] placeholder:text-[#4d565f] text-[14px] font-medium"
        />
      </div>
    </div>
  );
}
