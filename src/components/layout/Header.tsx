export const Header = () => {
  return (
    <header className="absolute top-0 left-0 w-full z-40 p-6 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <img src="/logo.png" alt="Pegasight Logo" className="h-8 w-auto opacity-80" />
        <h1 className="text-xl font-bold tracking-widest text-brand-sand hero-title !text-xl !not-italic !tracking-normal">PEGASIGHT</h1>
      </div>
      
      <nav className="hidden md:flex gap-6 md:gap-8 text-[10px] md:text-[11px] font-bold text-brand-aqua uppercase tracking-[0.3em] overflow-x-auto pb-2 md:pb-0">
        <a href="#matches" className="hover:text-brand-sand transition-colors whitespace-nowrap">Partidos</a>
        <a href="#calendar" className="hover:text-brand-sand transition-colors whitespace-nowrap">Calendario</a>
        <a href="#standings" className="hover:text-brand-sand transition-colors whitespace-nowrap">Clasificación</a>
        <a href="#stats" className="hover:text-brand-sand transition-colors whitespace-nowrap">Estadísticas</a>
        <a href="#teams" className="hover:text-brand-sand transition-colors whitespace-nowrap">Equipos</a>
        <a href="#rules" className="hover:text-brand-sand transition-colors whitespace-nowrap">Reglamento</a>
      </nav>
    </header>
  );
};
