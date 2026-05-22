export const Footer = () => {
  return (
    <footer className="py-24 max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
      <div className="flex flex-col gap-4 items-center md:items-start">
        <div className="flex items-center select-none opacity-30 hover:opacity-60 transition-opacity">
          <img 
            src="/logo.png" 
            alt="Pegasight Sport" 
            className="h-8 w-auto object-contain mix-blend-screen grayscale brightness-200"
          />
        </div>
        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-aqua/40">© 2026 Futbol Manager x Pegasight</span>
      </div>
      
      <div className="flex flex-col gap-8 items-center md:items-end">
        {/* Share Links */}
        <div className="flex gap-4">
          <span className="text-[10px] text-brand-aqua/50 uppercase tracking-[0.2em] mr-2">Compartir:</span>
          {['Facebook', 'X (Twitter)', 'WhatsApp', 'Telegram'].map(network => (
            <a key={network} href="#" className="text-[10px] font-bold tracking-[0.2em] text-brand-aqua hover:text-brand-teal transition-colors uppercase">
              {network}
            </a>
          ))}
        </div>
        <div className="flex gap-8 text-[10px] font-bold tracking-[0.3em] uppercase text-brand-aqua/60">
          <a href="#" className="hover:text-brand-sand transition-colors">Términos</a>
          <a href="#" className="hover:text-brand-sand transition-colors">Privacidad</a>
          <a href="#" className="hover:text-brand-sand transition-colors">Contacto</a>
        </div>
      </div>
    </footer>
  );
};
