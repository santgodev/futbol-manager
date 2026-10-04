import Link from 'next/link';

export function Header() {
  return (
    <>
      <a className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground" href="#content">
        Saltar al contenido
      </a>
      <header className="fixed top-6 left-0 right-0 z-50 px-6 pointer-events-none">
        <div className="container mx-auto max-w-7xl flex items-center justify-between pointer-events-auto">
          {/* Brand */}
          <Link className="flex items-center gap-1" href="/" aria-label="Preciado Formación y Soluciones — Inicio">
            <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
              Preciado.
            </span>
          </Link>
          
          {/* Centered Pill Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-white/70 backdrop-blur-md border border-black/5 shadow-sm rounded-full p-1" aria-label="Navegación principal">
            <Link className="text-sm font-medium px-4 py-2 rounded-full text-foreground/80 hover:bg-black/5 transition-colors" href="/formacion">Formación</Link>
            <Link className="text-sm font-medium px-4 py-2 rounded-full text-foreground/80 hover:bg-black/5 transition-colors" href="/psicologia">Psicología</Link>
            <Link className="text-sm font-medium px-4 py-2 rounded-full text-foreground/80 hover:bg-black/5 transition-colors" href="/nosotros">Nosotros</Link>
            <Link className="text-sm font-medium px-4 py-2 rounded-full text-foreground/80 hover:bg-black/5 transition-colors" href="/recursos">Recursos</Link>
          </nav>
          
          {/* Right Action */}
          <div className="flex items-center gap-4">
            <Link className="hidden md:inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-transform hover:scale-105 focus-visible:outline-none" href="/contacto">
              Contáctanos <span className="ml-1 opacity-70">↗</span>
            </Link>
            
            <button className="md:hidden p-2 text-foreground bg-white/70 backdrop-blur-md rounded-full border shadow-sm" aria-controls="main-nav" aria-expanded={false}>
              <span className="sr-only">Menú</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
