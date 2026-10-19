import React, { useState, useEffect } from 'react';
import type { SearchMovieResult, Movie } from '../lib/types';
import { searchMovies } from '../lib/imdbApi';
import { sounds } from '../lib/soundEffects';
import { STREAMING_SERVICES } from '../lib/streamingServices';
import { Search, Film, Star, Plus, Check, X, Info, Tv, Link as LinkIcon } from 'lucide-react';

interface MovieSearchModalProps {
  existingMovies: Movie[];
  onAddMovie: (movieData: SearchMovieResult) => Promise<void>;
  onClose: () => void;
}

export const MovieSearchModal: React.FC<MovieSearchModalProps> = ({
  existingMovies,
  onAddMovie,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchMovieResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Streaming service selection state for the movie being added
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [streamUrl, setStreamUrl] = useState<string>('');

  useEffect(() => {
    // Initial load with curated classics
    loadResults('');
  }, []);

  // Debounced search as user types keywords
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const timer = setTimeout(() => {
      loadResults(trimmed);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const loadResults = async (q: string) => {
    setLoading(true);
    try {
      const activeKey = (import.meta.env.VITE_OMDB_API_KEY as string) || undefined;
      const data = await searchMovies(q, activeKey);
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    loadResults(query.trim());
  };

  const handleStartConfigure = (movie: SearchMovieResult) => {
    sounds.playClick();
    if (configuringId === movie.imdb_id) {
      setConfiguringId(null);
    } else {
      setConfiguringId(movie.imdb_id);
      setSelectedService('');
      setStreamUrl('');
    }
  };

  const handleQuickAdd = async (movie: SearchMovieResult) => {
    sounds.playClick();
    setAddingId(movie.imdb_id);
    try {
      await onAddMovie(movie);
      sounds.playVictory();
      setConfiguringId(null);
    } catch (err) {
      console.error('Error adding movie:', err);
      alert('Erro ao adicionar o filme. Tente novamente.');
    } finally {
      setAddingId(null);
    }
  };

  const handleConfirmAdd = async (movie: SearchMovieResult) => {
    sounds.playClick();
    setAddingId(movie.imdb_id);
    try {
      await onAddMovie({
        ...movie,
        stream_service: selectedService || undefined,
        stream_url: streamUrl.trim() || undefined
      });
      sounds.playVictory();
      setConfiguringId(null);
    } catch (err) {
      console.error('Error adding movie with stream config:', err);
      alert('Erro ao adicionar o filme. Tente novamente.');
    } finally {
      setAddingId(null);
    }
  };

  const isAlreadyAdded = (imdbId: string, title: string) => {
    return existingMovies.some(m => 
      (m.imdb_id && m.imdb_id === imdbId) || 
      m.title.toLowerCase() === title.toLowerCase()
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-3xl w-full bg-cinema-900 border border-gold-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cinema-700 bg-cinema-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-soviet-800/80 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-russo text-lg text-slate-100 tracking-wide flex items-center gap-2">
                BUSCAR NO CATÁLOGO CINEMATOGRÁFICO
              </h3>
              <p className="text-xs text-slate-400">
                Integração IMDb & Acervo Clássico Soviético e Mundial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-cinema-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-cinema-700 bg-cinema-900">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.length === 0) loadResults('');
              }}
              placeholder="Digite o título do filme, diretor ou palavra-chave (Ex: A Fantástica Fábrica, Poderoso Chefão, Duna...)"
              className="w-full bg-cinema-950 border border-cinema-600 focus:border-gold-500 rounded-xl pl-11 pr-24 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 px-4 py-1.5 bg-soviet-800 hover:bg-soviet-700 text-gold-300 font-russo text-xs rounded-lg border border-gold-500/40 transition-colors"
            >
              {loading ? '...' : 'BUSCAR'}
            </button>
          </form>

          {/* Quick preset tags */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs text-slate-400">
            <span className="text-gold-400 flex items-center gap-1 flex-shrink-0 font-medium">
              <Info className="w-3.5 h-3.5" /> Sugestões:
            </span>
            {['Stalker', 'Solaris', 'Potemkin', '2001', 'Blade Runner', 'Chihiro', 'Pulp Fiction', 'Parasita'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setQuery(tag);
                  loadResults(tag);
                }}
                className="px-2.5 py-0.5 rounded-full bg-cinema-800 hover:bg-cinema-700 hover:text-gold-300 border border-cinema-600 transition-colors flex-shrink-0"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin text-3xl mb-3">⚙️</div>
              <p className="font-russo text-gold-400 tracking-wide">BUSCANDO NO ARQUIVO CINEMATOGRÁFICO...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="font-medium">Nenhum filme encontrado para "{query}".</p>
              <p className="text-xs text-slate-500 mt-1">Tente pesquisar por outro título ou diretor.</p>
            </div>
          ) : (
            results.map((movie) => {
              const added = isAlreadyAdded(movie.imdb_id, movie.title);
              const isAdding = addingId === movie.imdb_id;
              const isConfiguring = configuringId === movie.imdb_id;

              return (
                <div
                  key={movie.imdb_id}
                  className={`bg-cinema-850 border rounded-xl p-3 sm:p-4 flex flex-col gap-4 transition-all ${
                    isConfiguring ? 'border-gold-400 shadow-gold-glow/20 ring-1 ring-gold-500/30' : 'border-cinema-700 hover:border-gold-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Poster */}
                    <div className="w-full sm:w-24 h-36 sm:h-36 flex-shrink-0 rounded-lg overflow-hidden bg-cinema-950 border border-cinema-700 relative shadow-md">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://placehold.co/300x450/1b1d26/facc15?text=${encodeURIComponent(movie.title.substring(0, 20))}`;
                        }}
                      />
                      <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-gold-400 flex items-center gap-0.5 border border-gold-500/30">
                        <Star className="w-2.5 h-2.5 fill-gold-400 text-gold-400" />
                        {movie.imdb_rating}
                      </div>
                    </div>

                    {/* Movie Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex flex-wrap items-baseline gap-2 mb-1">
                          <h4 className="font-russo text-base sm:text-lg text-slate-100 tracking-wide">
                            {movie.title}
                          </h4>
                          <span className="text-xs font-mono text-gold-400">
                            ({movie.year})
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mb-2">
                          <span>Direção: <strong className="text-slate-300">{movie.director}</strong></span>
                          <span>•</span>
                          <span>{movie.genre}</span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                          {movie.plot}
                        </p>
                      </div>

                      {/* Action button */}
                      <div className="mt-3 pt-2 border-t border-cinema-750 flex items-center justify-end">
                        {added ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                            <Check className="w-3.5 h-3.5" />
                            Já na Playlist
                          </span>
                        ) : isConfiguring ? null : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartConfigure(movie)}
                              className="px-2.5 py-1.5 text-slate-400 hover:text-gold-300 hover:bg-cinema-800 rounded-lg text-xs font-medium border border-cinema-700 hover:border-gold-500/40 transition-all flex items-center gap-1.5"
                              title="Indicar onde assistir (Netflix, link, etc.)"
                            >
                              <Tv className="w-3.5 h-3.5 text-gold-400/80" />
                              <span>Onde assistir?</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickAdd(movie)}
                              disabled={isAdding}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 font-russo text-xs rounded-lg border shadow-md transition-all transform active:scale-95 disabled:opacity-50 bg-gradient-to-r from-soviet-800 to-soviet-700 hover:from-soviet-700 text-gold-300 border-gold-500/40 hover:border-gold-400"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{isAdding ? 'Adicionando...' : 'Adicionar à Playlist'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* STREAMING SERVICE & LINK CONFIGURATION PANEL */}
                  {isConfiguring && (
                    <div className="mt-2 pt-3 border-t border-cinema-700/80 bg-cinema-950/60 rounded-xl p-3 sm:p-4 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-russo tracking-wide text-gold-400 flex items-center gap-1.5">
                          <Tv className="w-3.5 h-3.5 text-gold-400" />
                          ONDE ASSISTIR? (OPCIONAL)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Selecione o serviço ou cole um link
                        </span>
                      </div>

                      {/* Streaming Service Buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {STREAMING_SERVICES.map((srv) => {
                          const isSelected = selectedService === srv.id;
                          return (
                            <button
                              key={srv.id}
                              type="button"
                              onClick={() => {
                                sounds.playClick();
                                setSelectedService(isSelected ? '' : srv.id);
                                if (!streamUrl && !isSelected && srv.defaultUrl) {
                                  // Optional suggestion
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                                isSelected
                                  ? `${srv.bgColor} ${srv.textColor} ${srv.borderColor} ring-1 ring-gold-400 shadow-md`
                                  : 'bg-cinema-850 hover:bg-cinema-800 border-cinema-700 text-slate-300'
                              }`}
                            >
                              <span>{srv.name}</span>
                              {isSelected && <Check className="w-3 h-3 text-gold-400" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Direct Link Input */}
                      <div className="relative">
                        <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="url"
                          value={streamUrl}
                          onChange={(e) => setStreamUrl(e.target.value)}
                          placeholder="Link direto onde assistir (Ex: https://netflix.com/watch/...)"
                          className="w-full bg-cinema-900 border border-cinema-700 focus:border-gold-500 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setConfiguringId(null)}
                          className="px-3 py-1.5 bg-cinema-800 hover:bg-cinema-750 text-slate-400 hover:text-slate-200 text-xs rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleConfirmAdd(movie)}
                          disabled={isAdding}
                          className="px-4 py-1.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-cinema-950 font-black font-russo text-xs rounded-lg shadow-gold-glow flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isAdding ? 'ADICIONANDO...' : 'CONFIRMAR E ADICIONAR'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
