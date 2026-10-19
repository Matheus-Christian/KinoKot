import React, { useState } from 'react';
import type { Movie, Review, UserSession } from '../lib/types';
import { CatAvatar } from '../assets/cat-avatars';
import { sounds } from '../lib/soundEffects';
import { getStreamingService } from '../lib/streamingServices';
import { createPosterPlaceholder } from '../lib/imdbApi';
import { Star, X, CheckCircle, Clock, MessageSquare, Send, Play, ExternalLink, Tv } from 'lucide-react';

interface MovieDetailModalProps {
  movie: Movie;
  reviews: Review[];
  session: UserSession;
  onAddReview: (rating: number, comment: string) => Promise<void>;
  onToggleStatus: (movieId: string, newStatus: 'pending' | 'watched') => Promise<void>;
  onClose: () => void;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  reviews,
  session,
  onAddReview,
  onToggleStatus,
  onClose
}) => {
  const isWatched = movie.status === 'watched';
  const movieReviews = reviews.filter(r => r.movie_id === movie.id);
  const existingUserReview = movieReviews.find(r => r.user_id === session.userId);

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

  // Review form state
  const [rating, setRating] = useState<number>(existingUserReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState(existingUserReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate average rating
  const avgRating = movieReviews.length > 0
    ? (movieReviews.reduce((sum, r) => sum + r.rating, 0) / movieReviews.length).toFixed(1)
    : null;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    sounds.playClick();
    setIsSubmitting(true);
    try {
      await onAddReview(rating, comment.trim());
      sounds.playVictory();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-3xl w-full bg-cinema-900 border-2 border-gold-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute right-4 top-4 z-10 p-2 rounded-full bg-black/70 hover:bg-soviet-800 text-slate-300 hover:text-white transition-colors backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Movie Hero Header with Backdrop & Poster */}
          <div className="relative bg-gradient-to-b from-soviet-950/90 to-cinema-900 p-5 sm:p-7 border-b border-cinema-750">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              
              {/* Poster */}
              <div className="w-28 sm:w-36 h-40 sm:h-52 rounded-xl overflow-hidden bg-cinema-950 border-2 border-gold-500/50 flex-shrink-0 shadow-2xl">
                <img
                  src={posterSrc}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = createPosterPlaceholder(movie.title, movie.year);
                  }}
                />
              </div>

              {/* Title & Stats */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-soviet-950/80 border border-gold-500/40 text-[11px] font-mono text-gold-400">
                    {movie.genre || 'Cinema'}
                  </span>
                  
                  {/* Status Button */}
                  <button
                    onClick={async () => {
                      sounds.playClick();
                      await onToggleStatus(movie.id, isWatched ? 'pending' : 'watched');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-russo tracking-wide shadow transition-all ${
                      isWatched
                        ? 'bg-emerald-600/90 text-white hover:bg-emerald-500'
                        : 'bg-amber-600/90 text-amber-100 hover:bg-amber-500'
                    }`}
                  >
                    {isWatched ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>ASSISTIDO</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>NA FILA (MARCAR VISTO)</span>
                      </>
                    )}
                  </button>
                </div>

                <h2 className="font-russo text-2xl sm:text-3xl text-slate-100 tracking-wide">
                  {movie.title}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span>Ano: <strong className="text-slate-200">{movie.year || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Direção: <strong className="text-slate-200">{movie.director || 'Desconhecido'}</strong></span>
                </div>

                {/* Ratings Badges */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-1.5 bg-black/70 border border-gold-500/40 px-3 py-1 rounded-lg text-xs font-bold text-gold-300">
                    <span className="font-mono text-slate-400">IMDb:</span>
                    <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                    <span>{movie.imdb_rating || '7.5'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-soviet-950 border border-soviet-600 px-3 py-1 rounded-lg text-xs font-bold text-soviet-200">
                    <span className="font-mono text-gold-400">Camaradas:</span>
                    <span className="text-gold-400">★</span>
                    <span>{avgRating ? `${avgRating} / 5` : 'Sem notas ainda'}</span>
                  </div>
                </div>

                {/* Streaming Watch Link / Indicator */}
                {hasStreaming && (
                  <div className="pt-2">
                    {streamTargetUrl ? (
                      <a
                        href={streamTargetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sounds.playClick()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-soviet-800 via-soviet-700 to-soviet-800 hover:from-soviet-700 hover:to-soviet-600 text-gold-300 border-2 border-gold-400 font-russo text-xs tracking-wider shadow-soviet-glow transition-all transform hover:scale-105 active:scale-95 group/stream"
                      >
                        <Play className="w-3.5 h-3.5 fill-gold-400 text-gold-400 animate-pulse" />
                        <span>ASSISTIR EM {streamLabel.toUpperCase()}</span>
                        <ExternalLink className="w-3 h-3 text-gold-400 opacity-75 group-hover/stream:opacity-100" />
                      </a>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cinema-800 border border-gold-500/40 text-gold-300 font-russo text-xs">
                        <Tv className="w-3.5 h-3.5 text-gold-400" />
                        <span>DISPONÍVEL EM: {streamLabel.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2">
                  {movie.plot}
                </p>

                <p className="text-[11px] text-slate-500 font-mono pt-1">
                  Adicionado por: <strong className="text-gold-400">{movie.added_by_name}</strong>
                </p>
              </div>

            </div>
          </div>

          {/* Reviews Section */}
          <div className="p-5 sm:p-7 space-y-6">
            
            {/* Review Input Box (Active if watched) */}
            <div className="bg-cinema-850 border border-cinema-700/80 rounded-2xl p-4 sm:p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-russo text-sm sm:text-base text-gold-400 flex items-center gap-2">
                  <Star className="w-4 h-4 fill-gold-400" />
                  {existingUserReview ? 'ATUALIZAR SUA AVALIAÇÃO' : 'AVALIAR ESTE FILME'}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {session.nickname}
                </span>
              </div>

              {!isWatched ? (
                <div className="py-4 text-center space-y-2 bg-cinema-900/60 rounded-xl border border-cinema-750 p-4">
                  <p className="text-xs text-slate-400">
                    Para avaliar e comentar este filme com seus camaradas, marque-o como <strong className="text-emerald-400">Assistido</strong>.
                  </p>
                  <button
                    onClick={async () => {
                      sounds.playClick();
                      await onToggleStatus(movie.id, 'watched');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-russo text-xs rounded-xl shadow transition-colors"
                  >
                    Marcar como Assistido Agora
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Star rating selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Sua Nota em Estrelas Soviéticas:
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const isFilled = (hoverRating !== null ? hoverRating : rating) >= starVal;
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onMouseEnter={() => setHoverRating(starVal)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => {
                              sounds.playClick();
                              setRating(starVal);
                            }}
                            className="p-1 transition-transform transform hover:scale-125 focus:outline-none"
                          >
                            <Star
                              className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                                isFilled
                                  ? 'fill-gold-400 text-gold-400 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]'
                                  : 'text-cinema-600'
                              }`}
                            />
                          </button>
                        );
                      })}
                      <span className="ml-3 font-russo text-base text-gold-400">
                        {rating} / 5
                      </span>
                    </div>
                  </div>

                  {/* Comment input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Resenha Crítica do Camarada:
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Compartilhe seus pensamentos sobre a montagem, atuações ou impacto dramático do filme..."
                      rows={3}
                      className="w-full bg-cinema-950 border border-cinema-600 focus:border-gold-500 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>

                  {/* Submit button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-gradient-to-r from-soviet-800 to-soviet-700 hover:from-soviet-700 text-gold-300 font-russo text-xs rounded-xl border border-gold-500/50 shadow-soviet-glow flex items-center gap-2 transition-transform transform active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Publicando...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{existingUserReview ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR RESENHA'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* List of Comrade Reviews */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-russo text-sm text-slate-200 tracking-wide flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gold-400" />
                  CRÍTICAS DOS CAMARADAS ({movieReviews.length})
                </h3>
                {avgRating && (
                  <span className="text-xs font-mono text-gold-400">
                    Consenso: ★ {avgRating}/5
                  </span>
                )}
              </div>

              {movieReviews.length === 0 ? (
                <div className="py-8 text-center bg-cinema-950/40 rounded-2xl border border-cinema-800 text-slate-500 text-xs">
                  Ainda não há avaliações registradas para este filme na sala. Seja o primeiro camarada a publicar sua crítica!
                </div>
              ) : (
                <div className="space-y-3">
                  {movieReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 bg-cinema-850 rounded-xl border border-cinema-750 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full border border-gold-500/40 p-0.5 bg-cinema-900">
                            <CatAvatar id={rev.user_avatar} size="100%" />
                          </div>
                          <div>
                            <span className="font-russo text-xs text-slate-200">
                              {rev.user_name}
                            </span>
                            {rev.user_id === session.userId && (
                              <span className="ml-1.5 text-[10px] text-gold-400 font-mono">(você)</span>
                            )}
                            <p className="text-[10px] text-slate-500 font-mono">
                              {new Date(rev.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating
                                  ? 'fill-gold-400 text-gold-400'
                                  : 'text-cinema-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.comment && (
                        <p className="text-xs text-slate-300 leading-relaxed pl-10">
                          "{rev.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
