import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Room, RoomMember, Movie, Review } from './types';
import { saveRoomHostKey, getRoomHostKey } from './storage';

const env = (typeof import.meta !== 'undefined' && import.meta ? (import.meta as any).env : {}) || {};
const supabaseUrl: string = env.VITE_SUPABASE_URL || 'https://vvcmznvpbaevyqtvhljp.supabase.co';
const supabaseAnonKey: string = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GSUqN5mZnynw60PI317tgQ_8gquiibF';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// =========================================================================
// REALTIME MULTI-TAB SIMULATOR (BroadcastChannel + LocalStorage)
// Operates automatically when Supabase environment variables are not yet set,
// enabling full testing of Private Room authorization, Realtime playlist sync,
// and reviews across multiple browser tabs!
// =========================================================================
type ChannelEventType = 
  | 'MEMBER_JOINED' 
  | 'MEMBER_APPROVED' 
  | 'MEMBER_REJECTED' 
  | 'MOVIE_ADDED' 
  | 'MOVIE_STATUS_CHANGED' 
  | 'MOVIE_DELETED'
  | 'REVIEW_ADDED';

interface BroadcastMessage {
  type: ChannelEventType;
  roomId: string;
  payload: any;
}

const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('kinokott_realtime_bus')
  : null;

// Local fallback store
function getLocalData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem('kott_' + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem('kott_' + key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

// =========================================================================
// UNIFIED DATA SERVICE (Supabase with automatic Fallback)
// =========================================================================
export const RoomService = {
  // Create Room
  async createRoom(name: string, isPrivate: boolean, createdByUserId: string, customHostKey?: string): Promise<Room> {
    const roomCode = 'KOTT-' + Math.floor(1000 + Math.random() * 9000);
    const hostKey = customHostKey && customHostKey.trim().length > 0 
      ? customHostKey.trim() 
      : Math.floor(1000 + Math.random() * 9000).toString();

    const newRoom: Room = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'room_' + Date.now(),
      code: roomCode,
      name,
      is_private: isPrivate,
      host_key: hostKey,
      created_by_user_id: createdByUserId,
      created_at: new Date().toISOString()
    };

    saveRoomHostKey(roomCode, hostKey);

    if (isSupabaseConfigured && supabase) {
      let data: any = null;

      // Try inserting with host_key column
      const res = await supabase
        .from('rooms')
        .insert([{
          code: roomCode,
          name,
          is_private: isPrivate,
          created_by_user_id: createdByUserId,
          host_key: hostKey
        }])
        .select()
        .single();

      if (res.error && (res.error.code === '42703' || res.error.code === 'PGRST204')) {
        // Fallback if column host_key does not exist yet in Supabase table
        console.warn('rooms table missing host_key column, inserting without it...');
        const retry = await supabase
          .from('rooms')
          .insert([{
            code: roomCode,
            name,
            is_private: isPrivate,
            created_by_user_id: createdByUserId
          }])
          .select()
          .single();

        if (retry.error) throw retry.error;
        data = { ...retry.data, host_key: hostKey };
      } else if (res.error) {
        throw res.error;
      } else {
        data = res.data;
      }

      return data;
    } else {
      const rooms = getLocalData<Room[]>('rooms', []);
      rooms.push(newRoom);
      setLocalData('rooms', rooms);
      return newRoom;
    }
  },

  // Get Room by Code
  async getRoomByCode(code: string): Promise<Room | null> {
    const formattedCode = code.trim().toUpperCase();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .ilike('code', formattedCode)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const localKey = getRoomHostKey(data.code);
      if (!data.host_key && localKey) {
        data.host_key = localKey;
      }
      return data;
    } else {
      const rooms = getLocalData<Room[]>('rooms', []);
      const r = rooms.find(room => room.code.toUpperCase() === formattedCode) || null;
      if (r && !r.host_key) {
        const localKey = getRoomHostKey(r.code);
        if (localKey) r.host_key = localKey;
      }
      return r;
    }
  },

  // Get Room by ID
  async getRoomById(id: string): Promise<Room | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const localKey = getRoomHostKey(data.code);
      if (!data.host_key && localKey) {
        data.host_key = localKey;
      }
      return data;
    } else {
      const rooms = getLocalData<Room[]>('rooms', []);
      const r = rooms.find(room => room.id === id) || null;
      if (r && !r.host_key) {
        const localKey = getRoomHostKey(r.code);
        if (localKey) r.host_key = localKey;
      }
      return r;
    }
  },

  // Claim Host Rights using Host Key
  async claimHostWithKey(
    roomId: string, 
    userId: string, 
    key: string
  ): Promise<{ success: boolean; error?: string; member?: RoomMember }> {
    const room = await this.getRoomById(roomId);
    if (!room) return { success: false, error: 'Sala não encontrada.' };

    const expectedKey = (room.host_key || getRoomHostKey(room.code) || '').trim().toUpperCase();
    const cleanKey = key.trim().toUpperCase();

    if (!expectedKey || cleanKey !== expectedKey) {
      return { success: false, error: 'Chave do anfitrião incorreta.' };
    }

    saveRoomHostKey(room.code, cleanKey);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('room_members')
        .update({ role: 'host', status: 'approved' })
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Also transfer creator ownership
      await supabase
        .from('rooms')
        .update({ created_by_user_id: userId })
        .eq('id', roomId);

      return { success: true, member: data };
    } else {
      const members = getLocalData<RoomMember[]>('members', []);
      const idx = members.findIndex(m => m.room_id === roomId && m.user_id === userId);
      if (idx >= 0) {
        members[idx].role = 'host';
        members[idx].status = 'approved';
        setLocalData('members', members);
        return { success: true, member: members[idx] };
      }
      return { success: false, error: 'Membro não encontrado.' };
    }
  },

  // Join Room (adds member as approved or pending)
  async joinRoom(
    roomId: string, 
    userId: string, 
    nickname: string, 
    avatar: string, 
    role: 'host' | 'member',
    isPrivate: boolean
  ): Promise<RoomMember> {
    const status = role === 'host' ? 'approved' : (isPrivate ? 'pending' : 'approved');
    const member: RoomMember = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'member_' + Date.now(),
      room_id: roomId,
      user_id: userId,
      nickname,
      avatar,
      role,
      status,
      joined_at: new Date().toISOString(),
      last_seen: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      // Upsert member
      const { data, error } = await supabase
        .from('room_members')
        .upsert([{
          room_id: roomId,
          user_id: userId,
          nickname,
          avatar,
          role,
          status,
          last_seen: new Date().toISOString()
        }], { onConflict: 'room_id,user_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const members = getLocalData<RoomMember[]>('members', []);
      const idx = members.findIndex(m => m.room_id === roomId && m.user_id === userId);
      if (idx >= 0) {
        members[idx] = { ...members[idx], nickname, avatar, status };
        setLocalData('members', members);
        broadcastChannel?.postMessage({
          type: 'MEMBER_JOINED',
          roomId,
          payload: members[idx]
        });
        return members[idx];
      } else {
        members.push(member);
        setLocalData('members', members);
        broadcastChannel?.postMessage({
          type: 'MEMBER_JOINED',
          roomId,
          payload: member
        });
        return member;
      }
    }
  },

  // Get Room Members
  async getMembers(roomId: string): Promise<RoomMember[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      const members = getLocalData<RoomMember[]>('members', []);
      return members.filter(m => m.room_id === roomId);
    }
  },

  // Update Member Status (Approve or Reject Comrade)
  async updateMemberStatus(memberId: string, roomId: string, status: 'approved' | 'rejected'): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('room_members')
        .update({ status })
        .eq('id', memberId);
      if (error) throw error;
    } else {
      const members = getLocalData<RoomMember[]>('members', []);
      const member = members.find(m => m.id === memberId);
      if (member) {
        member.status = status;
        setLocalData('members', members);
        broadcastChannel?.postMessage({
          type: status === 'approved' ? 'MEMBER_APPROVED' : 'MEMBER_REJECTED',
          roomId,
          payload: { memberId, status, userId: member.user_id }
        });
      }
    }
  },

  // Remove Member from Room (Host action)
  async removeMember(memberId: string, roomId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('room_members')
        .update({ status: 'rejected' })
        .eq('id', memberId);
      if (error) throw error;
    } else {
      const members = getLocalData<RoomMember[]>('members', []);
      const member = members.find(m => m.id === memberId);
      if (member) {
        member.status = 'rejected';
        setLocalData('members', members);
        broadcastChannel?.postMessage({
          type: 'MEMBER_REJECTED',
          roomId,
          payload: { memberId, status: 'rejected', userId: member.user_id }
        });
      }
    }
  },

  // Get Movies for a Room
  async getMovies(roomId: string): Promise<Movie[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const movies = getLocalData<Movie[]>('movies', []);
      return movies.filter(m => m.room_id === roomId);
    }
  },

  // Add Movie to Room
  async addMovie(movieData: Omit<Movie, 'id' | 'created_at'>): Promise<Movie> {
    const newMovie: Movie = {
      ...movieData,
      id: crypto.randomUUID ? crypto.randomUUID() : 'movie_' + Date.now(),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      let { data, error } = await supabase
        .from('movies')
        .insert([movieData])
        .select()
        .single();

      // Graceful fallback: If Supabase table doesn't have stream_service / stream_url columns yet (PGRST204)
      if (error && error.code === 'PGRST204') {
        console.warn('Supabase missing stream columns, retrying without them...', error.message);
        const { stream_service, stream_url, ...fallbackData } = movieData;
        const retry = await supabase
          .from('movies')
          .insert([fallbackData])
          .select()
          .single();
        if (retry.error) throw retry.error;
        data = retry.data;
      } else if (error) {
        throw error;
      }

      return data;
    } else {
      const movies = getLocalData<Movie[]>('movies', []);
      movies.unshift(newMovie);
      setLocalData('movies', movies);
      broadcastChannel?.postMessage({
        type: 'MOVIE_ADDED',
        roomId: movieData.room_id,
        payload: newMovie
      });
      return newMovie;
    }
  },

  // Update Movie Status (e.g. pending -> watched)
  async updateMovieStatus(movieId: string, roomId: string, status: 'pending' | 'watched'): Promise<void> {
    const watched_at = status === 'watched' ? new Date().toISOString() : null;
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('movies')
        .update({ status, watched_at })
        .eq('id', movieId);
      if (error) throw error;
    } else {
      const movies = getLocalData<Movie[]>('movies', []);
      const movie = movies.find(m => m.id === movieId);
      if (movie) {
        movie.status = status;
        movie.watched_at = watched_at || undefined;
        setLocalData('movies', movies);
        broadcastChannel?.postMessage({
          type: 'MOVIE_STATUS_CHANGED',
          roomId,
          payload: { movieId, status, watched_at }
        });
      }
    }
  },

  // Delete Movie from Room
  async deleteMovie(movieId: string, roomId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', movieId);
      if (error) throw error;
    } else {
      let movies = getLocalData<Movie[]>('movies', []);
      movies = movies.filter(m => m.id !== movieId);
      setLocalData('movies', movies);
      broadcastChannel?.postMessage({
        type: 'MOVIE_DELETED',
        roomId,
        payload: { movieId }
      });
    }
  },

  // Get Reviews for a Room
  async getReviews(roomId: string): Promise<Review[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const reviews = getLocalData<Review[]>('reviews', []);
      return reviews.filter(r => r.room_id === roomId);
    }
  },

  // Add Review
  async addReview(reviewData: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const newReview: Review = {
      ...reviewData,
      id: crypto.randomUUID ? crypto.randomUUID() : 'review_' + Date.now(),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reviews')
        .upsert([reviewData], { onConflict: 'movie_id,user_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const reviews = getLocalData<Review[]>('reviews', []);
      const existingIdx = reviews.findIndex(r => r.movie_id === reviewData.movie_id && r.user_id === reviewData.user_id);
      if (existingIdx >= 0) {
        reviews[existingIdx] = newReview;
      } else {
        reviews.unshift(newReview);
      }
      setLocalData('reviews', reviews);
      broadcastChannel?.postMessage({
        type: 'REVIEW_ADDED',
        roomId: reviewData.room_id,
        payload: newReview
      });
      return newReview;
    }
  },

  // Subscribe to Realtime Room Changes
  subscribeToRoom(roomId: string, onUpdate: () => void) {
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel(`room_${roomId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${roomId}` },
          () => onUpdate()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'movies', filter: `room_id=eq.${roomId}` },
          () => onUpdate()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reviews', filter: `room_id=eq.${roomId}` },
          () => onUpdate()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // BroadcastChannel listener
      if (!broadcastChannel) return () => {};
      const handler = (event: MessageEvent<BroadcastMessage>) => {
        if (event.data && event.data.roomId === roomId) {
          onUpdate();
        }
      };
      broadcastChannel.addEventListener('message', handler);
      return () => {
        broadcastChannel.removeEventListener('message', handler);
      };
    }
  }
};
