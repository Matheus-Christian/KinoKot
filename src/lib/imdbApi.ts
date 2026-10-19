import type { SearchMovieResult } from './types';

// In-memory caches to avoid redundant network hits during active typing
const searchCache = new Map<string, SearchMovieResult[]>();
const omdbDetailCache = new Map<string, any>();

// Official Brazilian / Portuguese title mapping for beloved and frequently searched movies
const IMDB_ID_TO_PT_TITLE: Record<string, string> = {
  // A Fantástica Fábrica de Chocolate
  'tt0367594': 'A Fantástica Fábrica de Chocolate',
  'tt0067992': 'A Fantástica Fábrica de Chocolate',
  'tt6166392': 'Wonka',
  // O Poderoso Chefão
  'tt0068646': 'O Poderoso Chefão',
  'tt0071562': 'O Poderoso Chefão: Parte II',
  'tt0099674': 'O Poderoso Chefão: Parte III',
  // Ficção e Cinema Cult
  'tt0081505': 'O Iluminado',
  'tt0816692': 'Interestelar',
  'tt0110912': 'Pulp Fiction: Tempo de Violência',
  'tt6751668': 'Parasita',
  'tt0245429': 'A Viagem de Chihiro',
  'tt0137523': 'Clube da Luta',
  'tt0133093': 'Matrix',
  'tt0234215': 'Matrix Reloaded',
  'tt0242653': 'Matrix Revolutions',
  'tt0088763': 'De Volta para o Futuro',
  'tt0096895': 'De Volta para o Futuro 2',
  'tt0099088': 'De Volta para o Futuro 3',
  'tt0361748': 'Bastardos Inglórios',
  'tt0110357': 'O Rei Leão',
  'tt0468569': 'Batman: O Cavaleiro das Trevas',
  'tt1375666': 'A Origem',
  'tt7286456': 'Coringa',
  'tt0120737': 'O Senhor dos Anéis: A Sociedade do Anel',
  'tt0167261': 'O Senhor dos Anéis: As Duas Torres',
  'tt0167260': 'O Senhor dos Anéis: O Retorno do Rei',
  'tt0076759': 'Star Wars: Uma Nova Esperança',
  'tt0080684': 'Star Wars: O Império Contra-Ataca',
  'tt0086190': 'Star Wars: O Retorno de Jedi',
  'tt0111161': 'Um Sonho de Liberdade',
  'tt0109830': 'Forrest Gump: O Contador de Histórias',
  'tt0120689': 'À Espera de um Milagre',
  'tt0102926': 'O Silêncio dos Inocentes',
  'tt0108052': 'A Lista de Schindler',
  'tt0172495': 'Gladiador',
  'tt0120338': 'Titanic',
  'tt0107290': 'Jurassic Park: O Parque dos Dinossauros',
  'tt0114709': 'Toy Story: Um Mundo de Aventuras',
  'tt0103064': 'O Exterminador do Futuro 2: O Julgamento Final',
  'tt0088247': 'O Exterminador do Futuro',
  'tt0482571': 'O Grande Truque',
  'tt0993846': 'O Lobo de Wall Street',
  'tt0848228': 'Os Vingadores',
  'tt4154756': 'Vingadores: Guerra Infinita',
  'tt4154796': 'Vingadores: Ultimato',
  'tt6710474': 'Tudo em Todo o Lugar ao Mesmo Tempo',
  'tt15239678': 'Duna: Parte 2',
  'tt1160419': 'Duna',
  'tt0271383': 'O Auto da Compadecida',
  'tt0317248': 'Cidade de Deus',
  'tt0861739': 'Tropa de Elite',
  'tt1555149': 'Tropa de Elite 2',
  'tt0127536': 'Central do Brasil',
  'tt0119217': 'Gênio Indomável',
  'tt0095765': 'Cinema Paradiso',
  'tt1392190': 'Mad Max: Estrada da Fúria',
  'tt0110413': 'O Profissional (Léon)',
  'tt0120586': 'O Show de Truman',
  'tt0114814': 'Os Suspeitos',
  'tt0050083': '12 Homens e uma Sentença',
  'tt0119698': 'Princesa Mononoke'
};

// Title aliases for keyword / localized queries
const TITLE_ALIASES: Record<string, string> = {
  'a fantastica fabrica': 'Charlie and the Chocolate Factory',
  'a fantastica fabrica de chocolate': 'Charlie and the Chocolate Factory',
  'fabrica de chocolate': 'Charlie and the Chocolate Factory',
  'tudo em todo o lugar ao mesmo tempo': 'Everything Everywhere All at Once',
  'tudo em qualquer lugar ao mesmo tempo': 'Everything Everywhere All at Once',
  'tudo em todo lugar': 'Everything Everywhere All at Once',
  'tudo em qualquer lugar': 'Everything Everywhere All at Once',
  'o poderoso chefao': 'The Godfather',
  'o poderoso chefão': 'The Godfather',
  'o poderoso chefao 2': 'The Godfather Part II',
  'o iluminado': 'The Shining',
  'a viagem de chihiro': 'Spirited Away',
  'clube da luta': 'Fight Club',
  'interestelar': 'Interstellar',
  'parasita': 'Parasite',
  'bastardos inglorios': 'Inglourious Basterds',
  'bastardos inglórios': 'Inglourious Basterds',
  'matrix': 'The Matrix',
  'duna': 'Dune',
  'duna 2': 'Dune: Part Two',
  'duna parte 2': 'Dune: Part Two',
  'o senhor dos aneis': 'The Lord of the Rings',
  'o senhor dos anéis': 'The Lord of the Rings',
  'pulp fiction': 'Pulp Fiction',
  'o encouraçado potemkin': 'Battleship Potemkin',
  'o encouracado potemkin': 'Battleship Potemkin',
  'va e veja': 'Come and See',
  'vá e veja': 'Come and See',
  'o espelho': 'The Mirror',
  'homem com a camera': 'The Man with a Movie Camera',
  'moscou nao acredita em lagrimas': 'Moscow Does Not Believe in Tears',
  'moscou não acredita em lágrimas': 'Moscow Does Not Believe in Tears',
  'cinema paradiso': 'Cinema Paradiso',
  'apocalypse now': 'Apocalypse Now',
};

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapTitle(text: string): { lines: string[]; fontSize: number; lineHeight: number } {
  const clean = (text || '').trim();
  const len = clean.length;

  let fontSize = 20;
  let lineHeight = 26;
  let maxChars = 16;

  if (len > 50) {
    fontSize = 13;
    lineHeight = 17;
    maxChars = 26;
  } else if (len > 30) {
    fontSize = 15;
    lineHeight = 20;
    maxChars = 21;
  } else if (len > 15) {
    fontSize = 17;
    lineHeight = 23;
    maxChars = 18;
  } else {
    fontSize = 20;
    lineHeight = 26;
    maxChars = 16;
  }

  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (word.length > maxChars) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
      for (let i = 0; i < word.length; i += maxChars) {
        lines.push(word.slice(i, i + maxChars));
      }
    } else if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + ' ' + word).length <= maxChars) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  return { lines: lines.length > 0 ? lines : [clean || 'FILME'], fontSize, lineHeight };
}

// Generates an elegant SVG poster with complete wrapped title if an image is missing
export function createPosterPlaceholder(title: string, year?: string): string {
  const { lines, fontSize, lineHeight } = wrapTitle(title);
  
  // Center lines vertically in the title region between y=210 and y=345
  const totalTextHeight = (lines.length - 1) * lineHeight;
  const startY = Math.round(270 - totalTextHeight / 2);

  const tspans = lines.map((line, idx) => {
    const lineY = startY + idx * lineHeight;
    return `<tspan x="150" y="${lineY}">${escapeXml(line)}</tspan>`;
  }).join('\n    ');

  const cleanYear = escapeXml((year || 'CINEMA').toString().trim());

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="300" height="450">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1c1917"/>
        <stop offset="50%" stop-color="#141110"/>
        <stop offset="100%" stop-color="#0a0a0d"/>
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#facc15"/>
        <stop offset="100%" stop-color="#ca8a04"/>
      </linearGradient>
      <linearGradient id="emblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#991b1b"/>
        <stop offset="100%" stop-color="#580e0e"/>
      </linearGradient>
    </defs>
    <rect width="300" height="450" fill="url(#bg)"/>
    <rect x="14" y="14" width="272" height="422" rx="10" fill="none" stroke="#ca8a04" stroke-width="2" stroke-dasharray="8 4" opacity="0.6"/>
    <rect x="18" y="18" width="264" height="414" rx="8" fill="none" stroke="#78350f" stroke-width="1" opacity="0.4"/>
    <circle cx="150" cy="140" r="48" fill="url(#emblemGrad)" stroke="#facc15" stroke-width="3"/>
    <polygon points="150,105 158,128 181,128 163,142 170,165 150,150 130,165 137,142 119,128 142,128" fill="#FACC15"/>
    <text x="150" font-family="'Russo One', Impact, sans-serif" font-weight="900" font-size="${fontSize}" fill="url(#gold)" text-anchor="middle" letter-spacing="0.5">
    ${tspans}
    </text>
    <text x="150" y="375" font-family="'Russo One', sans-serif" font-weight="bold" font-size="13" fill="#cbd5e1" text-anchor="middle" letter-spacing="1.5">
      ★ KINOKOTT CINEMA ★
    </text>
    <text x="150" y="402" font-family="monospace" font-size="12" fill="#eab308" text-anchor="middle" letter-spacing="1">
      (${cleanYear})
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Curated collection of verified active posters from OMDb / Soviet and World Classics
const CURATED_CINEMA_ARCHIVE: SearchMovieResult[] = [
  {
    title: 'Stalker',
    year: '1979',
    poster: 'https://m.media-amazon.com/images/M/MV5BMDIzMDRiYjgtM2U1Yy00MjlhLTliODMtM2E5NDI5Njc3YmZkXkEyXkFqcGc@._V1_QL75_UY562_CR7,0,380,562_.jpg',
    plot: 'Um guia conduz dois homens através da misteriosa "Zona", uma área restrita e pós-apocalíptica onde supostamente existe um quarto que realiza os desejos mais íntimos de quem nele entrar.',
    genre: 'Drama, Sci-Fi',
    director: 'Andrei Tarkovsky',
    imdb_id: 'tt0079944',
    imdb_rating: '8.0'
  },
  {
    title: 'Solaris',
    year: '1972',
    poster: 'https://m.media-amazon.com/images/M/MV5BYTYyMjU4MjItYzZkNy00NmIyLTg1ZGEtYTY5ZTEyM2U2NDM2XkEyXkFqcGc@._V1_QL75_UY562_CR9,0,380,562_.jpg',
    plot: 'Um psicólogo é enviado a uma estação espacial orbitando o planeta oceânico Solaris para investigar a loucura da tripulação, mas passa a ser visitado pela manifestação física de sua falecida esposa.',
    genre: 'Drama, Mystery, Sci-Fi',
    director: 'Andrei Tarkovsky',
    imdb_id: 'tt0069293',
    imdb_rating: '7.9'
  },
  {
    title: 'Vá e Veja (Come and See)',
    year: '1985',
    poster: 'https://m.media-amazon.com/images/M/MV5BNDlkZmVkZDAtZGFmMS00OWIzLWJkY2YtNWE5NjNhNjhiZGE3XkEyXkFqcGc@._V1_QL75_UX380_CR0,10,380,562_.jpg',
    plot: 'Na Bielorrússia durante a Segunda Guerra Mundial, um jovem aldeão junta-se à resistência partisana e testemunha os horrores indescritíveis e a devastação implacável da invasão.',
    genre: 'Drama, War',
    director: 'Elem Klimov',
    imdb_id: 'tt0091251',
    imdb_rating: '8.3'
  },
  {
    title: 'O Encouraçado Potemkin',
    year: '1925',
    poster: 'https://m.media-amazon.com/images/M/MV5BMTEyMTQzMjQ0MTJeQTJeQWpwZ15BbWU4MDcyMjg4OTEx._V1_QL75_UY562_CR9,0,380,562_.jpg',
    plot: 'Em 1905, os marinheiros do navio de guerra russo Potemkin se rebelam contra oficiais tirânicos, desencadeando uma revolução popular em Odessa.',
    genre: 'History, Drama, War',
    director: 'Sergei Eisenstein',
    imdb_id: 'tt0015648',
    imdb_rating: '7.9'
  },
  {
    title: 'O Espelho (Zerkalo)',
    year: '1975',
    poster: 'https://m.media-amazon.com/images/M/MV5BNjRhNzYxODAtOTFmMS00N2MxLWE0NGMtM2VkZGY5MTYwYTZlXkEyXkFqcGc@._V1_QL75_UY562_CR7,0,380,562_.jpg',
    plot: 'Um homem moribundo relembra seu passado, a infância na Rússia rural, sua mãe, a guerra e os momentos poéticos que definiram sua existência.',
    genre: 'Biography, Drama',
    director: 'Andrei Tarkovsky',
    imdb_id: 'tt0072443',
    imdb_rating: '7.9'
  },
  {
    title: 'Moscou Não Acredita em Lágrimas',
    year: '1980',
    poster: 'https://m.media-amazon.com/images/M/MV5BZGMyYzhiMGYtNmJjZi00ODdjLWIxMGEtNzVhZDMzMWYxYmQ5XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    plot: 'A história comovente de três amigas da província que chegam a Moscou em busca de sonhos, amor e carreiras ao longo de duas décadas.',
    genre: 'Comedy, Drama, Romance',
    director: 'Vladimir Menshov',
    imdb_id: 'tt0079579',
    imdb_rating: '8.0'
  },
  {
    title: '2001: Uma Odisséia no Espaço',
    year: '1968',
    poster: 'https://m.media-amazon.com/images/M/MV5BNjU0NDFkMTQtZWY5OS00MmZhLTg3Y2QtZmJhMzMzMWYyYjc2XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    plot: 'Após a descoberta de um misterioso monólito na Lua, uma espaçonave parte em direção a Júpiter com a inteligência artificial HAL 9000.',
    genre: 'Adventure, Sci-Fi',
    director: 'Stanley Kubrick',
    imdb_id: 'tt0062622',
    imdb_rating: '8.3'
  },
  {
    title: 'Blade Runner 2049',
    year: '2017',
    poster: 'https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    plot: 'O jovem blade runner K descobre um segredo há muito enterrado que tem o potencial de mergulhar o que resta da sociedade no caos e o leva até Rick Deckard.',
    genre: 'Action, Drama, Mystery, Sci-Fi',
    director: 'Denis Villeneuve',
    imdb_id: 'tt1856101',
    imdb_rating: '8.0'
  },
  {
    title: 'A Viagem de Chihiro',
    year: '2001',
    poster: 'https://m.media-amazon.com/images/M/MV5BNTEyNmEwOWUtYzkyOC00ZTQ4LTllZmUtMjk0Y2YwOGUzYjRiXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    plot: 'Durante a mudança de sua família, uma menina de 10 anos vagueia por um mundo governado por deuses e espíritos, onde seus pais são transformados em porcos.',
    genre: 'Animation, Adventure, Family',
    director: 'Hayao Miyazaki',
    imdb_id: 'tt0245429',
    imdb_rating: '8.6'
  },
  {
    title: 'Pulp Fiction: Tempo de Violência',
    year: '1994',
    poster: 'https://m.media-amazon.com/images/M/MV5BYTViYTE3ZGQtNDBlMC00ZTAyLTkyODMtZGRiZDg0MjA2YThkXkEyXkFqcGc@._V1_QL75_UY562_CR3,0,380,562_.jpg',
    plot: 'As vidas de dois assassinos da máfia, um boxeador, a esposa de um gângster e dois bandidos de lanchonete se entrelaçam em quatro contos de violência e redenção.',
    genre: 'Crime, Drama',
    director: 'Quentin Tarantino',
    imdb_id: 'tt0110912',
    imdb_rating: '8.8'
  },
  {
    title: 'Parasita (Parasite)',
    year: '2019',
    poster: 'https://m.media-amazon.com/images/M/MV5BYjk1Y2U4MjQtY2ZiNS00OWQyLWI3MmYtZWUwNmRjYWRiNWNhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    plot: 'A ganância e a discriminação de classe ameaçam a recém-formada relação simbiótica entre a abastada família Park e o clã empobrecido de Kim.',
    genre: 'Drama, Thriller',
    director: 'Bong Joon Ho',
    imdb_id: 'tt6751668',
    imdb_rating: '8.5'
  },
  {
    title: 'O Grande Hotel Budapeste',
    year: '2014',
    poster: 'https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    plot: 'Um escritor encontra o proprietário de um hotel decadente que relata seus primeiros anos servindo como mensageiro para um concierge lendário.',
    genre: 'Adventure, Comedy, Crime',
    director: 'Wes Anderson',
    imdb_id: 'tt2278388',
    imdb_rating: '8.1'
  },
  {
    title: 'Interestelar (Interstellar)',
    year: '2014',
    poster: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    plot: 'Quando a Terra se torna inóspita no futuro, um ex-piloto da NASA é encarregado de pilotar uma espaçonave através de um buraco de minhoca em busca de um novo lar.',
    genre: 'Adventure, Drama, Sci-Fi',
    director: 'Christopher Nolan',
    imdb_id: 'tt0816692',
    imdb_rating: '8.7'
  },
  {
    title: 'O Poderoso Chefão',
    year: '1972',
    poster: 'https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_QL75_UY562_CR8,0,380,562_.jpg',
    plot: 'O patriarca de uma dinastia do crime organizado de Nova York transfere o controle de seu império clandestino para seu filho mais novo e relutante.',
    genre: 'Crime, Drama',
    director: 'Francis Ford Coppola',
    imdb_id: 'tt0068646',
    imdb_rating: '9.2'
  },
  {
    title: 'Duna: Parte 2',
    year: '2024',
    poster: 'https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    plot: 'Paul Atreides se une a Chani e aos Fremen em busca de vingança contra os conspiradores que destruíram sua família.',
    genre: 'Action, Adventure, Drama, Sci-Fi',
    director: 'Denis Villeneuve',
    imdb_id: 'tt15239678',
    imdb_rating: '8.4'
  },
  {
    title: 'Tudo em Todo o Lugar ao Mesmo Tempo',
    year: '2022',
    poster: 'https://m.media-amazon.com/images/M/MV5BOWNmMzAzZmQtNDQ1NC00Nzk5LTkyMmUtNGI2N2NkOWM4MzEyXkEyXkFqcGc@._V1_QL75_UY562_CR4,0,380,562_.jpg',
    plot: 'Uma imigrante chinesa de meia-idade é envolvida em uma aventura insana onde só ela pode salvar o multiverso se conectando com as vidas que poderia ter vivido.',
    genre: 'Action, Adventure, Comedy, Sci-Fi',
    director: 'Daniel Kwan, Daniel Scheinert',
    imdb_id: 'tt6710474',
    imdb_rating: '7.7'
  },
  {
    title: 'O Iluminado (The Shining)',
    year: '1980',
    poster: 'https://m.media-amazon.com/images/M/MV5BNmM5ZThhY2ItOGRjOS00NzZiLWEwYTItNDgyMjFkOTgxMmRiXkEyXkFqcGc@._V1_QL75_UX380_CR0,8,380,562_.jpg',
    plot: 'Uma família ruma para um hotel isolado durante o inverno, onde uma presença sinistra influencia o pai para a loucura.',
    genre: 'Drama, Horror',
    director: 'Stanley Kubrick',
    imdb_id: 'tt0081505',
    imdb_rating: '8.4'
  },
  {
    title: 'Cinema Paradiso',
    year: '1988',
    poster: 'https://m.media-amazon.com/images/M/MV5BMTljNzc4YWEtYTZlMS00ODMyLWIwMTAtNWQxY2VkMDEwYTk5XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    plot: 'Um cineasta relembra sua infância quando se apaixonou pelas imagens em movimento no cinema de sua vila natal e formou uma amizade profunda com o projecionista.',
    genre: 'Drama, Romance',
    director: 'Giuseppe Tornatore',
    imdb_id: 'tt0095765',
    imdb_rating: '8.5'
  },
  {
    title: 'Apocalypse Now',
    year: '1979',
    poster: 'https://m.media-amazon.com/images/M/MV5BZDhiMTljYjYtODc1Yy00MmEwLTg2OTYtYmE1YTRmNDE4MmEwXkEyXkFqcGc@._V1_QL75_UX380_CR0,11,380,562_.jpg',
    plot: 'Durante a Guerra do Vietnã, um capitão do exército americano é enviado em uma missão secreta para assassinar um coronel renegado que enlouqueceu na selva cambojana.',
    genre: 'Drama, Mystery, War',
    director: 'Francis Ford Coppola',
    imdb_id: 'tt0078788',
    imdb_rating: '8.4'
  }
];

// Helper to remove accents and special characters for search matching
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches movies by keyword, title, director or partial name in Portuguese or English.
 * Uses IMDb's high-speed suggestion index combined with OMDb details and Soviet curated archive.
 */
export async function searchMovies(query: string, omdbApiKey?: string): Promise<SearchMovieResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return CURATED_CINEMA_ARCHIVE.slice(0, 8);
  }

  const normalized = normalizeText(cleanQuery);
  const cacheKey = normalized;

  // Check in-memory search cache
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  // 1. Check local Curated Archive matches
  const localMatches = CURATED_CINEMA_ARCHIVE.filter(movie => {
    const t = normalizeText(movie.title);
    const d = movie.director ? normalizeText(movie.director) : '';
    const g = movie.genre ? normalizeText(movie.genre) : '';
    return t.includes(normalized) || d.includes(normalized) || g.includes(normalized);
  });

  const apiKey = omdbApiKey || (typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_OMDB_API_KEY as string | undefined) : undefined);

  // 2. Query IMDb Suggestion API
  // IMDb suggestion engine natively supports Portuguese alternative titles (e.g. "a fantástica fábrica")
  // and returns Amazon/IMDb canonical IDs (tt...) with high-res poster links and years.
  try {
    const suggestionQuery = normalized.replace(/\s+/g, ' ');
    const imdbUrl = `https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(suggestionQuery)}.json`;
    
    const response = await fetch(imdbUrl);
    if (response.ok) {
      const data = await response.json();
      const rawList = Array.isArray(data.d) ? data.d : [];
      
      // Filter only title entries (starts with 'tt') to omit person/actor cards ('nm...')
      const titleItems = rawList.filter((item: any) => 
        item.id && typeof item.id === 'string' && item.id.startsWith('tt')
      );

      if (titleItems.length > 0) {
        // Take top 6 title results
        const topItems = titleItems.slice(0, 6);

        // Enrich with OMDb details (synopsis, director, IMDb rating) in parallel
        const enriched = await Promise.all(
          topItems.map(async (item: any) => {
            let omdbData: any = null;

            // Check OMDb detail cache
            if (omdbDetailCache.has(item.id)) {
              omdbData = omdbDetailCache.get(item.id);
            } else if (apiKey) {
              try {
                const omdbRes = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${item.id}`);
                if (omdbRes.ok) {
                  omdbData = await omdbRes.json();
                  if (omdbData && omdbData.Response === 'True') {
                    omdbDetailCache.set(item.id, omdbData);
                  }
                }
              } catch (e) {
                // Silently fallback to IMDb suggestion data
              }
            }

            // Determine display title: prioritize official Portuguese title mapping
            const ptTitle = IMDB_ID_TO_PT_TITLE[item.id];
            const originalTitle = (omdbData && omdbData.Title) || item.l || cleanQuery;
            let finalTitle = originalTitle;

            if (ptTitle) {
              if (originalTitle.toLowerCase().includes(ptTitle.toLowerCase())) {
                finalTitle = originalTitle;
              } else {
                finalTitle = `${ptTitle} (${originalTitle})`;
              }
            }

            // Best poster image: OMDb > IMDb Suggestion > Custom Poster
            const posterUrl = (omdbData && omdbData.Poster && omdbData.Poster !== 'N/A')
              ? omdbData.Poster
              : (item.i && item.i.imageUrl)
              ? item.i.imageUrl
              : createPosterPlaceholder(finalTitle, (omdbData?.Year || item.y || 'CINEMA').toString());

            const yearStr = (omdbData && omdbData.Year)
              ? omdbData.Year
              : (item.y ? item.y.toString() : 'Cinema');

            const plotText = (omdbData && omdbData.Plot && omdbData.Plot !== 'N/A')
              ? omdbData.Plot
              : (item.s ? `Estrelando: ${item.s}. Obra cinematográfica do acervo IMDb.` : 'Obra cinematográfica do acervo mundial.');

            const directorText = (omdbData && omdbData.Director && omdbData.Director !== 'N/A')
              ? omdbData.Director
              : (item.s ? `Elenco: ${item.s}` : 'Cineasta');

            const genreText = (omdbData && omdbData.Genre && omdbData.Genre !== 'N/A')
              ? omdbData.Genre
              : (item.q === 'feature' ? 'Filme' : 'Cinema');

            const ratingText = (omdbData && omdbData.imdbRating && omdbData.imdbRating !== 'N/A')
              ? omdbData.imdbRating
              : '7.5';

            return {
              title: finalTitle,
              year: yearStr,
              poster: posterUrl,
              plot: plotText,
              genre: genreText,
              director: directorText,
              imdb_id: item.id,
              imdb_rating: ratingText
            };
          })
        );

        // Combine with any local matches from curated archive (deduplicating by imdb_id or title)
        const combined = [...localMatches];
        for (const movie of enriched) {
          if (!combined.some(m => m.imdb_id === movie.imdb_id || m.title.toLowerCase() === movie.title.toLowerCase())) {
            combined.push(movie);
          }
        }

        if (combined.length > 0) {
          searchCache.set(cacheKey, combined);
          return combined;
        }
      }
    }
  } catch (err) {
    console.warn('IMDb suggestion search failed, attempting OMDb fallback:', err);
  }

  // 3. Fallback: Direct OMDb search by keyword
  if (apiKey) {
    const alias = TITLE_ALIASES[normalized] || null;
    const termsToTry = [alias, cleanQuery].filter(Boolean) as string[];

    for (const term of termsToTry) {
      try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(term)}&type=movie`);
        const data = await response.json();

        if (data.Response === 'True' && Array.isArray(data.Search) && data.Search.length > 0) {
          const detailed = await Promise.all(
            data.Search.slice(0, 5).map(async (item: { imdbID: string; Title: string; Year: string; Poster: string }) => {
              try {
                const dRes = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${item.imdbID}`);
                const d = await dRes.json();
                const ptTitle = IMDB_ID_TO_PT_TITLE[item.imdbID];
                const originalTitle = d.Title || item.Title;
                const finalTitle = ptTitle && !originalTitle.toLowerCase().includes(ptTitle.toLowerCase())
                  ? `${ptTitle} (${originalTitle})`
                  : originalTitle;

                const posterUrl = (d.Poster && d.Poster !== 'N/A')
                  ? d.Poster
                  : (item.Poster && item.Poster !== 'N/A')
                  ? item.Poster
                  : createPosterPlaceholder(finalTitle, d.Year || item.Year);

                return {
                  title: finalTitle,
                  year: d.Year || item.Year,
                  poster: posterUrl,
                  plot: d.Plot && d.Plot !== 'N/A' ? d.Plot : 'Obra cinematográfica do catálogo IMDb.',
                  genre: d.Genre && d.Genre !== 'N/A' ? d.Genre : 'Cinema',
                  director: d.Director && d.Director !== 'N/A' ? d.Director : 'Cineasta',
                  imdb_id: item.imdbID,
                  imdb_rating: d.imdbRating && d.imdbRating !== 'N/A' ? d.imdbRating : '7.5'
                };
              } catch {
                return {
                  title: item.Title,
                  year: item.Year,
                  poster: item.Poster && item.Poster !== 'N/A' ? item.Poster : createPosterPlaceholder(item.Title, item.Year),
                  plot: 'Obra cinematográfica do catálogo IMDb.',
                  genre: 'Cinema',
                  director: 'Cineasta',
                  imdb_id: item.imdbID,
                  imdb_rating: '7.5'
                };
              }
            })
          );

          if (detailed.length > 0) {
            searchCache.set(cacheKey, detailed);
            return detailed;
          }
        }
      } catch (e) {
        console.warn('OMDb fallback error', e);
      }
    }
  }

  // 4. Return local matches if any were found
  if (localMatches.length > 0) {
    searchCache.set(cacheKey, localMatches);
    return localMatches;
  }

  // 5. Ultimate fallback for custom or arbitrary titles: generate a stylish unique Soviet poster
  const fallbackResults: SearchMovieResult[] = [
    {
      title: cleanQuery,
      year: new Date().getFullYear().toString(),
      poster: createPosterPlaceholder(cleanQuery, new Date().getFullYear().toString()),
      plot: `Obra cinematográfica "${cleanQuery}" adicionada pelos camaradas para a sessão do KinoKott.`,
      genre: 'Drama / Cinema',
      director: 'Camarada Cineasta',
      imdb_id: 'kott_' + Math.floor(100000 + Math.random() * 900000),
      imdb_rating: '8.0'
    },
    ...CURATED_CINEMA_ARCHIVE.slice(0, 4)
  ];

  return fallbackResults;
}
