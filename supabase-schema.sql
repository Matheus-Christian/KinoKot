-- =========================================================================
-- KINOKOTT (КИНОКОТ) - SUPABASE DATABASE SCHEMA
-- Cinema Colaborativo com Temática Soviética Estilizada & Gatinhos Cinéfilos
-- =========================================================================

-- 1. Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela: ROOMS (Salas de Cinema)
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    is_private BOOLEAN DEFAULT false NOT NULL,
    host_key VARCHAR(64),
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para busca rápida de salas por código
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms (code);

-- 3. Tabela: ROOM_MEMBERS (Membros da Sala & Fila de Espera)
CREATE TABLE IF NOT EXISTS public.room_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    nickname VARCHAR(60) NOT NULL,
    avatar VARCHAR(60) NOT NULL DEFAULT 'cat-ushanka',
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('host', 'member')),
    status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
    joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_seen TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_room_user UNIQUE (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_members_room_status ON public.room_members (room_id, status);

-- 4. Tabela: MOVIES (Playlist Compartilhada de Filmes)
CREATE TABLE IF NOT EXISTS public.movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    year VARCHAR(10),
    poster TEXT,
    plot TEXT,
    genre VARCHAR(120),
    director VARCHAR(120),
    imdb_id VARCHAR(30),
    imdb_rating VARCHAR(10),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'watched')),
    stream_service VARCHAR(50),
    stream_url TEXT,
    added_by_id UUID NOT NULL,
    added_by_name VARCHAR(60) NOT NULL,
    watched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migrações rápidas caso as tabelas já tenham sido criadas:
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS host_key VARCHAR(64);
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS stream_service VARCHAR(50);
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS stream_url TEXT;

CREATE INDEX IF NOT EXISTS idx_movies_room_status ON public.movies (room_id, status);

-- 5. Tabela: REVIEWS (Avaliações de 1 a 5 estrelas e comentários dos camaradas)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(60) NOT NULL,
    user_avatar VARCHAR(60) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_movie_user_review UNIQUE (movie_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON public.reviews (movie_id);

-- =========================================================================
-- CONFIGURAÇÃO DE REALTIME (Sincronização instantânea entre membros da sala)
-- =========================================================================
-- Adiciona as tabelas à publicação supabase_realtime de forma segura e idempotente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'room_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'movies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.movies;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'reviews'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
  END IF;
END $$;

-- Replica Identity FULL para que os eventos UPDATE do realtime enviem todos os dados
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_members REPLICA IDENTITY FULL;
ALTER TABLE public.movies REPLICA IDENTITY FULL;
ALTER TABLE public.reviews REPLICA IDENTITY FULL;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS)
-- Como o web app usa autenticação rápida de sala (sem auth.users obrigatório),
-- permitimos operações para a chave anônima (anon role) controladas pelo frontend.
-- =========================================================================
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para ROOMS
CREATE POLICY "Permitir leitura pública de salas" 
  ON public.rooms FOR SELECT USING (true);

CREATE POLICY "Permitir criação de salas" 
  ON public.rooms FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de salas" 
  ON public.rooms FOR UPDATE USING (true);

-- Políticas para ROOM_MEMBERS
CREATE POLICY "Permitir leitura de membros da sala" 
  ON public.room_members FOR SELECT USING (true);

CREATE POLICY "Permitir entrada de membros na sala" 
  ON public.room_members FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de membros (aprovar/rejeitar)" 
  ON public.room_members FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão de membros" 
  ON public.room_members FOR DELETE USING (true);

-- Políticas para MOVIES
CREATE POLICY "Permitir leitura de filmes da playlist" 
  ON public.movies FOR SELECT USING (true);

CREATE POLICY "Permitir adicionar filmes à sala" 
  ON public.movies FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualizar filmes (marcar como assistido)" 
  ON public.movies FOR UPDATE USING (true);

CREATE POLICY "Permitir excluir filmes" 
  ON public.movies FOR DELETE USING (true);

-- Políticas para REVIEWS
CREATE POLICY "Permitir leitura de avaliações" 
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Permitir criar avaliações de filmes" 
  ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir editar avaliações" 
  ON public.reviews FOR UPDATE USING (true);

CREATE POLICY "Permitir deletar avaliações" 
  ON public.reviews FOR DELETE USING (true);
