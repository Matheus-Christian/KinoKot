export type RoomRole = 'host' | 'member';
export type MemberStatus = 'approved' | 'pending' | 'rejected';
export type MovieStatus = 'pending' | 'watched';

export interface Room {
  id: string;
  code: string;
  name: string;
  is_private: boolean;
  created_by_user_id: string;
  created_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  nickname: string;
  avatar: string;
  role: RoomRole;
  status: MemberStatus;
  joined_at: string;
  last_seen: string;
}

export interface Movie {
  id: string;
  room_id: string;
  title: string;
  year?: string;
  poster?: string;
  plot?: string;
  genre?: string;
  director?: string;
  imdb_id?: string;
  imdb_rating?: string;
  status: MovieStatus;
  stream_service?: string;
  stream_url?: string;
  added_by_id: string;
  added_by_name: string;
  watched_at?: string;
  created_at: string;
}

export interface Review {
  id: string;
  movie_id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  rating: number; // 1 to 5
  comment?: string;
  created_at: string;
}

export interface UserSession {
  userId: string;
  nickname: string;
  avatar: string;
}

export interface SearchMovieResult {
  title: string;
  year: string;
  poster: string;
  plot: string;
  genre: string;
  director: string;
  imdb_id: string;
  imdb_rating: string;
  stream_service?: string;
  stream_url?: string;
}
