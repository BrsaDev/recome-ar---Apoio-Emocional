# Documentação da API FAPEM

A API do projeto **FAPEM** foi implementada com foco em escalabilidade e facilidade de integração, utilizando o **Supabase** como núcleo de infraestrutura.

## Estrutura do Projeto
- `src/routes/`: Módulos da API (Auth, Fórum, Salas, Pagamentos).
- `src/plugins/`: Extensões do Fastify (JWT Auth, Socket.IO).
- `src/lib/`: Utilitários (Prisma, Supabase Client).
- `prisma/`: Schema do banco de dados (Conexão via Supabase).

## Módulos Implementados

### 1. Autenticação (Anônima + Google OAuth)
- **Acesso Simples**: `POST /auth/access` (Nickname + Avatar).
- **Google Login**: `POST /auth/google`.
  - Valida o `idToken` usando `google-auth-library`.
  - Gerencia o vínculo de contas via e-mail e `googleId`.
- **Proteção**: Retorna um JWT assinado para todas as rotas privadas.

### 2. Fórum e Comunidade
- Endpoints: `GET /forum/topics`, `POST /forum/topics`.
- Suporte a categorias, filtros e busca.

### 3. Salas ao Vivo (LiveKit + Socket.IO)
- Endpoints: `GET /rooms`, `POST /rooms/:id/token`.
- Geração de tokens WebRTC para áudio em tempo real.
- Suporte para salas customizadas (Premium).
- Real-time habilitado via Socket.IO para chat e reações.

### 4. Monetização
- Endpoint: `POST /payments/verify-google-receipt`.
- Validação de compras da Google Play Store.

### 5. Painel Administrativo (Novo)
- **Métricas**: `GET /admin/stats` (MRR, Engajamento, Planos).
- **Membros**: `GET /admin/users`, `PATCH /admin/users/:id/plan`, `POST /admin/users/:id/ban`.
- **Suporte**: `GET /admin/tickets`, `POST /admin/tickets/:id/reply`.
- **Segurança**: PIN `2026` para acesso visual, proteção `role: ADMIN` no JWT para endpoints de API.

### 6. Integração Supabase
- O projeto utiliza o **Supabase** como infraestrutura de Banco de Dados e Auth.
- O Prisma está configurado para usar o *Connection Pooling* do Supabase para maior performance.

## Requisitos LiveKit
Consulte o arquivo [LIVEKIT_SETUP.md](file:///c:/Users/devbr/OneDrive/Documentos/BRUNO/RECOMEÇAR%20-%20APOIO%20EMOCIONAL/recome-ar---Apoio-Emocional/fapem-api/LIVEKIT_SETUP.md) para detalhes de como configurar o servidor de áudio.

## Como Rodar
1. `cd fapem-api`
2. `npm install`
3. Configure o `.env` (adicione as chaves do Supabase e Google).
4. `npm run prisma:generate`
5. `npm run dev`.

O servidor subirá em `http://localhost:3000`.
