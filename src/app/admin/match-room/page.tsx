"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MatchControlRoomClient } from "@/components/admin/MatchControlRoomClient";
import { Shield } from "@/components/ui/Shield";
import Link from "next/link";

function MatchRoomContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div className="min-h-screen bg-[#030b17] flex flex-col items-center justify-center gap-6 text-white">
        <Shield className="w-12 h-16 text-red-400" />
        <p className="text-white/60 text-sm uppercase tracking-widest">No se proporcionó un ID de partido</p>
        <Link href="/admin" className="text-[#00f0ff] text-xs uppercase tracking-widest hover:underline">
          ← Volver al Panel
        </Link>
      </div>
    );
  }

  return <MatchControlRoomClient id={id} />;
}

export default function MatchRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030b17] flex items-center justify-center">
          <Shield className="w-12 h-16 text-brand-teal animate-pulse" />
        </div>
      }
    >
      <MatchRoomContent />
    </Suspense>
  );
}
