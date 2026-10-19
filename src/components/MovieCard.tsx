import React, { useState } from 'react';
import type { Movie, Review } from '../lib/types';
import { sounds } from '../lib/soundEffects';
import { getStreamingService } from '../lib/streamingServices';
import { createPosterPlaceholder } from '../lib/imdbApi';
import { Star, MessageSquare, CheckCircle, Clock, Trash2, Play, ExternalLink, Tv } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  reviews: Review[];
  onToggleStatus: (movieId: string, newStatus: 'pending' | 'watched') => Promise<void>;
  onOpenDetails: (movie: Movie) => void;
  onDelete: (movieId: string) => Promise<void>;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  reviews,
  onToggleStatus,
  onOpenDetails,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const isWatched = movie.status === 'watched';

  // Check if poster is a generated placeholder, svg, or missing, to dynamically wrap full title
  const isGeneratedPlaceholder = !movie.poster || 
    movie.poster === 'N/A' || 
    movie.poster.startsWith('data:image/svg+xml') || 
    movie.poster.includes('placehold.co');

  const posterSrc = isGeneratedPlaceholder
    ? createPosterPlaceholder(movie.title, movie.year)
    : movie.poster;

  // Streaming info
  const streamInfo = getStreamingService(movie.stream_service);
  const hasStreaming = Boolean(movie.stream_service || movie.stream_url);
  const streamTargetUrl = movie.stream_url || streamInfo?.defaultUrl || '';
  const streamLabel = streamInfo?.name || (movie.stream_url ? 'Link Direto' : 'Disponível');

  // Calculate average comrade rating
  const movieReviews = reviews.filter(r => r.movie_id === movie.id);
  const avgRating = movieReviews.length > 0
    ? (movieReviews.reduce((acc, r) => acc + r.rating, 0) / movieReviews.length).toFixed(1)
    : null;

  const handleStatusClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    const nextStatus = isWatched ? 'pending' : 'watched';
    await onToggleStatus(movie.id, nextStatus);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja remover "${movie.title}" da playlist da sala?`)) {
      sounds.playClick();
      setIsDeleting(true);
      try {
        await onDelete(movie.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div
      onClick={() => {
        sounds.playClick();
        onOpenDetails(movie);
      }}
      className={`group cursor-pointer bg-cinema-900 border rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col ${
        isWatched
          ? 'border-emerald-500/40 hover:border-emerald-400'
          : 'border-gold-500/30 hover:border-gold-400 hover:shadow-gold-glow/20'
      }`}
    >
      {/* Poster area with overlay badges */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-cinema-950">
        <img
          src={posterSrc}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = createPosterPlaceholder(movie.title, movie.year);
          }}
        />

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-transparent to-black/60 pointer-events-none" />

        {/* Status Badge */}
        <div className="absolute top-2.5 left-2.5">
          <button
            onClick={handleStatusClick}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-russo tracking-wide shadow-lg backdrop-blur-md transition-all ${
              isWatched
                ? 'bg-emerald-600/90 text-white border border-emerald-400 hover:bg-emerald-500'
                : 'bg-amber-600/90 text-amber-100 border border-amber-400 hover:bg-amber-500'
            }`}
            title="Clique para alternar status do filme"
          >
            {isWatched ? (
              <>
                <CheckCircle className="w-3 h-3 text-white" />
                <span>ASSISTIDO</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-amber-200" />
                <span>NA FILA</span>
              </>
            )}
          </button>
        </div>

        {/* Delete button on hover */}
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 hover:bg-soviet-800 text-slate-400 hover:text-soviet-200 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
          title="Remover filme da playlist"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Soviet/Russian Styled Watch Badge on Poster */}
        {hasStreaming && (
          <div className="absolute bottom-9 right-2 z-10">
            {streamTargetUrl ? (
              <a
                href={streamTargetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playClick();
                }}
                title={`Assistir em ${streamLabel} (Abrir link)`}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-soviet-950 via-soviet-900 to-soviet-800 border-2 border-gold-400 text-gold-300 shadow-soviet-glow hover:scale-105 hover:border-gold-300 transition-all font-russo text-[10px] tracking-wider uppercase group/play"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Play className="w-2.5 h-2.5 fill-gold-400 text-gold-400" />
                <span>СМОТРЕТЬ: {streamLabel}</span>
                <ExternalLink className="w-2.5 h-2.5 text-gold-400 opacity-70 group-hover/play:opacity-100" />
              </a>
            ) : (
              <span
                title={`Disponível em ${streamLabel}`}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-soviet-950 via-soviet-900 to-soviet-800 border-2 border-gold-400/80 text-gold-300 shadow-soviet-glow font-russo text-[10px] tracking-wider uppercase"
              >
                <Tv className="w-2.5 h-2.5 text-gold-400" />
                <span>{streamLabel}</span>
              </span>
            )}
          </div>
        )}

        {/* Ratings Pills on Poster Bottom */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {/* IMDb Rating */}
          <div className="flex items-center gap-1 bg-black/85 backdrop-blur-sm px-2 py-0.5 rounded-md border border-gold-500/40 text-[11px] font-bold text-gold-300">
            <span className="text-[9px] text-slate-400 font-mono">IMDb</span>
            <Star className="w-2.5 h-2.5 fill-gold-400 text-gold-400" />
            <span>{movie.imdb_rating || '7.8'}</span>
          </div>

          {/* KinoKott Camaradas Rating */}
          {avgRating ? (
            <div className="flex items-center gap-1 bg-soviet-950/90 backdrop-blur-sm px-2 py-0.5 rounded-md border border-soviet-500/60 text-[11px] font-bold text-soviet-200">
              <span className="text-gold-400 text-xs">★</span>
              <span>{avgRating}</span>
              <span className="text-[10px] text-slate-400">({movieReviews.length})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-cinema-900/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-cinema-700 text-[10px] text-slate-400">
              <MessageSquare className="w-2.5 h-2.5" />
              <span>Sem notas</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-baseline justify-between gap-1 mb-1">
            <h3 className="font-russo text-base text-slate-100 group-hover:text-gold-300 transition-colors line-clamp-2 break-words leading-snug">
              {movie.title}
            </h3>
            {movie.year && (
              <span className="text-xs font-mono text-gold-400 flex-shrink-0">
                {movie.year}
              </span>
            )}
          </div>

          {movie.director && (
            <p className="text-xs text-slate-400 truncate">
              Dir: <span className="text-slate-300">{movie.director}</span>
            </p>
          )}

          {movie.plot && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
              {movie.plot}
            </p>
          )}
        </div>

        {/* Card Footer: Added by comrade & Reviews trigger */}
        <div className="pt-2.5 border-t border-cinema-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0" title={`Adicionado por ${movie.added_by_name}`}>
            <span className="text-[10px] text-slate-500 font-mono">Por:</span>
            <span className="font-medium text-slate-300 truncate text-[11px]">
              {movie.added_by_name}
            </span>
          </div>

          <div className="flex items-center gap-1 text-gold-400 font-semibold group-hover:translate-x-0.5 transition-transform text-[11px]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{movieReviews.length} {movieReviews.length === 1 ? 'crítica' : 'críticas'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
