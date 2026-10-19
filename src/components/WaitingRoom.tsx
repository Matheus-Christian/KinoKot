import React from 'react';
import type { Room, RoomMember } from '../lib/types';
import { CatAvatar } from '../assets/cat-avatars';
import { sounds } from '../lib/soundEffects';
import { ShieldAlert, ArrowLeft, Hourglass, Film } from 'lucide-react';

interface WaitingRoomProps {
  room: Room;
  member: RoomMember;
  onCancel: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  room,
  member,
  onCancel
}) => {
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

        {/* Description box */}
        <div className="bg-cinema-950/80 border border-cinema-700 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Film className="w-4 h-4 text-gold-400" />
            <span>Código da Sala: <strong className="font-mono text-gold-400">{room.code}</strong></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Esta sala é privada. Uma notificação em tempo real foi enviada para os camaradas que já estão dentro do cinema. Assim que qualquer um deles autorizar sua entrada, a porta se abrirá automaticamente!
          </p>
        </div>

        {/* Radar Pulse Status */}
        <div className="flex items-center justify-center gap-3 py-3 px-4 bg-cinema-850 rounded-xl border border-cinema-700/60 mb-6">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <span className="text-xs text-slate-300 font-medium">
            Aguardando aprovação dos camaradas...
          </span>
        </div>

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
