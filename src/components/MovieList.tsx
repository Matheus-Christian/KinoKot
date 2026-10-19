import React, { useState } from 'react';
import type { Movie, Review } from '../lib/types';
import { MovieCard } from './MovieCard';
import { CatAvatar } from '../assets/cat-avatars';
import { sounds } from '../lib/soundEffects';
import { Film, Clock, CheckCircle, Search, Sparkles } from 'lucide-react';

interface MovieListProps {
  movies: Movie[];
  reviews: Review[];
  onToggleStatus: (movieId: string, newStatus: 'pending' | 'watched') => Promise<void>;
  onOpenDetails: (movie: Movie) => void;
  onDeleteMovie: (movieId: string) => Promise<void>;
  onOpenAddMovie: () => void;
  onOpenRoulette: () => void;
}

export const MovieList: React.FC<MovieListProps> = ({
  movies,
  reviews,
  onToggleStatus,
  onOpenDetails,
  onDeleteMovie,
  onOpenAddMovie,
  onOpenRoulette
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'watched'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const pendingCount = movies.filter(m => m.status === 'pending').length;
  const watchedCount = movies.filter(m => m.status === 'watched').length;

  const filteredMovies = movies.filter(movie => {
    if (filter === 'pending' && movie.status !== 'pending') return false;
    if (filter === 'watched' && movie.status !== 'watched') return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        movie.title.toLowerCase().includes(q) ||
        (movie.director && movie.director.toLowerCase().includes(q)) ||
        (movie.genre && movie.genre.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Controls Bar: Filters + Search + Actions */}
      <div className="bg-cinema-900/90 border border-gold-500/30 rounded-2xl p-3 sm:p-5 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        
        {/* Filter Tabs (Responsive 3-Column Grid on Mobile, Flex on Desktop) */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-cinema-950 rounded-xl border border-cinema-700/80 w-full md:w-auto">
          <button
            onClick={() => {
              sounds.playClick();
              setFilter('all');
            }}
            className={`w-full justify-center px-1.5 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-russo tracking-wide transition-all flex items-center gap-1 sm:gap-1.5 ${
              filter === 'all'
                ? 'bg-soviet-800 text-gold-300 shadow-md border border-gold-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">TODOS ({movies.length})</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setFilter('pending');
            }}
            className={`w-full justify-center px-1.5 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-russo tracking-wide transition-all flex items-center gap-1 sm:gap-1.5 ${
              filter === 'pending'
                ? 'bg-amber-600/90 text-white shadow-md border border-amber-400/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">NA </span>FILA ({pendingCount})
            </span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setFilter('watched');
            }}
            className={`w-full justify-center px-1.5 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-russo tracking-wide transition-all flex items-center gap-1 sm:gap-1.5 ${
              filter === 'watched'
                ? 'bg-emerald-600/90 text-white shadow-md border border-emerald-400/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">ASSISTIDOS</span>
              <span className="sm:hidden">VISTOS</span> ({watchedCount})
            </span>
          </button>
        </div>

        {/* Search within playlist */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filtrar por título, diretor ou gênero..."
            className="w-full bg-cinema-950 border border-cinema-700 focus:border-gold-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors"
          />
        </div>

        {/* Quick Add and Roulette Buttons (Grid 2 cols on mobile, flex on desktop) */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenRoulette();
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 bg-gradient-to-r from-soviet-800 to-soviet-700 hover:from-soviet-700 hover:to-soviet-600 text-gold-300 font-russo text-xs rounded-xl border border-gold-500/40 shadow-soviet-glow transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-spin-slow flex-shrink-0" />
            <span className="whitespace-nowrap">ROLETA RUSSA</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenAddMovie();
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 bg-gold-500 hover:bg-gold-400 text-cinema-950 font-black font-russo text-xs rounded-xl shadow-gold-glow transition-all"
          >
            <span className="whitespace-nowrap">+ ADICIONAR FILME</span>
          </button>
        </div>

      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="bg-cinema-900/60 border border-cinema-750 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full border border-gold-500/40 p-1 bg-cinema-900 shadow-soviet-glow">
            <CatAvatar id="cat-director" size={88} />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-russo text-lg sm:text-xl text-gold-400 tracking-wider">
              {movies.length === 0 
                ? 'A PLAYLIST DA SALA AINDA ESTÁ VAZIA!' 
                : 'NENHUM FILME ENCONTRADO NESSE FILTRO'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
              {movies.length === 0
                ? 'Busque clássicos no catálogo IMDb para montar a sessão perfeita com os camaradas cinéfilos.'
                : 'Tente alterar os filtros de pesquisa ou volte para a visualização completa.'}
            </p>
          </div>

          {movies.length === 0 && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenAddMovie();
              }}
              className="px-6 py-3 bg-gradient-to-r from-soviet-800 to-soviet-700 hover:from-soviet-700 text-gold-300 font-russo text-xs rounded-xl border border-gold-500/50 shadow-soviet-glow transition-all transform hover:scale-105"
            >
              + BUSCAR E ADICIONAR FILMES
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              reviews={reviews}
              onToggleStatus={onToggleStatus}
              onOpenDetails={onOpenDetails}
              onDelete={onDeleteMovie}
            />
          ))}
        </div>
      )}

    </div>
  );
};
