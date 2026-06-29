# Requisitos para Usar o LiveKit - Projeto FAPEM

Para que as salas de áudio ao vivo funcionem corretamente, você precisará de uma infraestrutura do LiveKit. Existem dois caminhos principais:

## 1. LiveKit Cloud (Recomendado para Início Rápido)
A LiveKit oferece uma versão gerenciada (SaaS) que é muito fácil de configurar.
- **Vantagem**: Não precisa gerenciar servidores, escalabilidade automática.
- **O que fazer**: 
  - Criar conta em [cloud.livekit.io](https://cloud.livekit.io).
  - Criar um projeto e gerar as chaves: `API Key`, `API Secret` e `Project URL`.
  - Inserir esses dados no seu arquivo `.env`.

## 2. Self-Hosted (Servidor Próprio)
Você mesmo hospeda o servidor de áudio (SFU).
- **Vantagem**: Menor custo em larga escala e total privacidade dos dados.
- **Requisitos de Servidor**:
  - Servidor Linux (Ubuntu 22.04 recomendado).
  - Mínimo 2 vCPUs e 4GB RAM.
  - Endereço IP estático e domínio (DNS) com SSL (HTTPS/WSS).
- **Setup**:
  - Usar o LiveKit CLI para gerar a configuração.
  - Rodar via Docker ou Binário.

## O que já está pronto no seu Backend:
- O sistema de geração de **Tokens de Acesso**. O backend já sabe como criar o convite seguro para o usuário entrar na sala usando as chaves que você configurar.

## O que falta no seu Frontend:
- Integrar o `livekit-client` (já mapeado no `LiveRoom.tsx`) para usar o Token gerado pela API e abrir o canal de áudio.

---

### Chaves Necessárias no `.env`:
```env
LIVEKIT_API_KEY=sua_key_aqui
LIVEKIT_API_SECRET=seu_secret_aqui
LIVEKIT_URL=wss://seu-servidor.livekit.cloud
```
