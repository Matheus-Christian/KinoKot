import React from 'react';

export interface AvatarOption {
  id: string;
  name: string;
  title: string;
  description: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'cat-ushanka',
    name: 'Camarada Felix',
    title: 'Comissário do Cinema',
    description: 'Guardião dos clássicos soviéticos com sua leal ushanka.'
  },
  {
    id: 'cat-director',
    name: 'Diretor Eisenstein',
    title: 'Mestre da Montagem',
    description: 'Especialista em cortes de impacto e drama revolucionário.'
  },
  {
    id: 'cat-3d',
    name: 'Cinéfilo Yuri',
    title: 'Devorador de Pipoca',
    description: 'Nunca perde uma sessão, sempre munido de óculos 3D.'
  },
  {
    id: 'cat-cosmonaut',
    name: 'Cosmonauta Barsik',
    title: 'Explorador Sci-Fi',
    description: 'Apaixonado por Solaris, Tarkovsky e odisséias espaciais.'
  },
  {
    id: 'cat-babushka',
    name: 'Babushka Masha',
    title: 'Crítica Tradicional',
    description: 'Assiste a tudo com seu lenço vermelho e um chá quente.'
  },
  {
    id: 'cat-spy',
    name: 'Agente Murzik',
    title: 'Crítico Clandestino',
    description: 'Espião de festivais de cinema sob disfarce noir impecável.'
  }
];

export const CatAvatar: React.FC<{
  id: string;
  size?: number | string;
  className?: string;
}> = ({ id, size = 48, className = '' }) => {
  const sizeStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : { width: size, height: size };

  switch (id) {
    case 'cat-director':
      return (
        <svg viewBox="0 0 100 100" style={sizeStyle} className={`inline-block ${className}`} xmlns="http://www.w3.org/2000/svg">
          {/* Background circle */}
          <circle cx="50" cy="50" r="48" fill="#181922" stroke="#D4AF37" strokeWidth="3" />
          {/* Cat Ears */}
          <polygon points="25,42 16,14 42,28" fill="#2E313E" stroke="#D4AF37" strokeWidth="2" />
          <polygon points="75,42 84,14 58,28" fill="#2E313E" stroke="#D4AF37" strokeWidth="2" />
          {/* Head */}
          <ellipse cx="50" cy="54" rx="33" ry="29" fill="#22242E" />
          {/* Director Beret */}
          <path d="M18,32 C25,12 75,10 84,28 C86,34 76,40 50,38 C28,36 16,35 18,32 Z" fill="#B71C1C" stroke="#D4AF37" strokeWidth="2" />
          <circle cx="56" cy="18" r="3.5" fill="#FACC15" />
          {/* Viewfinder monocular glasses */}
          <circle cx="37" cy="51" r="11" fill="#0E0F14" stroke="#D4AF37" strokeWidth="2.5" />
          <circle cx="63" cy="51" r="11" fill="#0E0F14" stroke="#D4AF37" strokeWidth="2.5" />
          <line x1="48" y1="51" x2="52" y2="51" stroke="#D4AF37" strokeWidth="2.5" />
          {/* Cat eyes */}
          <circle cx="37" cy="51" r="4" fill="#FACC15" />
          <circle cx="63" cy="51" r="4" fill="#FACC15" />
          {/* Nose & mustache */}
          <polygon points="50,65 46,62 54,62" fill="#E53935" />
          <path d="M50,65 C48,70 43,72 38,72 M50,65 C52,70 57,72 62,72" stroke="#D4AF37" strokeWidth="2" fill="none" />
          {/* Megaphone motif */}
          <polygon points="80,68 94,60 94,78" fill="#B71C1C" stroke="#FACC15" strokeWidth="1.5" />
        </svg>
      );

    case 'cat-3d':
      return (
        <svg viewBox="0 0 100 100" style={sizeStyle} className={`inline-block ${className}`} xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#14151C" stroke="#D4AF37" strokeWidth="3" />
          {/* Cat Ears */}
          <polygon points="24,38 15,10 39,24" fill="#1B1D26" stroke="#D4AF37" strokeWidth="2" />
          <polygon points="76,38 85,10 61,24" fill="#1B1D26" stroke="#D4AF37" strokeWidth="2" />
          {/* Head */}
          <ellipse cx="50" cy="52" rx="34" ry="30" fill="#181920" />
          {/* 3D Glasses */}
          <rect x="20" y="42" width="26" height="20" rx="3" fill="#00E5FF" stroke="#FACC15" strokeWidth="3" opacity="0.9" />
          <rect x="54" y="42" width="26" height="20" rx="3" fill="#FF1744" stroke="#FACC15" strokeWidth="3" opacity="0.9" />
          <rect x="46" y="48" width="8" height="6" fill="#FACC15" />
          {/* Cat Nose & Mouth */}
          <polygon points="50,68 47,65 53,65" fill="#FACC15" />
          <path d="M50,68 C48,74 44,75 39,75 M50,68 C52,74 56,75 61,75" stroke="#FACC15" strokeWidth="1.8" fill="none" />
          {/* Popcorn bucket hint */}
          <path d="M35,82 L65,82 L61,98 L39,98 Z" fill="#B71C1C" stroke="#FACC15" strokeWidth="1.5" />
          <line x1="45" y1="82" x2="44" y2="98" stroke="#FFFFFF" strokeWidth="2" />
          <line x1="55" y1="82" x2="56" y2="98" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      );

    case 'cat-cosmonaut':
      return (
        <svg viewBox="0 0 100 100" style={sizeStyle} className={`inline-block ${className}`} xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#0D0E14" stroke="#D4AF37" strokeWidth="3" />
          {/* Cosmonaut Helmet Dome */}
          <circle cx="50" cy="50" r="40" fill="#1B1D26" stroke="#E5A93C" strokeWidth="3.5" />
          {/* Helmet Visor Inner */}
          <ellipse cx="50" cy="48" rx="28" ry="24" fill="#0B132B" stroke="#00E5FF" strokeWidth="1.5" />
          {/* Cat Inside Visor */}
          <polygon points="32,36 28,24 40,32" fill="#D4AF37" />
          <polygon points="68,36 72,24 60,32" fill="#D4AF37" />
          <ellipse cx="50" cy="48" rx="20" ry="17" fill="#E2E8F0" />
          {/* Big Wondering Eyes */}
          <circle cx="43" cy="46" r="4.5" fill="#0A0A0D" />
          <circle cx="45" cy="44.5" r="1.5" fill="#FFFFFF" />
          <circle cx="57" cy="46" r="4.5" fill="#0A0A0D" />
          <circle cx="59" cy="44.5" r="1.5" fill="#FFFFFF" />
          <polygon points="50,54 48,52 52,52" fill="#E53935" />
          {/* USSR (СССР) Text on Helmet */}
          <rect x="36" y="14" width="28" height="10" rx="3" fill="#B71C1C" stroke="#FACC15" strokeWidth="1" />
          <text x="50" y="22" fill="#FACC15" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">СССР</text>
        </svg>
      );

    case 'cat-babushka':
      return (
        <svg viewBox="0 0 100 100" style={sizeStyle} className={`inline-block ${className}`} xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#181922" stroke="#D4AF37" strokeWidth="3" />
          {/* Babushka Headscarf (Babushka scarf) */}
          <path d="M18,52 C15,22 85,22 82,52 C82,82 62,88 50,78 C38,88 18,82 18,52 Z" fill="#B71C1C" stroke="#D4AF37" strokeWidth="2.5" />
          {/* Polka dots on scarf */}
          <circle cx="28" cy="34" r="2.5" fill="#FACC15" />
          <circle cx="42" cy="24" r="2.5" fill="#FACC15" />
          <circle cx="58" cy="24" r="2.5" fill="#FACC15" />
          <circle cx="72" cy="34" r="2.5" fill="#FACC15" />
          <circle cx="24" cy="50" r="2.5" fill="#FACC15" />
          <circle cx="76" cy="50" r="2.5" fill="#FACC15" />
          {/* Cat face inside scarf */}
          <ellipse cx="50" cy="50" rx="22" ry="20" fill="#F1F5F9" />
          {/* Kind gentle eyes */}
          <path d="M38,47 Q43,43 47,47" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M53,47 Q57,43 62,47" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <polygon points="50,55 47,53 53,53" fill="#E11D48" />
          <path d="M50,55 C48,59 45,61 41,61 M50,55 C52,59 55,61 59,61" stroke="#475569" strokeWidth="1.5" fill="none" />
          {/* Scarf knot */}
          <circle cx="50" cy="74" r="5" fill="#D4AF37" stroke="#991B1B" strokeWidth="1.5" />
        </svg>
      );

    case 'cat-spy':
      return (
        <svg viewBox="0 0 100 100" style={sizeStyle} className={`inline-block ${className}`} xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#101118" stroke="#D4AF37" strokeWidth="3" />
          {/* Cat Ears */}
          <polygon points="26,42 20,16 42,28" fill="#181922" stroke="#64748B" strokeWidth="1.5" />
          <polygon points="74,42 80,16 58,28" fill="#181922" stroke="#64748B" strokeWidth="1.5" />
          {/* Fedora hat */}
          <ellipse cx="50" cy="35" rx="42" ry="8" fill="#1E293B" stroke="#D4AF37" strokeWidth="2" />
          <path d="M26,34 C28,14 72,14 74,34 Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="2" />
          <rect x="28" y="29" width="44" height="4" fill="#B71C1C" />
          {/* Head & Dark Sunglasses */}
          <ellipse cx="50" cy="56" rx="30" ry="26" fill="#334155" />
          {/* Sunglasses */}
          <polygon points="26,49 46,49 43,62 29,62" fill="#020617" stroke="#D4AF37" strokeWidth="2" />
          <polygon points="54,49 74,49 71,62 57,62" fill="#020617" stroke="#D4AF37" strokeWidth="2" />
          <line x1="46" y1="52" x2="54" y2="52" stroke="#D4AF37" strokeWidth="2.5" />
          {/* Nose & Whiskers */}
          <polygon points="50,68 47,65 53,65" fill="#FACC15" />
          <line x1="22" y1="67" x2="40" y2="69" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="78" y1="67" x2="60" y2="69" stroke="#94A3B8" strokeWidth="1.5" />
        </svg>
      );

    case 'cat-ushanka':
    default:
      return (
        <svg viewBox="0 0 100 100" style={sizeStyle} className={`inline-block ${className}`} xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#8B0000" stroke="#FACC15" strokeWidth="3" />
          {/* Cat Ears */}
          <polygon points="25,40 15,10 40,25" fill="#181920" stroke="#FACC15" strokeWidth="1.8" />
          <polygon points="75,40 85,10 60,25" fill="#181920" stroke="#FACC15" strokeWidth="1.8" />
          {/* Cat Face */}
          <ellipse cx="50" cy="55" rx="32" ry="28" fill="#1F2029" />
          {/* Ushanka Cap */}
          <path d="M22,32 C22,18 78,18 78,32 L78,42 C78,42 66,46 50,46 C34,46 22,42 22,42 Z" fill="#B71C1C" stroke="#FACC15" strokeWidth="2" />
          {/* Soviet Gold Star */}
          <polygon points="50,22 53,30 61,30 55,35 57,43 50,38 43,43 45,35 39,30 47,30" fill="#FACC15" />
          {/* 3D Cinema Glasses */}
          <rect x="26" y="47" width="20" height="15" rx="3" fill="#00D2FF" stroke="#FACC15" strokeWidth="2" opacity="0.9" />
          <rect x="54" y="47" width="20" height="15" rx="3" fill="#FF2A4D" stroke="#FACC15" strokeWidth="2" opacity="0.9" />
          <rect x="46" y="52" width="8" height="4" fill="#FACC15" />
          {/* Cat Nose & Whiskers */}
          <polygon points="50,67 47,64 53,64" fill="#FACC15" />
          <path d="M50,67 C48,72 45,74 41,74 M50,67 C52,72 55,74 59,74" stroke="#FACC15" strokeWidth="1.8" fill="none" />
          <line x1="20" y1="67" x2="38" y2="69" stroke="#EAB308" strokeWidth="1.5" />
          <line x1="22" y1="73" x2="38" y2="72" stroke="#EAB308" strokeWidth="1.5" />
          <line x1="80" y1="67" x2="62" y2="69" stroke="#EAB308" strokeWidth="1.5" />
          <line x1="78" y1="73" x2="62" y2="72" stroke="#EAB308" strokeWidth="1.5" />
        </svg>
      );
  }
};
