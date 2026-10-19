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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    if (!showMembersDropdown && !showProfileDropdown) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowMembersDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) {
        setShowProfileDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMembersDropdown(false);
        setShowProfileDropdown(false);
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
  }, [showMembersDropdown, showProfileDropdown]);

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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Room Title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="relative group cursor-pointer flex-shrink-0" onClick={() => sounds.playClick()}>
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 border-gold-500 overflow-hidden shadow-soviet-glow bg-soviet-900 flex items-center justify-center transition-transform transform group-hover:scale-105">
                <CatAvatar id="cat-ushanka" size={40} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-soviet-600 border border-gold-400 text-[8px] font-bold text-gold-300 items-center justify-center">★</span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-russo tracking-wider text-base sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-soviet-100 via-gold-400 to-soviet-500 whitespace-nowrap">
                  КИНОКОТ
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-soviet-950/80 text-gold-400 border border-gold-500/30 rounded">
                  KinoKott
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-400 min-w-0">
                <span className="font-medium text-slate-200 hidden sm:inline max-w-[120px] md:max-w-[180px] truncate">{room.name}</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <button 
                  onClick={copyRoomLink}
                  title="Clique para copiar código ou link"
                  className="flex items-center gap-1 font-mono text-[11px] sm:text-xs text-gold-400 hover:text-gold-300 transition-colors bg-cinema-800 px-1.5 sm:px-2 py-0.5 rounded border border-cinema-700 hover:border-gold-500/50 flex-shrink-0"
                >
                  <span>{room.code}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3 text-gold-500" />}
                </button>
                <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 flex-shrink-0">
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
                    className="hidden lg:flex items-center gap-1 font-mono text-[10px] text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 transition-colors"
                  >
                    <Key className="w-2.5 h-2.5 text-amber-400" />
                    <span>Chave: {room.host_key}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Center */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            
            {/* Waiting Room Alert for Host/Comrades (Desktop only, mobile is inside Profile Menu) */}
            {pendingMembersCount > 0 && (
              <button
                onClick={onOpenPendingModal}
                className="hidden sm:flex relative items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/60 rounded-lg text-xs font-semibold animate-bounce transition-all shadow-lg"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Portaria:</span>
                <span className="bg-amber-500 text-cinema-950 font-black px-1.5 py-0.2 rounded-full text-[11px]">
                  {pendingMembersCount}
                </span>
              </button>
            )}

            {/* Members Count Dropdown Toggle (Always visible both on mobile and desktop) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowMembersDropdown(!showMembersDropdown);
                  setShowProfileDropdown(false);
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 sm:p-2 bg-cinema-800 hover:bg-cinema-700 text-slate-300 rounded-lg border border-cinema-600 text-xs transition-colors"
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

            {/* Sound Toggle (Desktop only, mobile is inside Profile Menu) */}
            <button
              onClick={toggleSound}
              className="hidden sm:flex p-2 bg-cinema-800 hover:bg-cinema-700 text-slate-300 rounded-lg border border-cinema-600 text-xs transition-colors"
              title={soundOn ? 'Desativar efeitos sonoros soviéticos' : 'Ativar efeitos sonoros soviéticos'}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-gold-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Current User Avatar with Menu Dropdown (Sound, Portaria, Logout, Key) */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowMembersDropdown(false);
                }}
                className={`relative p-0.5 rounded-full border-2 transition-all hover:scale-105 flex items-center justify-center ${
                  showProfileDropdown ? 'border-gold-400 ring-2 ring-gold-400/40' : 'border-gold-500/60 hover:border-gold-400'
                }`}
                title="Menu do Camarada"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-cinema-800">
                  <CatAvatar id={currentMember.avatar} size={32} />
                </div>
                {/* Notification Badge on Avatar when someone is waiting in portaria */}
                {pendingMembersCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 z-10">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-cinema-950 text-[10px] font-black items-center justify-center shadow">
                      {pendingMembersCount}
                    </span>
                  </span>
                )}
              </button>

              {/* Profile Menu Popover */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-cinema-900 border-2 border-gold-500/40 rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 space-y-3">
                  
                  {/* Comrade Profile Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-cinema-800">
                    <div className="w-11 h-11 rounded-full border border-gold-500/60 overflow-hidden bg-cinema-800 flex-shrink-0">
                      <CatAvatar id={currentMember.avatar} size={44} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-russo text-sm text-slate-100 truncate">
                        {currentMember.nickname}
                      </p>
                      <p className="text-[11px] font-mono text-gold-400">
                        {currentMember.role === 'host' ? '★ Anfitrião Supremo' : 'Camarada Cinéfilo'}
                      </p>
                    </div>
                  </div>

                  {/* Option 1: Autorizar Novos Usuários (Portaria do Cinema) */}
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setShowProfileDropdown(false);
                      onOpenPendingModal();
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs ${
                      pendingMembersCount > 0
                        ? 'bg-amber-950/50 hover:bg-amber-900/50 border-amber-500/60 text-amber-200 shadow-md'
                        : 'bg-cinema-800/60 hover:bg-cinema-800 border-cinema-700/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className={`w-4 h-4 ${pendingMembersCount > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span className="font-russo">Portaria do Cinema</span>
                    </div>
                    {pendingMembersCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-cinema-950 font-mono font-black text-[11px] animate-pulse">
                        {pendingMembersCount} aguardando
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">
                        0 aguardando
                      </span>
                    )}
                  </button>

                  {/* Option 2: Habilitar / Desabilitar Som */}
                  <button
                    onClick={() => {
                      toggleSound();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-cinema-800/60 hover:bg-cinema-800 border border-cinema-700/60 text-slate-300 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {soundOn ? <Volume2 className="w-4 h-4 text-gold-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                      <span className="font-russo">Efeitos Sonoros</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                      soundOn 
                        ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40' 
                        : 'bg-cinema-950 text-slate-500 border border-cinema-800'
                    }`}>
                      {soundOn ? 'ATIVADO' : 'MUTADO'}
                    </span>
                  </button>

                  {/* Option 3: Chave Secreta do Anfitrião (if host) */}
                  {room.host_key && currentMember.role === 'host' && (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        navigator.clipboard.writeText(room.host_key!);
                        alert(`Chave Secreta copiada: ${room.host_key}\n\nGuarde esta chave para recuperar o controle total desta sala em qualquer dispositivo.`);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 border border-amber-500/30 text-xs transition-colors"
                      title="Copiar Chave Mestra da Sala"
                    >
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-400" />
                        <span className="font-russo text-[11px]">Chave Mestra</span>
                      </div>
                      <span className="font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 text-amber-200">
                        {room.host_key}
                      </span>
                    </button>
                  )}

                  {/* Option 4: Sair da Sala / Deslogar */}
                  <div className="pt-1 border-t border-cinema-800">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setShowProfileDropdown(false);
                        onLeaveRoom();
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-soviet-950 hover:bg-soviet-900 text-soviet-300 border border-soviet-600/50 hover:border-soviet-500 transition-colors text-xs font-russo tracking-wide"
                    >
                      <LogOut className="w-3.5 h-3.5 text-soviet-400" />
                      <span>SAIR DA SALA (DESLOGAR)</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Desktop Exit Button (hidden on mobile, as it's inside profile dropdown) */}
            <button
              onClick={() => {
                sounds.playClick();
                onLeaveRoom();
              }}
              className="hidden sm:flex p-2 text-slate-400 hover:text-soviet-400 hover:bg-soviet-950/40 rounded-lg transition-colors border border-transparent hover:border-soviet-800"
              title="Sair da Sala"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
