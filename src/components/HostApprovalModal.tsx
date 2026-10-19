import React from 'react';
import type { RoomMember } from '../lib/types';
import { CatAvatar } from '../assets/cat-avatars';
import { sounds } from '../lib/soundEffects';
import { ShieldAlert, Check, X, Users } from 'lucide-react';

interface HostApprovalModalProps {
  pendingMembers: RoomMember[];
  onApprove: (memberId: string) => Promise<void>;
  onReject: (memberId: string) => Promise<void>;
  onClose: () => void;
}

export const HostApprovalModal: React.FC<HostApprovalModalProps> = ({
  pendingMembers,
  onApprove,
  onReject,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-lg w-full bg-cinema-900 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cinema-700 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-russo text-lg text-slate-100 tracking-wide">
                PORTARIA DO CINEMA
              </h3>
              <p className="text-xs text-amber-400 font-mono">
                {pendingMembers.length} camarada(s) aguardando autorização
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-cinema-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Members List */}
        {pendingMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-300 font-medium">Nenhum camarada na fila de espera no momento.</p>
            <p className="text-xs text-slate-500 mt-1">Novas solicitações aparecerão aqui em tempo real.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {pendingMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3.5 bg-cinema-850 rounded-xl border border-cinema-700/80 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full border border-gold-500/50 p-0.5 bg-cinema-900 flex-shrink-0">
                    <CatAvatar id={member.avatar} size="100%" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-russo text-sm text-slate-200 truncate">
                      {member.nickname}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Aguardando desde {new Date(member.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <button
                    onClick={async () => {
                      sounds.playVictory();
                      await onApprove(member.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-transform transform active:scale-95"
                    title="Autorizar Entrada"
                  >
                    <Check className="w-4 h-4" />
                    <span>Autorizar</span>
                  </button>

                  <button
                    onClick={async () => {
                      sounds.playClick();
                      await onReject(member.id);
                    }}
                    className="p-2 text-slate-400 hover:text-soviet-400 hover:bg-soviet-950/40 rounded-lg border border-cinema-700 hover:border-soviet-700/60 transition-colors"
                    title="Recusar Entrada"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-cinema-700 text-right">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-cinema-800 hover:bg-cinema-750 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
