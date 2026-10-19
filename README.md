# KinoKott (КИНОКОТ) 🎬🐱☭

**KinoKott** é um web app colaborativo de avaliação e gerenciamento de filmes com estética construtivista soviética e gatinhos cinéfilos. 

Desenvolvido para grupos de amigos assistirem a filmes juntos, organizarem suas playlists em tempo real, votarem com estrelas soviéticas e sortearem o próximo filme da sessão através da icônica **Roleta Russa de Filmes**.

---

## 🌟 Principais Funcionalidades

1. **Autenticação Baseada em Salas de Cinema (Sem cadastro burocrático):**
   - Criação instantânea de salas com código de acesso único (ex: `KOTT-1917`).
   - Escolha de identidade cinéfila: Nickname e 6 avatares exclusivos de gatinhos camaradas (*Camarada Felix com Ushanka*, *Diretor Eisenstein*, *Cinéfilo Yuri 3D*, *Cosmonauta Barsik*, *Babushka Masha* e *Agente Murzik*).
   - **Salas Públicas:** Acesso direto via código ou link de convite.
   - **Salas Privadas (com Portaria em Tempo Real):** Novos membros aguardam na fila de espera com animação de guarda. Quem já está dentro da sala recebe a notificação instantânea e pode **Autorizar Entrada** ou **Recusar**.

2. **Integração com Catálogo de Filmes & IMDb:**
   - Busca instantânea com sinopse, capa em alta resolução, ano, diretor, gênero e nota IMDb.
   - Suporte a chave OMDb API (`VITE_OMDB_API_KEY`) para busca ao vivo no banco de dados do IMDb.
   - Acervo curado embutido com dezenas de clássicos soviéticos e mundiais (*Stalker*, *Solaris*, *O Encouraçado Potemkin*, *Vá e Veja*, *2001: Uma Odisséia no Espaço*, *Blade Runner 2049*, *Pulp Fiction*, *A Viagem de Chihiro*, *Duna 2*, etc.).

3. **Playlist Compartilhada em Tempo Real:**
   - Sincronização automática entre todos os camaradas da sala via Supabase Realtime (com fallback transparente multi-abas via BroadcastChannel).
   - Abas de filtro: **Todos**, **Na Fila (В очереди)** e **Assistidos (Просмотрено)**.
   - Alternância rápida de status e busca em tempo real dentro da playlist.

4. **Roleta Russa de Filmes (Случайный Выбор):**
   - Sorteio randômico interativo dos filmes pendentes da playlist.
   - Animação mecânica de cilindro de filme com aceleração, desaceleração e efeitos sonoros retro sintetizados via Web Audio API.
   - Chuva de confetes dourados e estrelas soviéticas ao sortear o filme vencedor, com opção de marcar como assistido imediatamente.

5. **Sistema de Avaliação & Críticas dos Camaradas:**
   - Avaliação de 1 a 5 estrelas soviéticas douradas com efeito de brilho.
   - Campo para resenhas críticas dos camaradas.
   - Cálculo automático da nota média dos camaradas para cada filme, exibida ao lado da nota do IMDb.

6. **Estética Soviética Construtivista & Cinema Noir:**
   - Tipografia eslava inspirada: fontes Google Fonts `Russo One` e `Cinzel`.
   - Paleta de cores: Vermelho soviético carmim, dourado imperial, acabamento em veludo escuro de cinema e detalhes geométricos.
   - Efeitos sonoros mecânicos de projetores e sinos de vitória (com botão de alternância mudo/som no cabeçalho).

---

## 🗄️ Esquema SQL do Supabase

O arquivo [`supabase-schema.sql`](./supabase-schema.sql) contém o script completo pronto para execução no **Supabase SQL Editor**:

1. Criação das tabelas:
   - `rooms` (gerenciamento das salas e códigos)
   - `room_members` (membros, anfitriões e fila de espera da portaria)
   - `movies` (playlist compartilhada e status)
   - `reviews` (notas de 1 a 5 estrelas e comentários)
2. Ativação de **Supabase Realtime** (`ALTER PUBLICATION supabase_realtime ADD TABLE ...`) com `REPLICA IDENTITY FULL`.
3. Políticas de **Row Level Security (RLS)** configuradas para acesso anônimo instantâneo via tokens de sala.

### Como aplicar no Supabase:
1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. Acesse o menu **SQL Editor**.
3. Copie todo o conteúdo do arquivo [`supabase-schema.sql`](./supabase-schema.sql) e clique em **Run**.

---

## 🚀 Como Executar Localmente

### 1. Clonar e Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```
Preencha suas chaves do Supabase (disponíveis em *Project Settings > API* no Supabase Dashboard):
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
VITE_OMDB_API_KEY=sua-chave-omdb-opcional
```

> **Nota:** Se você iniciar sem preencher o `.env`, o KinoKott ativará o **Modo Multi-Aba Automático**. Você poderá abrir duas abas no mesmo navegador e testar a aprovação de membros da sala privada e a sincronização da playlist em tempo real!

### 3. Rodar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse no navegador: `http://localhost:5173`

---

## 🌐 Deploy na Vercel

O projeto foi construído para deploy com 1 clique na **Vercel**:

1. Faça o push do repositório para o GitHub ou GitLab.
2. Na Vercel, clique em **Add New Project** e selecione o repositório.
3. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OMDB_API_KEY` (opcional)
4. Clique em **Deploy**. A Vercel detectará o Vite automaticamente e publicará a aplicação com CDN global e performance ultrarrápida.
# KinoKot
