## Health Check de Maturidade Ágil

App para avaliar maturidade dos times em 4 dimensões (Eficácia & Negócio, Qualidade, Organização & Eficiência, Pessoas & Cultura), com respostas anônimas agrupadas por sessão e relatórios consolidados.

### Fluxo principal

1. **Facilitador** faz login (Lovable Cloud · email/senha + Google), cria uma **avaliação** nomeada (ex: "Squad Alpha · Q2 2026") e compartilha um link público (`/r/<token>`).
2. **Respondentes** abrem o link sem login, respondem as 4 dimensões (escala 1–5 + âncoras + comentário opcional) — totalmente anônimo.
3. **Facilitador** acessa `/dashboard` para ver lista de avaliações e abre relatórios de cada uma.

### Páginas

- `/` — landing curta + CTA login
- `/login` — email/senha + Google
- `/dashboard` — (protegida) lista de avaliações com botão "Nova avaliação", contagem de respostas, link de compartilhamento
- `/avaliacoes/$id` — (protegida) detalhe + 2 relatórios:
  - **Relatório 1 — Médias por pergunta** (para input externo): tabela com pilar, código da pergunta, texto, média, nº respostas, desvio padrão. Botão "Exportar CSV".
  - **Relatório 2 — Fortalezas & Foco por pilar** (visual estilo da imagem): para cada um dos 4 pilares, top 3 fortalezas e top 3 focos, ordenados por **score combinado = média − (desvio_padrão × peso)** para refletir consenso (alta média + baixo desvio = fortaleza forte; baixa média + baixo desvio = foco real). Botão "Exportar PDF/CSV".
- `/r/$token` — formulário público anônimo (4 dimensões em sequência, igual ao mock enviado)
- `/r/$token/obrigado` — confirmação

### Modelo de dados (Lovable Cloud)

```text
assessments
  id uuid pk
  owner_id uuid (auth.users)
  name text
  share_token text unique
  status text ('open'|'closed')
  created_at, closed_at

responses
  id uuid pk
  assessment_id uuid fk
  submitted_at timestamptz
  (sem identificação do respondente — anônimo)

answers
  id uuid pk
  response_id uuid fk
  pillar_id text   -- 'ep'|'qc'|'or'|'pc'
  question_id text -- 'ef1', 'q1', 'o1', 'p1' ...
  score int (1..5)
  comment text nullable
```

Catálogo de pilares/perguntas fica **hardcoded no frontend** (`src/lib/healthcheck-catalog.ts`) — espelha o `CATS` do mock. Não precisa de tabela.

### RLS

- `assessments`: dono pode CRUD; leitura pública por `share_token` (via server function que valida token, não direto pelo client).
- `responses` / `answers`: insert público via server function que valida o token; select apenas pelo dono da avaliação relacionada.

### Cálculos (no servidor, em `createServerFn`)

- **Média da pergunta**: `avg(score)` dos answers daquela question_id.
- **Desvio padrão**: amostral.
- **Score consenso** (para fortalezas/foco): `media - 0.5 * desvio` (fortalezas = top 3 maiores; foco = top 3 menores, usando `media + 0.5 * desvio`). Peso 0.5 ajustável.
- **Média do pilar**: média das médias de suas perguntas.

### Exportações

- CSV de médias: pilar; question_id; pergunta; média; n; desvio.
- CSV de fortalezas/foco: pilar; tipo (fortaleza|foco); rank; pergunta; média; desvio.

### Design

- Cores dos pilares idênticas ao mock (roxo, ciano, verde, laranja) — definidas como tokens semânticos em `src/styles.css` (oklch).
- Visual limpo, tipografia moderna (Inter + display sutil), tags arredondadas com fundo claro do pilar como na referência.
- Relatório de fortalezas/foco: tabela de 4 linhas (uma por pilar) × 2 colunas (Fortalezas top 3 / Foco top 3), igual à imagem enviada.

### Stack técnica

- TanStack Start, rotas em `src/routes/`, layout protegido `_authenticated/`.
- Lovable Cloud (Supabase) para auth + DB.
- Server functions para: criar avaliação, listar minhas avaliações, validar token + submeter resposta, calcular relatórios.
- Sem dependências extras além do que o template já tem (recharts opcional para barras nos relatórios).

### Fora do escopo (v1)

- Edição/exclusão de avaliações após respostas registradas.
- Comparação entre avaliações ou times ao longo do tempo.
- Convite de respondentes por email — usa link compartilhado.
