# Mapeamento Final de Requisitos da API - Projeto Recomeçar

Este documento apresenta o mapeamento completo de todas as funcionalidades existentes no frontend do sistema **Recomeçar**, garantindo que a futura implementação da API cubra 100% das necessidades do projeto, removendo redundâncias e focando na arquitetura de produção.

## 1. Arquitetura e Infraestrutura (AWS + LiveKit)

### Stack Tecnológica
- **Backend**: Node.js 22 (Fastify) + Prisma + Supabase (PostgreSQL).
- **Real-time**: Supabase Realtime + Socket.IO (Hybrid).
- **Áudio**: LiveKit (Auto-hospedado ou Cloud).
- **Processamento em Background**: BullMQ.
- **Hospedagem**: Supabase + AWS/Vercel.

---

## 2. Mapeamento de Módulos e Endpoints

### 2.1. Autenticação e Usuários (LGPD-Ready)
*O foco é o anonimato seguro.*

- **Model**: `User` (id, nickname, avatarId, email/id_unique, plan, supportAngels, createdAt).
- **Endpoints**:
  - `POST /auth/access`: Registro simplificado / Login anônimo.
  - `POST /auth/google`: Login oficial via Google (validação de idToken).
  - `POST /auth/login`: Login convencional.
  - `GET /user/me`: Retorna dados do perfil e lista de **Anjos de Apoio**.
  - `PATCH /user/profile`: Alterar avatar ou apelido.
  - `POST /user/angels/:id`: Adicionar um usuário como Anjo de Apoio (persiste no DB).
  - `DELETE /user/angels/:id`: Remover Anjo de Apoio.
  - `DELETE /user/account`: Exclusão permanente (Direito ao esquecimento LGPD).

### 2.2. Fórum e Comunidade
*Foco em acolhimento e moderação preventiva.*

- **Model**: `Topic`, `Post` (Comentários), `Reaction`.
- **Endpoints**:
  - `GET /forum/topics`: Listagem com filtros por categoria e busca textual (Postgres `ts_vector`).
  - `POST /forum/topics`: Criação com validação de conteúdo ofensivo (Zod/Backend logic).
  - `GET /forum/topics/:id`: Detalhe com incremento de visualizações.
  - `PATCH /forum/topics/:id`: Edição liberada apenas nos primeiros 5 minutos.
  - `POST /forum/topics/:id/schedule-deletion`: Agenda deleção automática do tópico para 24h depois (Job BullMQ).
  - `POST /forum/topics/:id/posts`: Adicionar comentário.
  - `POST /forum/posts/:id/react`: Sistema de reações (👍, ❤️, 😊, 😢, 🤗).
  - `DELETE /forum/posts/:id`: Soft delete (mantém a estrutura da conversa).

### 2.3. Salas de Apoio ao Vivo
*Foco em interatividade e segurança.*

- **Categorias Estáticas**: Ansiedade, Solidão, Relacionamentos, Recomeço, Meditação.
- **Salas Customizadas (Premium)**: CRUD para salas criadas por usuários Premium.
- **Endpoints & Fluxos**:
  - `GET /rooms`: Lista salas públicas, VIP e Premium ativas.
  - `POST /rooms`: Criação de sala customizada (Apenas Premium).
  - `GET /rooms/:id/token`: Gera token JWT para LiveKit (áudio).
  - **Fluxo de Permissão (WebSocket)**: Usuário solicita entrada -> Criador recebe evento -> Criador aprova -> Usuário entra.
  - **Moderação em Tempo Real**: `POST /rooms/:id/report`. No 3º reporte, o usuário é expulso via Socket.IO e banido temporariamente daquela sala.

### 2.4. Monetização e Planos (Google Play Billing)
*Conformidade obrigatória com a Play Store.*

- **Planos**: Grátis, VIP, Premium.
- **Fluxo**: Compra feita via Google Play Billing Client (Frontend) -> Token enviado para API -> Backend valida via Google API -> Libera recursos.
- **Endpoint**: `POST /payments/verify-google-receipt`.

---

## 3. Moderação e Segurança

- **Filtro de Conteúdo**: Validação centralizada no backend para impedir nomes de salas ou posts ofensivos.
- **Rate Limiting**: Proteção contra spam no fórum e criação de salas.
- **Sanitização**: HTML Sanitizer em todos os inputs de texto do fórum.

---

## 4. Próximos Passos Sugeridos

1. **Configuração Supabase**: Crie um projeto no Supabase e configure as variáveis de ambiente.
2. **Setup do Prisma**: O schema já está pronto para conexão via Connection Pooling do Supabase.
3. **Migração Auth**: Avaliar a substituição gradual do Auth Custom pelo Supabase Auth.
4. **WebSocket Server**: Estruturar os namespaces do Socket.IO para salas de chat e notificações.

**Nota**: Funcionalidades puramente locais, como o "Exercício de Respiração" (Preciso me acalmar), permanecerão no frontend sem necessidade de endpoints específicos, a menos que se deseje gamificar o progresso do usuário.
