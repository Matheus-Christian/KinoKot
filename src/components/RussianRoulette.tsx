import React, { useState, useEffect, useRef } from 'react';
import type { Movie } from '../lib/types';
import { CatAvatar } from '../assets/cat-avatars';
import { sounds } from '../lib/soundEffects';
import confetti from 'canvas-confetti';
import { getStreamingService } from '../lib/streamingServices';
import { Sparkles, Film, Star, CheckCircle, RotateCcw, X, Play, ExternalLink } from 'lucide-react';

interface RussianRouletteProps {
  pendingMovies: Movie[];
  onMarkAsWatched: (movieId: string) => Promise<void>;
  onClose: () => void;
}

export const RussianRoulette: React.FC<RussianRouletteProps> = ({
  pendingMovies,
  onMarkAsWatched,
  onClose
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [winnerMovie, setWinnerMovie] = useState<Movie | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#E53935', '#FACC15', '#B71C1C', '#FFFFFF']
      });
    } catch (e) {
      console.warn('Confetti error', e);
    }
  };

  const startSpin = () => {
    if (pendingMovies.length === 0 || isSpinning) return;

    sounds.playClick();
    setIsSpinning(true);
    setWinnerMovie(null);

    const totalSteps = 25 + Math.floor(Math.random() * 15);
    let currentStep = 0;
    let delay = 60; // Initial fast speed
    let activeIdx = Math.floor(Math.random() * pendingMovies.length);

    const spinStep = () => {
      currentStep++;
      activeIdx = (activeIdx + 1) % pendingMovies.length;
      setCurrentIndex(activeIdx);

      // Pitch increases and ticks
      sounds.playReelTick(400 + (currentStep % 5) * 80);

      if (currentStep < totalSteps) {
        // Gradually slow down
        if (currentStep > totalSteps - 12) {
          delay += 40;
        } else if (currentStep > totalSteps - 6) {
          delay += 80;
        }
        timerRef.current = setTimeout(spinStep, delay);
      } else {
        // Spin finished!
        const selectedWinner = pendingMovies[activeIdx];
        setWinnerMovie(selectedWinner);
        setIsSpinning(false);
        sounds.playVictory();
        fireConfetti();
      }
    };

    spinStep();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const displayedMovie = winnerMovie || pendingMovies[currentIndex] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-2xl w-full bg-cinema-900 border-2 border-gold-500/60 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden text-center gold-border-corner">
        
        {/* Background soviet constructivist ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-soviet-700/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          disabled={isSpinning}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-cinema-800 transition-colors disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-soviet-950 border border-gold-500/50 text-gold-400 text-xs font-mono tracking-widest uppercase mb-3 shadow-soviet-glow">
          <span className="text-soviet-400">★</span> ROLETA RUSSA DO KINOKOTT <span className="text-soviet-400">★</span>
        </div>

        <h2 className="font-russo text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-soviet-100 to-gold-400 tracking-wider mb-2">
          SORTEIO REVOLUCIONÁRIO
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6">
          O Comitê Central Felino selecionará democraticamente a próxima obra para a sessão!
        </p>

        {/* No pending movies guard */}
        {pendingMovies.length === 0 ? (
          <div className="py-10 px-4 bg-cinema-850/80 rounded-2xl border border-cinema-700 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full border border-gold-500/40 p-1 bg-cinema-900">
              <CatAvatar id="cat-spy" size={72} />
            </div>
            <div className="space-y-1">
              <p className="font-russo text-base text-gold-400">FILA DE FILMES VAZIA!</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Todos os filmes já foram assistidos ou a playlist ainda não possui títulos pendentes. Adicione novos filmes para poder girar a roleta!
              </p>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-cinema-950 font-bold text-xs rounded-xl shadow-gold-glow transition-all"
            >
              Voltar à Playlist
            </button>
          </div>
        ) : (
          <div>
            
            {/* Roulette Drum / Film Reel Stage */}
            <div className={`relative mx-auto my-4 max-w-md bg-cinema-950 border-2 rounded-2xl p-4 sm:p-5 shadow-inner transition-all ${
              winnerMovie 
                ? 'border-gold-400 shadow-gold-glow ring-2 ring-gold-500/40' 
                : isSpinning 
                ? 'border-soviet-500 shadow-soviet-glow roulette-active' 
                : 'border-cinema-700'
            }`}>
              
              {/* Rotating Film Reels Header */}
              <div className="flex items-center justify-between px-3 pb-3 border-b border-cinema-800 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Film className={`w-4 h-4 text-gold-400 ${isSpinning ? 'animate-spin' : ''}`} />
                  CILINDRO: {pendingMovies.length} FILMES
                </span>
                <span className="text-gold-400 font-bold">
                  {isSpinning ? 'GIRANDO...' : winnerMovie ? '★ SORTEADO ★' : 'PRONTO'}
                </span>
              </div>

              {/* Displayed Movie Card in Reel */}
              {displayedMovie && (
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 text-left">
                  <div className="w-28 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-cinema-900 border border-cinema-700 relative shadow-xl">
                    <img
                      src={displayedMovie.poster}
                      alt={displayedMovie.title}
                      className={`w-full h-full object-cover transition-all ${isSpinning ? 'blur-[1px] scale-95' : 'scale-100'}`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/300x450/1b1d26/facc15?text=${encodeURIComponent(displayedMovie.title.substring(0, 20))}`;
                      }}
                    />
                    <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-gold-400 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-gold-400 text-gold-400" />
                      {displayedMovie.imdb_rating || '8.0'}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
                    <div className="inline-block px-2 py-0.5 bg-soviet-900/60 border border-soviet-600/40 rounded text-[10px] font-mono text-gold-400">
                      {displayedMovie.genre || 'Cinema Clássico'}
                    </div>
                    
                    <h3 className={`font-russo text-lg sm:text-xl tracking-wide truncate ${winnerMovie ? 'text-gold-300' : 'text-slate-100'}`}>
                      {displayedMovie.title}
                    </h3>

                    <p className="text-xs text-slate-400">
                      Ano: <strong className="text-slate-200">{displayedMovie.year}</strong> • Direção: <strong className="text-slate-200">{displayedMovie.director}</strong>
                    </p>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed pt-1">
                      {displayedMovie.plot}
                    </p>

                    <p className="text-[11px] text-slate-500 font-mono pt-1">
                      Adicionado por: <span className="text-gold-400/90">{displayedMovie.added_by_name}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Decorative Cat Cheerleaders */}
              <div className="absolute -bottom-5 -left-4 w-12 h-12">
                <CatAvatar id="cat-3d" size={44} />
              </div>
              <div className="absolute -bottom-5 -right-4 w-12 h-12">
                <CatAvatar id="cat-ushanka" size={44} />
              </div>

            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {!winnerMovie ? (
                <button
                  onClick={startSpin}
                  disabled={isSpinning}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-soviet-800 via-soviet-700 to-soviet-800 hover:from-soviet-700 hover:to-soviet-600 text-gold-300 border-2 border-gold-500 rounded-2xl font-russo text-base sm:text-lg tracking-wider shadow-soviet-glow transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-gold-400 animate-spin-slow" />
                  <span>{isSpinning ? 'GIRANDO O TAMBOR...' : 'GIRAR ROLETA RUSSA'}</span>
                </button>
              ) : (
                <>
                  {/* Direct Watch Button if Streaming is Configured */}
                  {(winnerMovie.stream_service || winnerMovie.stream_url) && (
                    <a
                      href={winnerMovie.stream_url || getStreamingService(winnerMovie.stream_service)?.defaultUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sounds.playClick()}
                      className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-soviet-800 to-soviet-700 hover:from-soviet-700 text-gold-300 font-russo text-sm rounded-xl border border-gold-400 shadow-soviet-glow flex items-center justify-center gap-2 transition-transform transform hover:scale-105 active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-gold-400 text-gold-400 animate-pulse" />
                      <span>ABRIR NO {getStreamingService(winnerMovie.stream_service)?.name.toUpperCase() || 'STREAMING'}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
                    </a>
                  )}

                  <button
                    onClick={async () => {
                      sounds.playClick();
                      await onMarkAsWatched(winnerMovie.id);
                      onClose();
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-russo text-sm rounded-xl shadow-lg transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>ASSISTIR AGORA (MARCAR VISTO)</span>
                  </button>

                  <button
                    onClick={startSpin}
                    disabled={isSpinning}
                    className="w-full sm:w-auto px-5 py-3.5 bg-cinema-800 hover:bg-cinema-750 text-gold-400 border border-cinema-600 hover:border-gold-500/50 rounded-xl font-russo text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>GIRAR NOVAMENTE</span>
                  </button>
                </>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
