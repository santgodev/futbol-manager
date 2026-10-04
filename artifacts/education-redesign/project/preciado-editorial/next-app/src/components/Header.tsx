import Link from 'next/link';

export function Header() {
  return (
    <>
      <a className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground" href="#content">
        Saltar al contenido
      </a>
      
      {/* Editorial Luxury Header (No bubbles, no pills, pure typography and spacing) */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 py-8 bg-gradient-to-b from-[#161716]/90 via-[#161716]/60 to-transparent pointer-events-none">
        <div className="w-full max-w-[1800px] mx-auto flex items-center justify-between pointer-events-auto">
          
          {/* LEFT: Brand */}
          <div className="flex-1 flex items-center">
            <Link href="/" className="flex items-center gap-3 group" aria-label="Inicio">
              <span className="font-serif text-xl tracking-wider text-[#e2dfd6] group-hover:text-[#d7bd83] transition-colors duration-500">
                preciadofys.
              </span>
              <img 
                src="/assets/images/60687c1b6459-small.webp" 
                alt="Logo" 
                className="h-7 w-auto object-contain transition-transform duration-700 group-hover:scale-110" 
              />
            </Link>
          </div>
          
          {/* CENTER: Ultra-minimalist Nav */}
          <nav className="hidden lg:flex items-center justify-center gap-14 flex-1" aria-label="Navegación principal">
            {[
              { name: 'FORMACIÓN', path: '/formacion' },
              { name: 'PSICOLOGÍA', path: '/psicologia' },
              { name: 'NOSOTROS', path: '/nosotros' },
              { name: 'RECURSOS', path: '/recursos' },
            ].map((link) => (
              <Link 
                key={link.name}
                href={link.path} 
                className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e2dfd6]/70 hover:text-[#d7bd83] transition-colors relative py-2 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#d7bd83] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-500 after:origin-left"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* RIGHT: High-end Split CTA */}
          <div className="flex-1 flex items-center justify-end">
            <Link href="/contacto" className="hidden md:flex items-center gap-4 group">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d7bd83] group-hover:text-white transition-colors duration-500">
                AGENDAR SESIÓN
              </span>
              <div className="h-11 w-11 rounded-full border border-[#d7bd83]/30 flex items-center justify-center group-hover:bg-[#d7bd83] group-hover:border-[#d7bd83] transition-all duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#d7bd83] group-hover:text-[#161716] transition-colors duration-500 group-hover:translate-x-0.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button className="lg:hidden flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-[#d7bd83] hover:bg-white/5 transition-colors" aria-controls="main-nav" aria-expanded={false}>
              <span className="sr-only">Menú</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
          </div>
          
        </div>
      </header>
    </>
  );
}
