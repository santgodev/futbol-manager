import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-background">
        {/* Subtle background glow */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)] pointer-events-none"></div>
        
        <div className="container relative z-10 mx-auto px-6 lg:px-8 max-w-7xl flex flex-col items-center text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-8 shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600 mr-2"></span>
            Enfoque Integral IDD
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[88px] font-medium tracking-tight text-foreground leading-[1.05] mb-6 max-w-4xl mx-auto font-serif">
            Un liderazgo claro <br />
            <span className="italic font-light text-black/80">para una vida brillante.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            Te acompañamos a organizar tus ideas, sanar tu entorno y desarrollar tu máximo potencial como líder — todo en un solo lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16 md:mb-24">
            <Link href="/psicologia" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              Comenzar tu proceso <span className="ml-2 font-serif italic text-white/70">→</span>
            </Link>
            <Link href="/nosotros" className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-white px-8 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              Conocer a los fundadores
            </Link>
          </div>

          {/* Premium Wide Showcase Image */}
          <div className="w-full max-w-6xl mx-auto">
            <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-black/5 bg-white">
              <img 
                src="/assets/images/2a75c86445f8.webp" 
                alt="Fabián Preciado junto a Jhon Maxwell" 
                className="w-full h-[400px] md:h-[600px] object-cover object-[50%_15%]"
              />
              
              {/* Optional: Floating glass overlay inside the image bottom for context */}
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 rounded-2xl border border-white/20 bg-white/20 backdrop-blur-md p-4 text-white shadow-2xl flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/30 text-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm leading-tight">Maxwell Leadership</h3>
                  <p className="text-xs text-white/80">Certificación Oficial</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Clean Grid Section replacing the 'orbiting' cards */}
      <section className="py-24 bg-white border-t border-border/50">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Feature 1 */}
            <div className="flex flex-col rounded-3xl border border-black/5 bg-background p-8 md:p-10 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <h3 className="font-serif text-3xl font-semibold mb-4 text-foreground">Psicología</h3>
              <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
                Terapia personal y familiar para organizar tus ideas, sanar tus relaciones y recuperar la claridad mental que necesitas.
              </p>
              <Link href="/psicologia" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700">
                Saber más <span className="ml-1">→</span>
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col rounded-3xl border border-black/5 bg-background p-8 md:p-10 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
              </div>
              <h3 className="font-serif text-3xl font-semibold mb-4 text-foreground">Formación</h3>
              <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
                Desarrolla tu máximo potencial como líder. Convierte tus ideas en acción bajo el método internacional de Maxwell Leadership.
              </p>
              <Link href="/formacion" className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                Saber más <span className="ml-1">→</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Pathways Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-gradient">Nuestras áreas de impacto</h2>
              <p className="text-muted-foreground text-lg">Soluciones integrales diseñadas para cada etapa de tu desarrollo.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pathway 1 */}
            <Link href="/psicologia" className="group relative rounded-2xl border border-border bg-background p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Psicología</h3>
              <p className="text-muted-foreground mb-6">Terapia individual, de parejas y familiar. Un espacio seguro para sanar integralmente.</p>
              <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                Saber más <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
            
            {/* Pathway 2 */}
            <Link href="/formacion" className="group relative rounded-2xl border border-border bg-background p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Formación</h3>
              <p className="text-muted-foreground mb-6">Capacitación en liderazgo bajo el método de Jhon Maxwell. Desarrolla tu máximo potencial.</p>
              <div className="flex items-center text-sm font-medium text-emerald-600 group-hover:text-emerald-700">
                Saber más <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
            
            {/* Pathway 3 */}
            <Link href="/asesorias" className="group relative rounded-2xl border border-border bg-background p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Asesorías</h3>
              <p className="text-muted-foreground mb-6">Consultoría para iglesias, colegios y empresas enfocadas en crecimiento y bienestar.</p>
              <div className="flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700">
                Saber más <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Books Preview Section */}
      <section className="py-32 bg-background border-t border-border">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-gradient">Liderazgo y crecimiento con principios y valores.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Descubre la colección de libros escritos por Fabián Preciado, diseñados para desafiarte, inspirarte y llevarte al siguiente nivel en tu desarrollo personal y como líder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            
            {/* Book 1 */}
            <article className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg transition-all">
              <div className="relative w-full aspect-[3/4] mb-8 overflow-hidden rounded-xl bg-secondary/50">
                <img 
                  src="/assets/images/f9be4d1483b5.webp" 
                  alt="El Decálogo del Líder IDD" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy" 
                />
              </div>
              <h3 className="text-2xl font-semibold mb-3 font-serif text-foreground">El Decálogo del Líder IDD</h3>
              <p className="text-muted-foreground mb-6 flex-grow">Principios para el cambio y la planificación. Una carta esencial para todo líder que desea hacer la diferencia.</p>
              
              <div className="mt-auto bg-secondary/50 rounded-lg p-4">
                <span className="block text-xs font-semibold uppercase tracking-wider text-primary mb-2">¿Por qué leerlo?</span>
                <p className="text-sm italic text-muted-foreground">Porque todo líder necesita una brújula que lo guíe hacia el éxito con valores sólidos.</p>
              </div>
            </article>

            {/* Book 2 */}
            <article className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg transition-all">
              <div className="relative w-full aspect-[3/4] mb-8 overflow-hidden rounded-xl bg-secondary/50">
                <img 
                  src="/assets/images/3ebde3bcf02b.webp" 
                  alt="31 Principios para crecer" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy" 
                />
              </div>
              <h3 className="text-2xl font-semibold mb-3 font-serif text-foreground">31 Principios para crecer</h3>
              <p className="text-muted-foreground mb-6 flex-grow">Hábitos que transforman. Este libro es una guía práctica para jóvenes que desean alcanzar su máximo potencial.</p>
              
              <div className="mt-auto bg-secondary/50 rounded-lg p-4">
                <span className="block text-xs font-semibold uppercase tracking-wider text-primary mb-2">¿Por qué leerlo?</span>
                <p className="text-sm italic text-muted-foreground">Porque el crecimiento comienza con pequeñas decisiones que hacen grandes diferencias.</p>
              </div>
            </article>

            {/* Book 3 */}
            <article className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg transition-all">
              <div className="relative w-full aspect-[3/4] mb-8 overflow-hidden rounded-xl bg-secondary/50">
                <img 
                  src="/assets/images/5d600f4fa019.webp" 
                  alt="Vive tu Llamado" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy" 
                />
              </div>
              <h3 className="text-2xl font-semibold mb-3 font-serif text-foreground">Vive tu Llamado</h3>
              <p className="text-muted-foreground mb-6 flex-grow">Propósito desde una perspectiva divina. Escrito para jóvenes que buscan descubrir el propósito de Dios.</p>
              
              <div className="mt-auto bg-secondary/50 rounded-lg p-4">
                <span className="block text-xs font-semibold uppercase tracking-wider text-primary mb-2">¿Por qué leerlo?</span>
                <p className="text-sm italic text-muted-foreground">Porque encontrar tu propósito transforma cada aspecto de tu vida.</p>
              </div>
            </article>

          </div>
          
          <div className="mt-16 text-center">
            <Link href="/libros" className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Ver todos los libros
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">Es momento de crecer integralmente.</h2>
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Da el siguiente paso hacia tu desarrollo personal y profesional. Agenda una cita o explora nuestros programas de formación.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contacto" className="inline-flex h-12 items-center justify-center rounded-md bg-white text-primary px-8 text-sm font-semibold shadow hover:bg-white/90">
              Contáctanos
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
