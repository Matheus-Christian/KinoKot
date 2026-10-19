import React, { useState } from 'react';
import type { Room, RoomMember } from '../lib/types';
import { CatAvatar } from '../assets/cat-avatars';
import { sounds } from '../lib/soundEffects';
import { ShieldAlert, ArrowLeft, Hourglass, Film, Key, Lock, Unlock, AlertTriangle } from 'lucide-react';

interface WaitingRoomProps {
  room: Room;
  member: RoomMember;
  approvedMembersCount?: number;
  onClaimHost?: (key: string) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  room,
  member,
  approvedMembersCount = 1,
  onClaimHost,
  onCancel
}) => {
  const [showKeyModal, setShowKeyModal] = useState(approvedMembersCount === 0);
  const [hostKey, setHostKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isRoomEmpty = approvedMembersCount === 0;

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostKey.trim() || !onClaimHost) return;

    sounds.playClick();
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const result = await onClaimHost(hostKey.trim());
      if (!result.success) {
        setErrorMessage(result.error || 'Chave do anfitrião incorreta.');
        sounds.playWarning?.();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha ao autenticar anfitrião.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-cinema-900/95 border-2 border-amber-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center">
        
        {/* Glow ambient */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-soviet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Portaria Soviet Cinema Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase tracking-wider mb-6">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          PORTARIA DA SALA PRIVADA
        </div>

        {/* Animated Guard Cat */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="w-24 h-24 rounded-full border-2 border-amber-400/80 p-1 bg-cinema-850 shadow-gold-glow flex items-center justify-center animate-bob">
            <CatAvatar id={member.avatar} size={84} />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-cinema-950 p-1 rounded-full shadow-lg">
            <Hourglass className="w-4 h-4 animate-spin text-cinema-950" />
          </div>
        </div>

        {/* Member Greeting */}
        <h2 className="font-russo text-2xl text-slate-100 mb-1">
          {member.nickname}
        </h2>
        <p className="text-xs text-amber-400 font-mono tracking-wider uppercase mb-5">
          Fila de Espera • Sala: {room.name}
        </p>

        {/* Alert when room is currently completely empty */}
        {isRoomEmpty && (
          <div className="mb-5 p-3.5 rounded-xl bg-soviet-950/90 border border-soviet-600 text-left flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-soviet-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-bold text-soviet-300 font-russo">PORTARIA VAZIA!</p>
              <p className="text-slate-400 leading-relaxed">
                Não há nenhum camarada dentro da sala para autorizar sua entrada. Se você é o <strong>anfitrião</strong>, insira sua Chave Secreta abaixo para destrancar a sala.
              </p>
            </div>
          </div>
        )}

        {/* Description box */}
        <div className="bg-cinema-950/80 border border-cinema-700 rounded-xl p-4 mb-5 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Film className="w-4 h-4 text-gold-400" />
            <span>Código da Sala: <strong className="font-mono text-gold-400">{room.code}</strong></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isRoomEmpty 
              ? 'Para evitar que salas privadas se percam quando o anfitrião sai, você pode autenticar-se a qualquer momento com sua chave mestra.'
              : 'Esta sala é privada. Assim que um camarada dentro da sala autorizar sua entrada, a porta se abrirá automaticamente!'}
          </p>
        </div>

        {/* HOST KEY UNLOCK SECTION (To ensure rooms never get lost) */}
        {onClaimHost && (
          <div className="mb-5 pt-3 border-t border-cinema-700/80 text-left">
            {!showKeyModal && !isRoomEmpty ? (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowKeyModal(true);
                }}
                className="w-full py-2 px-3 rounded-lg bg-cinema-850 hover:bg-cinema-800 border border-cinema-700 text-xs text-gold-400 hover:text-gold-300 flex items-center justify-center gap-2 transition-colors font-medium"
              >
                <Key className="w-3.5 h-3.5 text-gold-400" />
                <span>É o anfitrião da sala? Destrancar com Chave</span>
              </button>
            ) : (
              <form onSubmit={handleKeySubmit} className="bg-cinema-950 p-3.5 rounded-xl border border-gold-500/40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-russo text-gold-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-gold-400" />
                    AUTENTICAÇÃO DO ANFITRIÃO
                  </span>
                  {!isRoomEmpty && (
                    <button
                      type="button"
                      onClick={() => setShowKeyModal(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      Ocultar
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={hostKey}
                    onChange={(e) => setHostKey(e.target.value)}
                    placeholder="Digite a Chave Secreta do Anfitrião..."
                    required
                    className="w-full bg-cinema-900 border border-cinema-700 focus:border-gold-500 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none font-mono"
                  />
                </div>

                {errorMessage && (
                  <p className="text-[11px] text-soviet-400 font-medium">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isVerifying || !hostKey.trim()}
                  className="w-full py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-cinema-950 font-black font-russo text-xs rounded-lg shadow-gold-glow flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Unlock className="w-3.5 h-3.5 text-cinema-950" />
                  <span>{isVerifying ? 'VERIFICANDO...' : 'DESTRANCAR E ENTRAR COMO ANFITRIÃO'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Radar Pulse Status (when waiting) */}
        {!isRoomEmpty && (
          <div className="flex items-center justify-center gap-3 py-3 px-4 bg-cinema-850 rounded-xl border border-cinema-700/60 mb-5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Aguardando aprovação dos camaradas...
            </span>
          </div>
        )}

        {/* Cancel Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onCancel();
          }}
          className="w-full py-2.5 rounded-xl border border-cinema-600 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancelar e Voltar ao Início
        </button>

      </div>
    </div>
  );
};
