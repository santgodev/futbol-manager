import Image from 'next/image';
import Link from 'next/link';
import './area-cards.css';

const areas = [
  {
    href: '/psicologia',
    image: '/assets/images/psicologia-editorial-v1.webp',
    tone: 'stone',
    invitation: 'Un espacio para ti.',
    alt: 'Retrato de la profesional de Psicología',
    category: 'Terapia y bienestar',
    title: 'Psicología',
    description: 'Un espacio seguro para sanar y crecer. Terapia individual, de pareja y familiar.',
    action: 'Agendar sesión',
  },
  {
    href: '/formacion',
    image: '/assets/images/formacion-editorial-v1.webp',
    tone: 'olive',
    invitation: 'Lidera con propósito.',
    alt: 'Fabián Preciado junto a John Maxwell',
    category: 'Liderazgo con propósito',
    title: 'Formación',
    description: 'Desarrolla tu potencial y el de tu equipo con el método de Maxwell Leadership.',
    action: 'Ver programas',
  },
  {
    href: '/asesorias',
    image: '/assets/images/asesorias-editorial-v1.webp',
    tone: 'graphite',
    invitation: 'Claridad para avanzar.',
    alt: 'Fabián y Sindy Preciado',
    category: 'Estrategia y crecimiento',
    title: 'Asesorías',
    description: 'Una visión clara para avanzar. Consultoría para iglesias, colegios y empresas.',
    action: 'Solicitar asesoría',
  },
];

export function AreaCards() {
  return (
    <div className="impact-cards">
      {areas.map((area, index) => (
        <Link href={area.href} className={`impact-card impact-card--${area.tone}`} key={area.href}>
          <div className="impact-card__portrait">
            <Image
              src={area.image}
              alt={area.alt}
              width={1448}
              height={1086}
              unoptimized
              className="impact-card__photo"
            />
          </div>
          <div className="impact-card__content">
            <p className="impact-card__category">0{index + 1} / {area.category}</p>
            <p className="impact-card__invitation">{area.invitation}</p>
            <h3 className="impact-card__title">{area.title}</h3>
            <p className="impact-card__description">{area.description}</p>
            <div className="impact-card__action">
              <span>{area.action}</span>
              <span className="impact-card__arrow" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 18 18 6M6 6h12v12" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
