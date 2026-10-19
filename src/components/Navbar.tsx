import React, { useState, useEffect, useRef } from 'react';
import type { Room, RoomMember } from '../lib/types';
import { CatAvatar } from '../assets/cat-avatars';
import { sounds } from '../lib/soundEffects';
import { getSoundEnabled, setSoundEnabled } from '../lib/storage';
import { 
  Volume2, 
  VolumeX, 
  Share2, 
  Check, 
  Users, 
  Lock, 
  Globe, 
  LogOut, 
  ShieldAlert,
  UserX,
  Key
} from 'lucide-react';

interface NavbarProps {
  room: Room;
  currentMember: RoomMember;
  members: RoomMember[];
  pendingMembersCount: number;
  onOpenPendingModal: () => void;
  onLeaveRoom: () => void;
  onRemoveMember: (memberId: string) => Promise<void>;
}

export const Navbar: React.FC<NavbarProps> = ({
  room,
  currentMember,
  members,
  pendingMembersCount,
  onOpenPendingModal,
  onLeaveRoom,
  onRemoveMember
}) => {
  const [copied, setCopied] = useState(false);
  const [soundOn, setSoundOn] = useState(getSoundEnabled());
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!showMembersDropdown) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMembersDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMembersDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMembersDropdown]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) sounds.playClick();
  };

  const copyRoomLink = () => {
    sounds.playClick();
    const url = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const approvedMembers = members.filter(m => m.status === 'approved');

  return (
    <header className="sticky top-0 z-40 bg-cinema-900/95 backdrop-blur-md border-b border-soviet-800/60 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Room Title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative group cursor-pointer flex-shrink-0" onClick={() => sounds.playClick()}>
              <div className="w-12 h-12 rounded-full border-2 border-gold-500 overflow-hidden shadow-soviet-glow bg-soviet-900 flex items-center justify-center transition-transform transform group-hover:scale-105">
                <CatAvatar id="cat-ushanka" size={44} />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-soviet-600 border border-gold-400 text-[8px] font-bold text-gold-300 items-center justify-center">★</span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-russo tracking-wider text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-soviet-100 via-gold-400 to-soviet-500 truncate">
                  КИНОКОТ
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-soviet-950/80 text-gold-400 border border-gold-500/30 rounded">
                  KinoKott
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                <span className="font-medium text-slate-200 truncate">{room.name}</span>
                <span className="text-slate-600">•</span>
                <button 
                  onClick={copyRoomLink}
                  title="Clique para copiar código ou link"
                  className="flex items-center gap-1 font-mono text-gold-400 hover:text-gold-300 transition-colors bg-cinema-800 px-2 py-0.5 rounded border border-cinema-700 hover:border-gold-500/50"
                >
                  <span>{room.code}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3 text-gold-500" />}
                </button>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  {room.is_private ? (
                    <span className="flex items-center gap-0.5 text-amber-400" title="Sala Privada com Portaria">
                      <Lock className="w-3 h-3" /> Privada
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-emerald-400" title="Sala Pública">
                      <Globe className="w-3 h-3" /> Pública
                    </span>
                  )}
                </span>
                {room.host_key && currentMember.role === 'host' && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      navigator.clipboard.writeText(room.host_key!);
                      alert(`Chave Secreta do Anfitrião copiada: ${room.host_key}\n\nGuarde esta chave! Com ela você pode destrancar e recuperar o controle total desta sala em qualquer dispositivo ou navegador.`);
                    }}
                    title="Chave Secreta do Anfitrião (Clique para copiar)"
                    className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 transition-colors"
                  >
                    <Key className="w-2.5 h-2.5 text-amber-400" />
                    <span>Chave: {room.host_key}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Center */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Waiting Room Alert for Host/Comrades */}
            {pendingMembersCount > 0 && (
              <button
                onClick={onOpenPendingModal}
                className="relative flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/60 rounded-lg text-xs font-semibold animate-bounce transition-all shadow-lg"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Portaria:</span>
                <span className="bg-amber-500 text-cinema-950 font-black px-1.5 py-0.2 rounded-full text-[11px]">
                  {pendingMembersCount}
                </span>
              </button>
            )}


            {/* Members dropdown toggle */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowMembersDropdown(!showMembersDropdown);
                }}
                className="flex items-center gap-1.5 p-2 bg-cinema-800 hover:bg-cinema-700 text-slate-300 rounded-lg border border-cinema-600 text-xs transition-colors"
                title="Camaradas na sala"
              >
                <Users className="w-4 h-4 text-gold-400" />
                <span className="font-mono text-xs text-gold-400 font-bold">{approvedMembers.length}</span>
              </button>

              {/* Members Popover */}
              {showMembersDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-cinema-900 border border-gold-500/30 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-cinema-700 pb-2 mb-2">
                    <span className="font-russo text-xs text-gold-400 tracking-wider">CAMARADAS PRESENTES</span>
                    <span className="text-[10px] text-slate-400 font-mono">{approvedMembers.length} camaradas</span>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {approvedMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-1.5 rounded-lg bg-cinema-800/60 border border-cinema-700/50 hover:border-cinema-600 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <CatAvatar id={member.avatar} size={28} />
                          <div className="truncate">
                            <p className="text-xs font-medium text-slate-200 truncate">
                              {member.nickname} {member.user_id === currentMember.user_id && <span className="text-gold-400 text-[10px]">(você)</span>}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {member.role === 'host' ? '★ Anfitrião' : 'Camarada'}
                            </p>
                          </div>
                        </div>

                        {/* Remove Member Button (Host only) */}
                        {currentMember.role === 'host' && member.user_id !== currentMember.user_id && (
                          <button
                            type="button"
                            onClick={async () => {
                              sounds.playClick();
                              if (window.confirm(`Tem certeza que deseja remover o camarada "${member.nickname}" da sala de cinema?`)) {
                                await onRemoveMember(member.id);
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-soviet-400 hover:bg-soviet-950/80 rounded transition-colors ml-2 flex-shrink-0"
                            title={`Remover ${member.nickname} da sala`}
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 bg-cinema-800 hover:bg-cinema-700 text-slate-300 rounded-lg border border-cinema-600 text-xs transition-colors"
              title={soundOn ? 'Desativar efeitos sonoros soviéticos' : 'Ativar efeitos sonoros soviéticos'}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-gold-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Current User Avatar & Exit */}
            <div className="flex items-center gap-1 pl-1 border-l border-cinema-700">
              <div title={`Você: ${currentMember.nickname}`} className="w-8 h-8 rounded-full border border-gold-500/50 overflow-hidden bg-cinema-800">
                <CatAvatar id={currentMember.avatar} size={32} />
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  onLeaveRoom();
                }}
                className="p-1.5 text-slate-400 hover:text-soviet-500 hover:bg-soviet-950/40 rounded-lg transition-colors"
                title="Sair da Sala"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
