import React, { useState, useEffect } from 'react';
import type { UserSession } from '../lib/types';
import { CatAvatar, AVATAR_OPTIONS } from '../assets/cat-avatars';
import { saveSession } from '../lib/storage';
import { sounds } from '../lib/soundEffects';
import { Film, Lock, Globe, Sparkles, ArrowRight, Star, ShieldCheck, Key } from 'lucide-react';

interface RoomLobbyProps {
  session: UserSession;
  onUpdateSession: (newSession: UserSession) => void;
  onCreateRoom: (roomName: string, isPrivate: boolean, hostKey?: string) => Promise<void>;
  onJoinRoom: (roomCode: string, hostKey?: string) => Promise<void>;
  initialRoomCode?: string;
  loading: boolean;
  error: string | null;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  session,
  onUpdateSession,
  onCreateRoom,
  onJoinRoom,
  initialRoomCode = '',
  loading,
  error
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(initialRoomCode ? 'join' : 'create');
  
  // Profile state
  const [nickname, setNickname] = useState(session.nickname);
  const [selectedAvatar, setSelectedAvatar] = useState(session.avatar);

  // Room Create state
  const [roomName, setRoomName] = useState('Cinema Bolshoi');
  const [isPrivate, setIsPrivate] = useState(false);
  const [customHostKey, setCustomHostKey] = useState('');

  // Room Join state
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [joinHostKey, setJoinHostKey] = useState('');
  const [showHostKeyInput, setShowHostKeyInput] = useState(false);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode.toUpperCase());
      setActiveTab('join');
    }
  }, [initialRoomCode]);

  const handleAvatarChange = (avatarId: string) => {
    sounds.playClick();
    setSelectedAvatar(avatarId);
    const updated = { ...session, avatar: avatarId };
    saveSession(updated);
    onUpdateSession(updated);
  };

  const handleNicknameBlur = () => {
    if (nickname.trim() && nickname !== session.nickname) {
      const updated = { ...session, nickname: nickname.trim() };
      saveSession(updated);
      onUpdateSession(updated);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    sounds.playClick();
    await onCreateRoom(roomName.trim(), isPrivate, customHostKey.trim() || undefined);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    sounds.playClick();
    await onJoinRoom(roomCode.trim(), joinHostKey.trim() || undefined);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      
      {/* Decorative constructivist geometric elements */}
      <div className="w-full max-w-4xl mx-auto space-y-8">
        
        {/* Soviet Cinephile Hero Header */}
        <div className="text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-soviet-900/80 border border-gold-500/40 text-gold-400 text-xs font-mono tracking-widest uppercase mb-4 shadow-soviet-glow">
            <span className="text-gold-300">★</span> ESTÚDIO DE CINEMA COOPERATIVO <span className="text-gold-300">★</span>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-gold-400 p-0.5 bg-soviet-900 shadow-soviet-glow flex-shrink-0 animate-bob">
              <CatAvatar id={selectedAvatar} size="100%" />
            </div>
            <h1 className="font-russo text-4xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-soviet-500 via-gold-400 to-soviet-100 tracking-wider filter drop-shadow">
              КИНОКОТ
            </h1>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-gold-400 p-0.5 bg-soviet-900 shadow-soviet-glow flex-shrink-0 animate-bob">
              <CatAvatar id="cat-director" size="100%" />
            </div>
          </div>

          <p className="font-cinzel text-base sm:text-lg text-slate-300 tracking-wide max-w-2xl mx-auto">
            Avaliações coletivas, sessões compartilhadas e a implacável <span className="text-gold-400 font-bold">Roleta Russa de Filmes</span> guiada por camaradas felinos.
          </p>
        </div>

        {/* Profile Card: Avatar & Nickname Selection */}
        <div className="bg-cinema-900/90 border border-gold-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-soviet-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cinema-700">
            <div>
              <h2 className="font-russo text-lg text-gold-400 flex items-center gap-2">
                <Star className="w-4 h-4 fill-gold-400" />
                SEU PERFIL DE CAMARADA
              </h2>
              <p className="text-xs text-slate-400">Escolha sua identidade cinéfila para as sessões da sala</p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="nickname" className="text-xs font-semibold text-slate-300 whitespace-nowrap">
                Apelido:
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onBlur={handleNicknameBlur}
                maxLength={30}
                placeholder="Ex: Camarada Tarkovsky"
                className="bg-cinema-950 border border-cinema-600 focus:border-gold-500 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors w-48 sm:w-56 font-medium"
              />
            </div>
          </div>

          {/* Avatars Carousel */}
          <div className="pt-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">
              Selecione seu Gatinho Cinéfilo:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {AVATAR_OPTIONS.map((opt) => {
                const isSelected = selectedAvatar === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleAvatarChange(opt.id)}
                    className={`relative p-3 rounded-xl border flex flex-col items-center text-center transition-all group ${
                      isSelected
                        ? 'bg-soviet-950/80 border-gold-400 shadow-gold-glow scale-105'
                        : 'bg-cinema-850/60 border-cinema-700 hover:border-gold-500/50 hover:bg-cinema-800'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-2 -right-1 bg-gold-500 text-cinema-950 rounded-full p-0.5 shadow">
                        <Star className="w-3 h-3 fill-cinema-950" />
                      </span>
                    )}
                    <div className="w-14 h-14 mb-2 transform transition-transform group-hover:scale-110">
                      <CatAvatar id={opt.id} size={56} />
                    </div>
                    <span className="font-russo text-xs text-slate-200 tracking-wide group-hover:text-gold-300">
                      {opt.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate w-full">
                      {opt.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Room Action Tabs (Create or Join) */}
        <div className="bg-cinema-900/90 border border-gold-500/30 rounded-2xl p-5 sm:p-8 shadow-2xl">
          
          {/* Tab buttons */}
          <div className="flex border-b border-cinema-700 mb-6">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('create');
              }}
              className={`flex-1 pb-3 text-center font-russo text-sm sm:text-base tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 ${
                activeTab === 'create'
                  ? 'border-soviet-500 text-gold-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-4 h-4" />
              CRIAR SALA
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('join');
              }}
              className={`flex-1 pb-3 text-center font-russo text-sm sm:text-base tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 ${
                activeTab === 'join'
                  ? 'border-soviet-500 text-gold-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              ENTRAR EM SALA
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-soviet-950/80 border border-soviet-600 text-soviet-200 text-sm flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: CREATE ROOM */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Nome da Sala de Cinema:
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Ex: Cinema Potemkin, Auditório Tarkovsky"
                  required
                  maxLength={60}
                  className="w-full bg-cinema-950 border border-cinema-600 focus:border-gold-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition-colors font-medium text-base"
                />
              </div>

              {/* Room Access Mode: Public vs Private */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Modalidade de Acesso da Sala:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Public Room Option */}
                  <div
                    onClick={() => {
                      sounds.playClick();
                      setIsPrivate(false);
                    }}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      !isPrivate
                        ? 'bg-cinema-800/90 border-emerald-500/80 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                        : 'bg-cinema-950/60 border-cinema-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Globe className={`w-5 h-5 ${!isPrivate ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="font-russo text-sm text-slate-200">SALA PÚBLICA</span>
                      {!isPrivate && <span className="ml-auto text-xs text-emerald-400 font-bold">✓ Selecionada</span>}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Qualquer camarada com o código ou link da sala entra instantaneamente.
                    </p>
                  </div>

                  {/* Private Room Option (with Lobby & Authorization) */}
                  <div
                    onClick={() => {
                      sounds.playClick();
                      setIsPrivate(true);
                    }}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      isPrivate
                        ? 'bg-cinema-800/90 border-amber-500/80 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/50'
                        : 'bg-cinema-950/60 border-cinema-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Lock className={`w-5 h-5 ${isPrivate ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span className="font-russo text-sm text-slate-200">SALA PRIVADA</span>
                      {isPrivate && <span className="ml-auto text-xs text-amber-400 font-bold">✓ Selecionada</span>}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Novos membros aguardam na <strong className="text-amber-300">Fila de Espera</strong> até que um camarada dentro da sala autorize a entrada.
                    </p>
                  </div>
                </div>
              </div>

              {/* Optional Host Key input for private rooms */}
              {isPrivate && (
                <div className="bg-cinema-950/80 p-4 rounded-xl border border-amber-500/30 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      Chave Secreta do Anfitrião (PIN / Senha):
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Opcional</span>
                  </div>
                  <input
                    type="text"
                    value={customHostKey}
                    onChange={(e) => setCustomHostKey(e.target.value)}
                    placeholder="Ex: 1917 ou sua senha secreta (gerada se vazia)"
                    maxLength={30}
                    className="w-full bg-cinema-900 border border-cinema-700 focus:border-gold-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    🛡️ <strong>Garantia do Anfitrião:</strong> Se você sair da sala, fechar o navegador ou acessar de outro aparelho, use essa chave para recuperar o controle total do cinema instantaneamente!
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !roomName.trim()}
                className="w-full py-4 rounded-xl font-russo tracking-wider text-base sm:text-lg bg-gradient-to-r from-soviet-800 via-soviet-700 to-soviet-900 hover:from-soviet-700 hover:to-soviet-800 text-gold-300 border-2 border-gold-500/60 hover:border-gold-400 shadow-soviet-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-spin text-xl">⚙️</span>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-gold-400" />
                    CRIAR SALA SOVIÉTICA
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: JOIN ROOM */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoinSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Código da Sala de Cinema:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Ex: KOTT-1917"
                    required
                    maxLength={20}
                    className="w-full bg-cinema-950 border border-cinema-600 focus:border-gold-500 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-500 outline-none transition-colors font-mono tracking-widest text-lg font-bold uppercase"
                  />
                  <div className="absolute right-3 top-3.5 text-xs font-mono text-gold-500/80">
                    ID DA SALA
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Peça o código da sala ao camarada anfitrião ou utilize o link compartilhado.
                </p>
              </div>

              {/* Host Key Option */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowHostKeyInput(!showHostKeyInput)}
                  className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <Key className="w-3.5 h-3.5 text-gold-400" />
                  <span>{showHostKeyInput ? 'Ocultar Chave do Anfitrião' : 'Possui a Chave Secreta do Anfitrião? (Opcional)'}</span>
                </button>
                {showHostKeyInput && (
                  <div className="bg-cinema-950/80 p-3 rounded-xl border border-gold-500/30 space-y-1.5 animate-in fade-in">
                    <input
                      type="password"
                      value={joinHostKey}
                      onChange={(e) => setJoinHostKey(e.target.value)}
                      placeholder="Digite a Chave Secreta do Anfitrião..."
                      className="w-full bg-cinema-900 border border-cinema-700 focus:border-gold-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      Insira a chave caso seja o anfitrião acessando de outro dispositivo para entrar direto sem passar pela portaria.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-cinema-950/60 border border-cinema-700/80 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-gold-400">Como funciona o ingresso:</p>
                  <p>
                    Salas públicas concedem entrada imediata. Em salas privadas, você aguardará na portaria até que um camarada aprove seu ingresso em tempo real (ou use a Chave do Anfitrião).
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !roomCode.trim()}
                className="w-full py-4 rounded-xl font-russo tracking-wider text-base sm:text-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-cinema-950 font-black shadow-gold-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-spin text-xl">⚙️</span>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    ENTRAR NA SALA
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
