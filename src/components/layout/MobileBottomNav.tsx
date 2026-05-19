"use client";

import { Home, Calendar, Trophy, BarChart3, BookOpen } from "lucide-react";

export const MobileBottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-brand-deep/90 backdrop-blur-md border-t border-brand-navy/50 md:hidden pb-safe">
      <div className="flex justify-around items-center h-20 pb-4">
        <a href="#top" className="flex flex-col items-center justify-center w-full h-full text-brand-aqua/60 hover:text-brand-teal transition-colors">
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-bold">Inicio</span>
        </a>
        <a href="#matches" className="flex flex-col items-center justify-center w-full h-full text-brand-aqua/60 hover:text-brand-teal transition-colors">
          <Calendar className="w-5 h-5 mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-bold">Partidos</span>
        </a>
        <a href="#standings" className="flex flex-col items-center justify-center w-full h-full text-brand-aqua/60 hover:text-brand-teal transition-colors">
          <Trophy className="w-5 h-5 mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-bold">Tabla</span>
        </a>
        <a href="#stats" className="flex flex-col items-center justify-center w-full h-full text-brand-aqua/60 hover:text-brand-teal transition-colors">
          <BarChart3 className="w-5 h-5 mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-bold">Stats</span>
        </a>
        <a href="#rules" className="flex flex-col items-center justify-center w-full h-full text-brand-aqua/60 hover:text-brand-teal transition-colors">
          <BookOpen className="w-5 h-5 mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-bold">Reglas</span>
        </a>
      </div>
    </nav>
  );
};
