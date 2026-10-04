import Link from 'next/link';
import Image from 'next/image';
import { AreaCards } from '@/components/AreaCards';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Maxwell hero — composition inspired by the supplied reference. */}
      <section className="maxwell-hero-shell" aria-labelledby="maxwell-title">
        <div className="maxwell-hero">
          <div className="maxwell-frame" aria-hidden="true" />
          
          <div className="maxwell-intro"><p>Fabián Preciado</p><span>Formación y Soluciones</span></div>
          <p className="maxwell-motto">Un liderazgo claro.<br />Una vida con propósito.</p>
          <h1 id="maxwell-title" className="maxwell-title">LIDERAZGO</h1>
          <figure className="maxwell-people">
            <Image src="/assets/images/maxwell-hero-cutout.png" alt="Fabián Preciado junto a John Maxwell" fill sizes="(max-width: 700px) 130vw, 85vw" preload />
          </figure>
          <div className="maxwell-signature"><span>Crecer para inspirar.</span><p>MAXWELL<br /><strong>LEADERSHIP</strong></p></div>
          <div className="maxwell-footer">
            <p>El liderazgo empieza en ti. Formación, principios y herramientas para crecer con intención e inspirar a quienes caminan contigo.</p>
            <div className="maxwell-actions"><a href="https://wa.me/573144787072" className="maxwell-cta">Conversemos <span aria-hidden="true">↗</span></a><a href="#areas-de-impacto" className="maxwell-discover">Explora nuestras áreas <span aria-hidden="true">↓</span></a></div>
          </div>
        </div>
      </section>

      <section id="areas-de-impacto" className="impact-section" aria-labelledby="impact-title">
        <div className="impact-section__inner">
          <div className="impact-heading">
            <div>
              <p className="impact-heading__eyebrow">Nuestras áreas de impacto</p>
              <h2 id="impact-title">Tu siguiente paso.<br /><em>Una nueva posibilidad.</em></h2>
            </div>
            <div className="impact-heading__aside">
              <p>Hay distintas formas de crecer. Encuentra el acompañamiento que conecta con el momento que estás viviendo.</p>
              <span className="impact-heading__note">Personas. Propósito. Posibilidades.</span>
            </div>
          </div>
          <AreaCards />
          <div className="impact-section__footnote">Tres caminos. Tu propio propósito.</div>
        </div>
      </section>

      {/* Books Preview Section (Dark) */}
      <section className="py-24 md:py-32 bg-[#1a1c1a] border-t border-[#d7bd83]/10 relative overflow-hidden">
        {/* Subtle decorative background blur */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] rounded-full bg-[#d7bd83]/5 blur-[120px] pointer-events-none"></div>

        <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight mb-6 text-[#e2dfd6]">Liderazgo y crecimiento con principios.</h2>
            <p className="text-lg text-[#e2dfd6]/60 leading-relaxed font-light">
              Descubre la colección de libros diseñados para desafiarte, inspirarte y llevarte al siguiente nivel en tu desarrollo personal y como líder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Dark Book 1 */}
            <article className="group flex flex-col rounded-[2rem] border border-white/5 bg-[#202220] p-6 shadow-lg hover:shadow-2xl hover:border-[#d7bd83]/30 hover:shadow-[#d7bd83]/5 transition-all duration-500">
              <div className="relative w-full aspect-[3/4] mb-8 overflow-hidden rounded-2xl bg-black/40">
                <img 
                  src="/assets/images/c866b636f609-small.webp" 
                  alt="El Decálogo del Líder IDD" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  loading="lazy" 
                />
              </div>
              <h3 className="text-2xl font-semibold mb-3 font-serif text-[#e2dfd6] group-hover:text-[#d7bd83] transition-colors">El Decálogo del Líder</h3>
              <p className="text-[#e2dfd6]/60 mb-8 flex-grow font-light text-sm">Principios para el cambio y la planificación. Una carta esencial para todo líder que desea hacer la diferencia.</p>
              
              <div className="mt-auto border-t border-white/5 pt-5 group-hover:border-[#d7bd83]/20 transition-colors">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#8e7b54] mb-2 group-hover:text-[#d7bd83] transition-colors">Por qué leerlo</span>
                <p className="text-sm italic text-[#e2dfd6]/50">Porque todo líder necesita una brújula que lo guíe hacia el éxito con valores sólidos.</p>
              </div>
            </article>

            {/* Dark Book 2 */}
            <article className="group flex flex-col rounded-[2rem] border border-white/5 bg-[#202220] p-6 shadow-lg hover:shadow-2xl hover:border-[#d7bd83]/30 hover:shadow-[#d7bd83]/5 transition-all duration-500">
              <div className="relative w-full aspect-[3/4] mb-8 overflow-hidden rounded-2xl bg-black/40">
                <img 
                  src="/assets/images/3ebde3bcf02b.webp" 
                  alt="31 Principios para crecer" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  loading="lazy" 
                />
              </div>
              <h3 className="text-2xl font-semibold mb-3 font-serif text-[#e2dfd6] group-hover:text-[#d7bd83] transition-colors">31 Principios para crecer</h3>
              <p className="text-[#e2dfd6]/60 mb-8 flex-grow font-light text-sm">Hábitos que transforman. Una guía práctica para quienes desean alcanzar su máximo potencial a través de la disciplina.</p>
              
              <div className="mt-auto border-t border-white/5 pt-5 group-hover:border-[#d7bd83]/20 transition-colors">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#8e7b54] mb-2 group-hover:text-[#d7bd83] transition-colors">Por qué leerlo</span>
                <p className="text-sm italic text-[#e2dfd6]/50">Porque el crecimiento comienza con pequeñas decisiones que hacen grandes diferencias.</p>
              </div>
            </article>

            {/* Dark Book 3 */}
            <article className="group flex flex-col rounded-[2rem] border border-white/5 bg-[#202220] p-6 shadow-lg hover:shadow-2xl hover:border-[#d7bd83]/30 hover:shadow-[#d7bd83]/5 transition-all duration-500">
              <div className="relative w-full aspect-[3/4] mb-8 overflow-hidden rounded-2xl bg-black/40">
                <img 
                  src="/assets/images/5d600f4fa019.webp" 
                  alt="Vive tu Llamado" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  loading="lazy" 
                />
              </div>
              <h3 className="text-2xl font-semibold mb-3 font-serif text-[#e2dfd6] group-hover:text-[#d7bd83] transition-colors">Vive tu Llamado</h3>
              <p className="text-[#e2dfd6]/60 mb-8 flex-grow font-light text-sm">Propósito desde una perspectiva divina. Escrito para aquellos que buscan descubrir y caminar en su vocación real.</p>
              
              <div className="mt-auto border-t border-white/5 pt-5 group-hover:border-[#d7bd83]/20 transition-colors">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#8e7b54] mb-2 group-hover:text-[#d7bd83] transition-colors">Por qué leerlo</span>
                <p className="text-sm italic text-[#e2dfd6]/50">Porque encontrar tu propósito transforma absolutamente cada aspecto de tu vida.</p>
              </div>
            </article>

          </div>
          
          <div className="mt-20 text-center">
            <Link href="/libros" className="inline-flex h-14 items-center justify-center rounded-full border border-white/10 bg-[#161716] px-10 text-sm font-semibold text-[#d7bd83] shadow-lg transition-all hover:bg-[#202220] hover:border-[#d7bd83]/50 hover:-translate-y-1">
              Ver todos los libros
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section (Dark Luxury Theme) */}
      <section className="py-32 bg-[#161716] text-[#e2dfd6] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(215,189,131,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(215,189,131,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#d7bd83]/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="container mx-auto px-6 lg:px-8 max-w-4xl text-center relative z-10">
          <span className="inline-block py-1 px-4 rounded-full border border-[#d7bd83]/30 bg-[#d7bd83]/10 text-[#d7bd83] text-xs font-semibold tracking-widest uppercase mb-8">
            El momento es ahora
          </span>
          <h2 className="font-serif text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-tight text-[#e2dfd6]">
            Es momento de crecer integralmente.
          </h2>
          <p className="text-lg md:text-xl text-[#e2dfd6]/70 mb-12 max-w-2xl mx-auto font-light">
            Da el siguiente paso hacia tu desarrollo personal y profesional. Agenda una cita o explora nuestros programas de formación exclusivos.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/contacto" className="inline-flex h-14 items-center justify-center rounded-full bg-[#d7bd83] text-[#161716] px-10 text-sm font-bold shadow-lg transition-transform hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(215,189,131,0.2)]">
              Conversemos
            </Link>
            <Link href="/formacion" className="inline-flex h-14 items-center justify-center rounded-full border border-[#d7bd83]/30 bg-transparent text-[#d7bd83] px-10 text-sm font-semibold transition-colors hover:bg-[#d7bd83]/10">
              Explorar programas
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

