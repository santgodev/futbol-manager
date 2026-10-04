import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          <div className="flex flex-col">
            <Link className="inline-block mb-4" href="/">
              <span className="font-serif text-3xl font-bold tracking-tighter text-foreground">
                Preciado<span className="text-blue-600">.</span>
              </span>
              <span className="block text-[9px] font-semibold tracking-[0.2em] text-muted-foreground mt-1">
                FORMACIÓN Y SOLUCIONES
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-1">Te ayudamos a crecer integralmente.</p>
            <p className="text-xs text-muted-foreground/70">Fusagasugá · Cundinamarca</p>
          </div>
          
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-xs font-semibold tracking-wider uppercase text-foreground mb-2">Explora</p>
            <Link className="text-muted-foreground hover:text-blue-600 transition-colors" href="/formacion">Formación</Link>
            <Link className="text-muted-foreground hover:text-blue-600 transition-colors" href="/psicologia">Psicología</Link>
            <Link className="text-muted-foreground hover:text-blue-600 transition-colors" href="/kids">Kids</Link>
            <Link className="text-muted-foreground hover:text-blue-600 transition-colors" href="/jovenes">Jóvenes</Link>
          </div>
          
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-xs font-semibold tracking-wider uppercase text-foreground mb-2">Descubre</p>
            <Link className="text-muted-foreground hover:text-blue-600 transition-colors" href="/nosotros">Nosotros</Link>
            <Link className="text-muted-foreground hover:text-blue-600 transition-colors" href="/libros">Libros</Link>
            <Link className="text-muted-foreground hover:text-blue-600 transition-colors" href="/podcast">Preciado Podcast</Link>
            <Link className="text-muted-foreground hover:text-blue-600 transition-colors" href="/recursos">Recursos</Link>
          </div>
          
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-xs font-semibold tracking-wider uppercase text-foreground mb-2">Contáctanos</p>
            <a className="text-muted-foreground hover:text-blue-600 transition-colors" href="tel:+573144787072">(+57) 314 478 7072</a>
            <a className="text-muted-foreground hover:text-blue-600 transition-colors" href="tel:+573145445807">(+57) 314 544 5807</a>
            <a className="text-muted-foreground hover:text-blue-600 transition-colors" href="mailto:preciadofys@gmail.com">preciadofys@gmail.com</a>
            <a className="text-muted-foreground hover:text-blue-600 transition-colors flex items-center gap-1" href="https://www.youtube.com/@preciadofys" target="_blank" rel="noopener noreferrer">
              YouTube @preciadofys <span className="text-[10px]">↗</span>
            </a>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-border/50 text-xs text-muted-foreground/70">
          <span>&copy; {new Date().getFullYear()} Preciado Formación y Soluciones</span>
          <span>Consulta vigencia y disponibilidad.</span>
          <Link className="hover:text-blue-600 transition-colors" href="/archivo">Archivo visual</Link>
        </div>
      </div>
    </footer>
  );
}
