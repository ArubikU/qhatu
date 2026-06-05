# CLAUDE.md — Qhatu
> Versión: 3.0 | Referencia maestra para el equipo y agentes AI

Qhatu = PWA micro-blogging universitario anónimo con feed real-time, social graph, polls, posts efímeros, algoritmo de 30 features, y Clean Architecture.
Stack: Next.js 14 + Fastify + PostgreSQL + pgvector + Redis Streams + BullMQ + TypeScript strict.
Monorepo: pnpm + Turborepo.

---

## Estructura del Proyecto

```
qhatu/
├── apps/web/          → Next.js 14 PWA (frontend)
├── apps/api/          → Fastify REST + SSE (backend)
├── packages/shared/   → Zod schemas, tipos, ScoreCalculator compartidos
├── entregable-1/      → React Vite mockups (Entregable 1, standalone)
├── docs/PRD.md        → Product Requirements (v2.0)
├── docs/EDD.md        → Engineering Design (v3.0)
└── public/            → Brand assets (logos Qhatu)
```

---

## Comandos Clave

```bash
pnpm install                              # instalar todas las deps
pnpm dev                                  # todos los servicios
pnpm dev --filter=web                     # solo frontend
pnpm dev --filter=api                     # solo backend
pnpm build                                # build completo
pnpm test                                 # todos los tests
pnpm typecheck                            # TypeScript strict check
cd apps/api && pnpm prisma migrate dev    # nueva migración
cd apps/api && pnpm prisma generate       # regenerar Prisma client
cd apps/api && pnpm prisma studio         # DB GUI
cd entregable-1 && npm run dev            # mockups React standalone
```

---

## Reglas de Código

### TypeScript
- Strict mode ON en todo el monorepo
- No `any` — si inevitable: comentar `// eslint-disable: @typescript-eslint/no-explicit-any <razón>`
- Tipos compartidos en `packages/shared/src/types/`
- Zod schemas en `packages/shared/src/schemas/`

### Clean Architecture — 4 Capas
```
Presentation → Application → Domain ← Infrastructure
```
- **Presentation** (`routes/` + React components): solo orquesta, llama use cases
- **Application** (`application/`): use cases, llama domain + ports
- **Domain** (`domain/`): entities, pure services, port interfaces — CERO imports externos
- **Infrastructure** (`infrastructure/`): Prisma repos, Redis, BullMQ, pgvector, Resend, WebPush

No mezclar capas. Route handler nunca llama Prisma. Use case nunca importa `ioredis`.

### Frontend
- Server components por defecto; `'use client'` solo si hay interactividad
- TanStack Query para todo server state (feeds, perfil, búsqueda)
- Zustand solo para estado de UI (modales, composer, auth session)
- SSE via `EventSource` en hook `useSSEFeed` para feed real-time

### Backend
- Fastify schema-first: Zod + `zodToJsonSchema` en cada ruta
- Toda lógica de negocio en use cases y domain services
- Redis Streams como event bus central — todos los workers consumen del stream `qhatu:interactions`

### Iconos
- **SIEMPRE Lucide React** — nunca emojis en UI
- Emojis solo permitidos en contenido de texto de posts (lo que escribe el usuario)

---

## Seguridad — CRÍTICO

- **NUNCA** guardar email en texto plano: `hashEmail(email)` → `SHA-256 + EMAIL_HASH_SALT`
- **NUNCA** exponer UUID interno: endpoints públicos usan `nickname`
- Rate limiting en todas las rutas de auth y creación de contenido
- JWT access: 15min. Refresh: 7 días, rotativo

---

## Branding

```css
--color-primary:      #7B3FF2  /* Púrpura Qhatu */
--color-primary-deep: #4B17B6  /* Morado Profundo */
--color-bg:           #0F0D17  /* Carbón */
--color-lavender:     #C8B6FF  /* Lavanda */
```
- Dark mode first, sin light mode en v1
- Cards: glassmorphism (`rgba(255,255,255,0.05)` + `backdrop-filter: blur(20px)`)
- Botones: pill (`border-radius: 999px`) + glow púrpura
- Tipografía: Poppins (headings/CTAs) + Inter (body)

---

## Algoritmo de Relevancia — 30 Features

### Pipeline
```
[1. Candidate Retrieval] → [2. Feature Hydration] → [3. Light+Heavy Ranking] → [4. Post-ranking Heuristics]
```

### Fuentes de candidatos (7)
1. **In-network affinity 40%** — `UserAuthorAffinity` score
2. **Follow graph 20%** — nicknames seguidos por el viewer
3. **Out-of-network cohort 20%** — misma facultad/cohorte no vistos
4. **Interest vector 10%** — pgvector cosine sim 128-dim
5. **Followed hashtags 5%** — posts con hashtags seguidos
6. **Cross-university 3%** — top-1% global de otras unis
7. **Cold start 2%** — nuevos usuarios sin historial

### Score formula (Heavy Ranker)
```typescript
const W = { likes:1.0, fire:1.5, tea:1.3, ded:1.2, comments:2.0, shares:2.5, polls:0.8, reports:-5.0 }
baseScore = Σ(metric × weight) / Math.log2(hoursAge + 2)
boost = 1.0
  + min(viewerInteractions×0.05, 0.50)  // follow history
  + facultyMatch×0.15
  + ageMatch×0.10
  + embeddingClose×0.20                  // pgvector distance < 0.3
  + followsAuthor×0.35
  + followsHashtag×0.25
  + timeOfDayMatch×0.10
  - sessionRepetition≥3 × 0.20
ephemeralBonus = isEphemeral && hoursLeft<4 ? baseScore×0.4 : 0
identityBonus  = isIdentityRevealed ? 0.25 : 0
velocityBonus  = min(velocity×0.3, 2.0)
finalScore = max(0, baseScore×boost + authorStreakBonus + velocityBonus + ephemeralBonus + identityBonus)
```

### Post-ranking heurísticos
- Author diversity: máx 2 posts/autor en top-20
- Content balance: mezcla TEXT/POLL/EPHEMERAL
- Feedback fatigue: >10 posts mismo autor hoy → ×0.3
- Trending injection: 1 viral en posiciones 3-5
- Freshness: mínimo 3 posts de últimas 2h
- Seen penalty: visto → ×0.05
- Report cascade: 1 reporte −20%, 3 reportes −80%, 5+ oculto
- Hashtag trending: spike ≥3× → inyectar 1 post/página

### Real-Time Learning (Redis Streams)
- Stream: `qhatu:interactions`
- Consumer groups: `score-updater`, `embedding-updater`, `affinity-updater`, `notification-dispatcher`, `feed-invalidator`
- EMA update: `new = 0.9×current + 0.1×postEmbedding×weight`
- Weights: like=0.5, fire=0.7, tea=0.6, comment=1.0, share=1.2, dismiss=−0.8

---

## Nuevas Features v2 a tener en cuenta

- **Polls**: `Post.type = POLL` + tabla `Poll/PollOption/PollVote`
- **Posts efímeros**: `Post.type = EPHEMERAL`, `expiresAt = createdAt + 24h`
- **Identity reveal**: `Post.isIdentityRevealed = true` → nickname visible con badge, opt-in por post
- **Follow graph**: `UserFollow` — target puede ser nickname o hashtagId
- **Hashtags**: `Hashtag + PostHashtag` — extraídos automáticamente del contenido
- **SSE feed**: `GET /stream` → EventSource en cliente, Redis pub/sub en servidor
- **Push PWA**: `web-push` lib + VAPID keys + `PushToken` en DB
- **Búsqueda**: PostgreSQL full-text (`tsvector` + GIN index) + `pg_trgm` para nicknames
- **Multi-universidad**: `User.universityDomain`, feed prioriza propia uni

---

## Entregables

### Entregable 1 — React Vite ✅ COMPLETADO
```
entregable-1/   → Vite + React + TS + Tailwind + Framer Motion + Lucide
                   6 vistas: Login, Register, Verify, Feed, CreatePost, Profile
```

### Entregable 2 — Producto Completo
Todo implementado con backend, algoritmo, real-time, deploy.

---

## Archivos de Referencia
- `docs/PRD.md` → v2.0: 12 RF, 30 features algoritmo, roadmap 10 semanas
- `docs/EDD.md` → v3.0: arquitectura completa, schema Prisma, endpoints, jobs
