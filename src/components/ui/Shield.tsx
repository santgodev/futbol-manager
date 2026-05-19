export const Shield = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 120" className={className} fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M50 5 L90 25 L90 60 C90 90 50 115 50 115 C50 115 10 90 10 60 L10 25 Z" fill="currentColor" fillOpacity="0.05"/>
    <path d="M30 40 L70 40 M30 55 L70 55 M30 70 L70 70" strokeOpacity="0.2"/>
  </svg>
);
