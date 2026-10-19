import React, { useState, useEffect, useCallback } from 'react';
import type { 
  Room, 
  RoomMember, 
  Movie, 
  Review, 
  UserSession, 
  SearchMovieResult 
} from './lib/types';
import { getStoredSession, saveRoomHostKey, getRoomHostKey } from './lib/storage';
import { RoomService } from './lib/supabase';
import { sounds } from './lib/soundEffects';

// Components
import { Navbar } from './components/Navbar';
import { RoomLobby } from './components/RoomLobby';
import { WaitingRoom } from './components/WaitingRoom';
import { HostApprovalModal } from './components/HostApprovalModal';
import { MovieSearchModal } from './components/MovieSearchModal';
import { RussianRoulette } from './components/RussianRoulette';
import { MovieDetailModal } from './components/MovieDetailModal';
import { MovieList } from './components/MovieList';

export const App: React.FC = () => {
  // Session & User State
  const [session, setSession] = useState<UserSession>(getStoredSession);

  // Active Room State
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentMember, setCurrentMember] = useState<RoomMember | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Modals & UI State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [selectedMovieForDetail, setSelectedMovieForDetail] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check URL query param for room invitation code and host key
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    const hostKeyParam = params.get('host_key') || params.get('key');
    if (code) {
      const cleanCode = code.trim().toUpperCase();
      setInitialRoomCode(cleanCode);
      if (hostKeyParam) {
        saveRoomHostKey(cleanCode, hostKeyParam.trim().toUpperCase());
      }
    }
  }, []);

  // Sync Room Data (Members, Movies, Reviews)
  const refreshRoomData = useCallback(async (roomId: string) => {
    try {
      const [membersData, moviesData, reviewsData] = await Promise.all([
        RoomService.getMembers(roomId),
        RoomService.getMovies(roomId),
        RoomService.getReviews(roomId),
      ]);

      setMembers(membersData);
      setMovies(moviesData);
      setReviews(reviewsData);

      // Check current member's status (for waiting room approval)
      const me = membersData.find(m => m.user_id === session.userId);
      if (me) {
        if (currentMember?.status === 'pending' && me.status === 'approved') {
          // Play fanfare when approved!
          sounds.playVictory();
        }
        setCurrentMember(me);
      }
    } catch (err) {
      console.error('Error refreshing room data:', err);
    }
  }, [session.userId, currentMember?.status]);

  // Set up Realtime listener when inside a room
  useEffect(() => {
    if (!currentRoom) return;

    // Initial fetch
    refreshRoomData(currentRoom.id);

    // Subscribe to realtime changes
    const unsubscribe = RoomService.subscribeToRoom(currentRoom.id, () => {
      refreshRoomData(currentRoom.id);
    });

    return () => {
      unsubscribe();
    };
  }, [currentRoom, refreshRoomData]);

  // Handle Create Room
  const handleCreateRoom = async (roomName: string, isPrivate: boolean, hostKey?: string) => {
    setLoading(true);
    setError(null);
    try {
      const newRoom = await RoomService.createRoom(roomName, isPrivate, session.userId, hostKey);
      const hostMember = await RoomService.joinRoom(
        newRoom.id,
        session.userId,
        session.nickname,
        session.avatar,
        'host',
        isPrivate
      );

      setCurrentRoom(newRoom);
      setCurrentMember(hostMember);
      sounds.playVictory();

      // Update URL without page reload
      window.history.replaceState({}, '', `?room=${newRoom.code}`);
    } catch (err: any) {
      setError(err?.message || 'Falha ao criar sala soviética. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Join Room
  const handleJoinRoom = async (code: string, hostKeyAttempt?: string) => {
    setLoading(true);
    setError(null);
    try {
      const cleanCode = code.trim().toUpperCase();
      const room = await RoomService.getRoomByCode(cleanCode);
      if (!room) {
        setError(`A sala com o código "${cleanCode}" não foi encontrada no registro.`);
        return;
      }

      // Check if user is creator or has valid host key
      const savedKey = getRoomHostKey(room.code);
      const candidateKey = (hostKeyAttempt?.trim() || savedKey || '').toUpperCase();
      const expectedKey = (room.host_key || savedKey || '').trim().toUpperCase();

      const isHostByKey = Boolean(candidateKey && expectedKey && candidateKey === expectedKey);
      const isCreator = room.created_by_user_id === session.userId;
      const isHost = isCreator || isHostByKey;

      if (isHostByKey && candidateKey) {
        saveRoomHostKey(room.code, candidateKey);
      }

      const member = await RoomService.joinRoom(
        room.id,
        session.userId,
        session.nickname,
        session.avatar,
        isHost ? 'host' : 'member',
        room.is_private
      );

      // If user provided valid host key and wasn't creator in DB, update creator ownership
      if (isHostByKey && member.role !== 'host') {
        const claimResult = await RoomService.claimHostWithKey(room.id, session.userId, candidateKey);
        if (claimResult.success && claimResult.member) {
          setCurrentMember(claimResult.member);
        } else {
          setCurrentMember(member);
        }
      } else {
        setCurrentMember(member);
      }

      setCurrentRoom(room);

      if (isHost || member.status === 'approved') {
        sounds.playVictory();
      } else {
        sounds.playBell();
      }

      window.history.replaceState({}, '', `?room=${room.code}`);
    } catch (err: any) {
      setError(err?.message || 'Falha ao entrar na sala. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Host Recovery Claim via Secret Key
  const handleClaimHost = async (key: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentRoom) return { success: false, error: 'Sala não encontrada.' };
    try {
      const result = await RoomService.claimHostWithKey(currentRoom.id, session.userId, key);
      if (result.success && result.member) {
        setCurrentMember(result.member);
        sounds.playVictory();
        await refreshRoomData(currentRoom.id);
        return { success: true };
      }
      return { success: false, error: result.error || 'Chave do anfitrião incorreta.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro ao autenticar como anfitrião.' };
    }
  };

  // Handle Leave Room
  const handleLeaveRoom = () => {
    sounds.playClick();
    setCurrentRoom(null);
    setCurrentMember(null);
    setMembers([]);
    setMovies([]);
    setReviews([]);
    setIsSearchOpen(false);
    setIsRouletteOpen(false);
    setIsPendingModalOpen(false);
    setSelectedMovieForDetail(null);
    window.history.replaceState({}, '', window.location.pathname);
  };

  // Handle Approve Member in Private Room
  const handleApproveMember = async (memberId: string) => {
    if (!currentRoom) return;
    await RoomService.updateMemberStatus(memberId, currentRoom.id, 'approved');
    await refreshRoomData(currentRoom.id);
  };

  // Handle Reject Member in Private Room
  const handleRejectMember = async (memberId: string) => {
    if (!currentRoom) return;
    await RoomService.updateMemberStatus(memberId, currentRoom.id, 'rejected');
    await refreshRoomData(currentRoom.id);
  };

  // Handle Remove Member (Expel by Host)
  const handleRemoveMember = async (memberId: string) => {
    if (!currentRoom) return;
    await RoomService.removeMember(memberId, currentRoom.id);
    await refreshRoomData(currentRoom.id);
  };

  // Handle Add Movie to Room Playlist
  const handleAddMovie = async (movieData: SearchMovieResult) => {
    if (!currentRoom) return;
    await RoomService.addMovie({
      room_id: currentRoom.id,
      title: movieData.title,
      year: movieData.year,
      poster: movieData.poster,
      plot: movieData.plot,
      genre: movieData.genre,
      director: movieData.director,
      imdb_id: movieData.imdb_id,
      imdb_rating: movieData.imdb_rating,
      stream_service: movieData.stream_service,
      stream_url: movieData.stream_url,
      status: 'pending',
      added_by_id: session.userId,
      added_by_name: session.nickname
    });
    await refreshRoomData(currentRoom.id);
  };

  // Handle Toggle Movie Status (Pending <-> Watched)
  const handleToggleMovieStatus = async (movieId: string, newStatus: 'pending' | 'watched') => {
    if (!currentRoom) return;
    await RoomService.updateMovieStatus(movieId, currentRoom.id, newStatus);
    await refreshRoomData(currentRoom.id);
    
    // If detail modal is open for this movie, update its status locally
    if (selectedMovieForDetail && selectedMovieForDetail.id === movieId) {
      setSelectedMovieForDetail(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Handle Delete Movie
  const handleDeleteMovie = async (movieId: string) => {
    if (!currentRoom) return;
    await RoomService.deleteMovie(movieId, currentRoom.id);
    await refreshRoomData(currentRoom.id);
    if (selectedMovieForDetail?.id === movieId) {
      setSelectedMovieForDetail(null);
    }
  };

  // Handle Add Review
  const handleAddReview = async (rating: number, comment: string) => {
    if (!currentRoom || !selectedMovieForDetail) return;
    await RoomService.addReview({
      room_id: currentRoom.id,
      movie_id: selectedMovieForDetail.id,
      user_id: session.userId,
      user_name: session.nickname,
      user_avatar: session.avatar,
      rating,
      comment
    });
    await refreshRoomData(currentRoom.id);
  };

  // Members calculations
  const approvedMembers = members.filter(m => m.status === 'approved');
  const pendingMembers = members.filter(m => m.status === 'pending');

  return (
    <div className="min-h-screen flex flex-col bg-cinema-950 text-slate-100 font-sans selection:bg-soviet-800 selection:text-gold-300">
      
      {/* 1. LOBBY VIEW (If not in a room) */}
      {!currentRoom && (
        <RoomLobby
          session={session}
          onUpdateSession={setSession}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          initialRoomCode={initialRoomCode}
          loading={loading}
          error={error}
        />
      )}

      {/* 2. WAITING ROOM VIEW (If inside private room but pending authorization) */}
      {currentRoom && currentMember && currentMember.status === 'pending' && (
        <WaitingRoom
          room={currentRoom}
          member={currentMember}
          approvedMembersCount={approvedMembers.length}
          onClaimHost={handleClaimHost}
          onCancel={handleLeaveRoom}
        />
      )}

      {/* 3. REJECTED VIEW (If entry was rejected or user was removed by host) */}
      {currentRoom && currentMember && currentMember.status === 'rejected' && (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-cinema-900 border-2 border-soviet-600 rounded-2xl p-6 text-center space-y-4">
            <span className="text-4xl block">🛑</span>
            <h2 className="font-russo text-xl text-soviet-400">INGRESSO NÃO AUTORIZADO</h2>
            <p className="text-xs text-slate-300">
              Você não possui mais permissão para permanecer nesta sessão (removido pelo anfitrião ou entrada recusada).
            </p>
            <button
              onClick={handleLeaveRoom}
              className="px-5 py-2.5 bg-cinema-800 hover:bg-cinema-750 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      )}

      {/* 4. ACTIVE THEATER ROOM VIEW (Approved member) */}
      {currentRoom && currentMember && currentMember.status === 'approved' && (
        <>
          <Navbar
            room={currentRoom}
            currentMember={currentMember}
            members={members}
            pendingMembersCount={pendingMembers.length}
            onOpenPendingModal={() => setIsPendingModalOpen(true)}
            onLeaveRoom={handleLeaveRoom}
            onRemoveMember={handleRemoveMember}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <MovieList
              movies={movies}
              reviews={reviews}
              onToggleStatus={handleToggleMovieStatus}
              onOpenDetails={(movie) => setSelectedMovieForDetail(movie)}
              onDeleteMovie={handleDeleteMovie}
              onOpenAddMovie={() => setIsSearchOpen(true)}
              onOpenRoulette={() => setIsRouletteOpen(true)}
            />
          </main>
        </>
      )}

      {/* MODAL: Search & Add Movies (IMDb / Catalog) */}
      {isSearchOpen && (
        <MovieSearchModal
          existingMovies={movies}
          onAddMovie={handleAddMovie}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {/* MODAL: Russian Roulette (Roleta Russa de Filmes) */}
      {isRouletteOpen && (
        <RussianRoulette
          pendingMovies={movies.filter(m => m.status === 'pending')}
          onMarkAsWatched={async (movieId) => {
            await handleToggleMovieStatus(movieId, 'watched');
          }}
          onClose={() => setIsRouletteOpen(false)}
        />
      )}

      {/* MODAL: Movie Details & Comrade Reviews */}
      {selectedMovieForDetail && (
        <MovieDetailModal
          movie={selectedMovieForDetail}
          reviews={reviews}
          session={session}
          onAddReview={handleAddReview}
          onToggleStatus={handleToggleMovieStatus}
          onClose={() => setSelectedMovieForDetail(null)}
        />
      )}

      {/* MODAL: Host / Comrade Waiting Room Approval */}
      {isPendingModalOpen && (
        <HostApprovalModal
          pendingMembers={pendingMembers}
          onApprove={handleApproveMember}
          onReject={handleRejectMember}
          onClose={() => setIsPendingModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-cinema-900 bg-cinema-950/90 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <p className="font-mono text-[11px] text-slate-400">
            ★ KinoKott (КИНОКОТ) • Cinema Coletivo Soviético & Gatinhos Cinéfilos
          </p>
        </div>
      </footer>

    </div>
  );
};

export default App;
