# 🌿 Manual de Operações Administrativas — Projeto Recomeçar (v1.50)

Este documento descreve detalhadamente o funcionamento, arquitetura e controle administrativo do painel de moderação do **Projeto Recomeçar – Apoio Emocional**.

---

## 🔑 Como Acessar o Painel
Por motivos éticos e de privacidade, o painel do administrador foi camuflado sob um fluxo de segurança integrado.
1. Vá para a tela de **Perfil** (`/src/pages/Profile.tsx`).
2. Clique no botão de **Suporte & Central de Ajuda**.
3. Na tela de suporte, clique **5 vezes seguidas** no ícone de canastra/salva-vidas de suporte (canto superior direito).
4. Forneça o PIN de segurança administrativa. O PIN padrão de fábrica do desenvolvedor é **`2026`** (também aceita a chave secundária `admin123`).

---

## 🏡 Estrutura e Recursos do Painel (v1.50)
O painel foi expandido para fornecer **150% de capacidade operacional**, permitindo simular com precisão fluxos de moderação, contabilidade de monetização e futura integração com banco de dados Supabase.

Ele está organizado em seis (6) canais ou abas funcionais:

### 1. 📈 Geral (Métricas do Refúgio)
* **Engajamento Total**: Mostra a contagem viva de visitantes únicos que acessaram o aplicativo (integrado com o `localStorage` do dispositivo).
* **Faturamento Estimado (MRR)**: Calcula em tempo real a projeção mensal de faturamento em Reais (R$) de acordo com os planos ativos na base administrativa.
* **Métricas Detalhadas**: Distribui a contagem de assinantes do Refúgio em suas três categorias monetizadas: **PREMIUM**, **VIP** e **BÁSICO**.
* **Controles Globais do Sistema**:
  * **Modo de Segurança Rigoroso**: Filtra e modera instantaneamente termos pejorativos ou gatilhos em salas ao vivo.
  * **Delay da IA Acolhedora**: Ajusta via middleware o tempo de resposta do robô de NLP terapêutico nos chats (Imediato, Normal ou Seguro com análise).

### 2. 👥 Membros (Controle de Usuários)
* **Banco de Dados Local**: Exibe a lista completa de membros cadastrados com seus respectivos e-mails, humores declarados no onboarding e datas de ingresso.
* **Atualização Dinâmica de Planos**: Altere na hora o tier do usuário clicando nas cápsulas de plano (`Free`, `Basic`, `VIP`, `Premium`).
* **Suspensão & Bimento de Usuários**:
  * Utilize o botão de **Ban (Suspensão)** para desativar provisoriamente o acesso do membro à comunidade de salas anônimas e fóruns de compartilhamento.
  * Utilize a **Lixeira (Ban permanente)** para extirpar a conta do usuário do banco de dados local.

### 3. ✉️ Suporte (Tickets & Chamados)
* **Fluxo de Atendimento**: Reúne todas as mensagens de desabafo e problemas de suporte técnico protocolados pelos usuários sob o protocolo do Refúgio.
* **Aperto de Mão Integrado**: Permite ao Administrador redigir uma resposta terapêutica ou técnica diretamente para o chamado. Ao enviar, o chamado é marcado como **Respondido (`resolved`)** e o log de middleware de rede é gerado.
* **Exclusão de Chamados**: Permite remover da esteira de moderação chamados já solucionados.

### 4. 🫂 Salas (Controle de Salas ao Vivo)
* **Supervisão Contínua**: Exibe todas as salas terapêuticas personalizadas que foram abertas espontaneamente por usuários no aplicativo.
* **Moderação Ativa**: Exclua salas que estejam violando os termos de conduta ou que tenham temas impróprios com apenas um clique.

### 5. 💬 Fórum (Moderação de Discussões)
* **Inspeção de Discussões**: Vigie as threads ativas do fórum de ajuda mútua do app.
* **Exclusão de Conteúdo**: Exclua tópicos antigos ou desvirtuados para garantir um espaço acolhedor e seguro de desabafos sem julgamentos.

### 6. ⚡ Integração (Mapeamento de Produção Supabase)
* **Visão de Banco Remoto**: Demonstra como os dados locais do aplicativo (`localStorage`) correspondem perfeitamente às tabelas relacionais do Supabase.
* **Esquema SQL Copiável (Raw SQL)**: Código pronto em dialeto PostgreSQL com as tabelas de suporte e usuários para o desenvolvedor copiar e colar no editor de SQL do Supabase.
* **Mapeamento de Chamada (API Client)**: Mostra o boilerplate de API pronto em JavaScript consumindo o SDK `@supabase/supabase-js`.
* **Teste de Integridade de Rede**: Permite realizar um handshake de rede simulando a resposta ativa de APIs de produção com gravação direta de telemetria no console.

---

## 💻 Console de Log do Middleware (Terminal)
No rodapé da aba de Integração, está posicionado um console de logs interativo que simula e monitora todas as ações de rede efetuadas dentro do painel (logins, exclusões de dados, handshakes com o banco de dados e respostas de chamado), servindo como diagnóstico ideal para o desenvolvedor do aplicativo.
