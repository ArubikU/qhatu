# EDD — Qhatu
> Engineering Design Document
> Versión: 3.0 | Fecha: 2026-05-27

---

## 1. Stack Tecnológico

### Frontend
| Capa | Tecnología | Razón |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR/SSG, PWA-ready, Edge runtime |
| Lenguaje | TypeScript strict | Type safety en equipo |
| Estilos | Tailwind CSS + CSS tokens | Utilidades + glassmorphism custom |
| Estado global | Zustand | Lightweight, sin boilerplate |
| Estado servidor | TanStack Query v5 | Cache, infinite scroll, optimistic updates |
| Formularios | React Hook Form + Zod | Validación tipada end-to-end |
| Animaciones | Framer Motion | Transiciones fluidas mobile |
| PWA | next-pwa (Workbox) | Service worker, offline, push notifications |
| Icons | Lucide React | Outline, rounded — sin emojis en UI |
| Realtime | EventSource (SSE) | Feed updates sin WebSocket overhead |

### Backend
| Capa | Tecnología | Razón |
|---|---|---|
| Runtime | Node.js 20 LTS | Ecosystem maduro |
| Framework | Fastify | Schema-first, 2× más rápido que Express |
| ORM | Prisma | Type-safe, migraciones, pgvector support |
| DB principal | PostgreSQL 16 | Relacional, full-text search, pgvector |
| DB vectorial | pgvector (extensión PG) | Interest embeddings 128-dim, ANN search |
| Cache | Redis 7 | Feed cache, rate limiting, OTP, SSE pub/sub |
| Streams | Redis Streams | Real-time event pipeline (Kafka-lite) |
| Queue | BullMQ (Redis-backed) | Jobs async: score, embeddings, notificaciones |
| Auth | JWT access 15min + refresh 7d | Stateless, rotating refresh |
| Email | Resend | OTP delivery |
| Push notifs | Web Push (web-push lib) | PWA push notifications |
| Search | PostgreSQL full-text search | Posts + hashtags + nicknames, latencia < 200ms |
| Cron | node-cron | Rankings diarios, streak check, expiración efímeros |
| Validación | Zod compartido con frontend | Single source of truth |

### Infraestructura
| Componente | Servicio | Tier |
|---|---|---|
| Frontend | Vercel | Pro |
| Backend | Railway | Starter |
| PostgreSQL + pgvector | Supabase | Pro |
| Redis + Streams + BullMQ | Upstash Redis | Pay-per-use |
| Email | Resend | 3k/mes gratis |
| Push notifications | Self-hosted VAPID | — |

---

## 2. Arquitectura por Capas (Clean Architecture)

```
┌──────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                           │
│  Next.js App Router pages/components  │  Fastify route handlers  │
│  SSE client (EventSource)             │  Request/Response DTOs   │
└────────────────────────┬─────────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                    APPLICATION LAYER                              │
│  Use Cases (orchestrate domain + ports)                          │
│  FeedUseCase · PostUseCase · AuthUseCase · SearchUseCase         │
│  FollowUseCase · NotificationUseCase · RankingUseCase            │
│  GamificationUseCase · ProfileUseCase · PollUseCase              │
└────────────────────────┬─────────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                      DOMAIN LAYER                                │
│  Entities: Post · User · Poll · Follow · Hashtag · Notification  │
│  Pure Services (zero I/O):                                       │
│    ScoreCalculator · EmbeddingCalculator                         │
│    AchievementEvaluator · CandidateRanker · SearchRanker         │
│  Ports (interfaces): IPostRepo · IUserRepo · ICacheRepo          │
│    IEmbeddingStore · IJobQueue · IStreamProducer · ISearchIndex  │
└────────────────────────┬─────────────────────────────────────────┘
                         │  implements
┌────────────────────────▼─────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                             │
│  PostgresPostRepository · PostgresUserRepository                 │
│  PostgresSearchRepository (full-text + tsvector)                 │
│  RedisCacheRepository · RedisOtpRepository                       │
│  RedisStreamProducer · BullMQJobQueue                            │
│  PgVectorEmbeddingStore · ResendEmailProvider                    │
│  WebPushNotificationProvider                                     │
└──────────────────────────────────────────────────────────────────┘
```

**Dependency rule:** `Presentation → Application → Domain ← Infrastructure`
Domain no importa nada externo. Infrastructure implementa ports del domain.

---

## 3. Arquitectura de Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT (Browser/PWA)                       │
│  Next.js 14 — Vercel Edge — Service Worker — EventSource    │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS + SSE
┌────────────────────▼────────────────────────────────────────┐
│                 API Layer (Railway)                          │
│  Fastify + JWT Auth + Zod + Rate Limiter                    │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────┐   │
│  │  REST API   │ │  SSE /stream │ │  Push Notif Worker │  │
│  │  routes/    │ │  (feed live) │ │  (web-push lib)    │  │
│  └──────┬──────┘ └──────┬───────┘ └─────────┬─────────┘   │
└─────────┼───────────────┼───────────────────┼─────────────┘
          │               │                   │
┌─────────▼───────────────▼───────────────────▼─────────────┐
│                  Data + Streaming Layer                      │
│  ┌────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │ PostgreSQL │  │  Redis Cluster │  │  BullMQ Workers │  │
│  │ + pgvector │  │  + Streams     │  │  (5 concurrency)│  │
│  └────────────┘  └────────────────┘  └─────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Real-Time Architecture (Redis Streams)

Cada interacción de usuario genera un evento en Redis Streams.
Múltiples consumer groups procesan el stream de forma independiente.

```
User action (react, post, comment, follow, dismiss)
    │
    ▼
Redis Stream: "qhatu:interactions"
    │
    ├── Consumer Group: "score-updater"
    │   └── scoreWorker.ts: recalcula Post.score + velocityScore
    │
    ├── Consumer Group: "embedding-updater"
    │   └── embeddingWorker.ts: EMA update de UserInterestVector
    │
    ├── Consumer Group: "affinity-updater"
    │   └── affinityWorker.ts: actualiza UserAuthorAffinity score
    │
    ├── Consumer Group: "notification-dispatcher"
    │   └── notificationWorker.ts: evalúa si dispara push notif
    │
    └── Consumer Group: "feed-invalidator"
        └── feedInvalidatorWorker.ts: publica en Redis pub/sub
            → clientes SSE reciben señal "new posts available"
```

### SSE Feed Update Flow
```
1. Nuevo post publicado
2. scoreWorker lo procesa → score calculado
3. feedInvalidatorWorker publica en Redis channel "feed:updates:{universityDomain}"
4. SSE handler (/api/stream) escucha el channel via Redis subscribe
5. Envía event: { type: "NEW_POSTS", count: N } al cliente
6. Cliente muestra banner "N posts nuevos" — tap para cargar
```

---

## 5. Schema Prisma Completo

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions", "fullTextSearch"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector"), pg_trgm]
}

// ─── USERS ───────────────────────────────────────────────────────

model User {
  id                String    @id @default(uuid()) @db.Uuid
  emailHash         String    @unique @db.Char(64)
  nickname          String    @unique @db.VarChar(30)
  avatarSeed        String    @db.VarChar(20)
  ageRange          AgeRange
  gender            Gender
  faculty           String?   @db.VarChar(50)
  universityDomain  String    @db.VarChar(100)   // ej: "uni.edu.pe"

  // Gamification
  streakCount       Int       @default(0)
  lastPostDate      DateTime? @db.Date
  totalLikesEarned  Int       @default(0)

  // Account
  nicknameChangedAt DateTime?
  pushSubscription  String?   @db.Text    // JSON serializado de PushSubscription
  createdAt         DateTime  @default(now())
  deletedAt         DateTime?

  // Relations
  posts             Post[]
  comments          Comment[]
  reactions         Reaction[]
  achievements      Achievement[]
  feedViews         FeedView[]
  interestVector    UserInterestVector?
  blocks            UserBlock[]         @relation("blocker")
  blockedBy         UserBlock[]         @relation("blocked")
  followsGiven      UserFollow[]        @relation("follower")
  notifications     Notification[]
  pushTokens        PushToken[]
  pollVotes         PollVote[]

  @@index([nickname])
  @@index([universityDomain])
  @@index([faculty])
}

// ─── POSTS ───────────────────────────────────────────────────────

model Post {
  id                String    @id @default(uuid()) @db.Uuid
  authorId          String    @db.Uuid
  content           String    @db.VarChar(300)
  type              PostType  @default(TEXT)
  isIdentityRevealed Boolean  @default(false)    // autor optó por revelar en este post
  expiresAt         DateTime?                    // null=permanente, +24h=efímero

  // Denormalized counters (updated by workers, avoids expensive JOINs)
  score             Float     @default(0)
  likesCount        Int       @default(0)
  fireCount         Int       @default(0)
  teaCount          Int       @default(0)
  dedCount          Int       @default(0)
  commentsCount     Int       @default(0)
  sharesCount       Int       @default(0)
  reportsCount      Int       @default(0)
  velocityScore     Float     @default(0)
  velocityUpdatedAt DateTime?

  // Full-text search vector (updated by trigger or worker)
  searchVector      Unsupported("tsvector")?

  createdAt         DateTime  @default(now())
  deletedAt         DateTime?

  author            User      @relation(fields: [authorId], references: [id])
  comments          Comment[]
  reactions         Reaction[]
  views             FeedView[]
  embedding         PostEmbedding?
  hashtags          PostHashtag[]
  poll              Poll?
  parentPost        Post?     @relation("ShareOf", fields: [parentPostId], references: [id])
  parentPostId      String?   @db.Uuid
  shares            Post[]    @relation("ShareOf")
  notifications     Notification[]

  @@index([score])
  @@index([createdAt])
  @@index([authorId, createdAt])
  @@index([type, expiresAt])
  @@index([deletedAt, createdAt])
  @@index([searchVector], type: Unsupported("GIN"))
}

// ─── POLLS ───────────────────────────────────────────────────────

model Poll {
  id        String       @id @default(uuid()) @db.Uuid
  postId    String       @unique @db.Uuid
  question  String       @db.VarChar(200)
  post      Post         @relation(fields: [postId], references: [id])
  options   PollOption[]
}

model PollOption {
  id         String     @id @default(uuid()) @db.Uuid
  pollId     String     @db.Uuid
  text       String     @db.VarChar(100)
  votesCount Int        @default(0)
  poll       Poll       @relation(fields: [pollId], references: [id])
  votes      PollVote[]

  @@index([pollId])
}

model PollVote {
  userId    String     @db.Uuid
  optionId  String     @db.Uuid
  createdAt DateTime   @default(now())
  user      User       @relation(fields: [userId], references: [id])
  option    PollOption @relation(fields: [optionId], references: [id])

  @@id([userId, optionId])
}

// ─── HASHTAGS ────────────────────────────────────────────────────

model Hashtag {
  id         String        @id @default(uuid()) @db.Uuid
  tag        String        @unique @db.VarChar(50)    // lowercase, sin #
  postsCount Int           @default(0)
  trendScore Float         @default(0)               // spike detection score
  posts      PostHashtag[]
  follows    UserFollow[]

  @@index([trendScore])
  @@index([tag])
}

model PostHashtag {
  postId    String  @db.Uuid
  hashtagId String  @db.Uuid
  post      Post    @relation(fields: [postId], references: [id])
  hashtag   Hashtag @relation(fields: [hashtagId], references: [id])

  @@id([postId, hashtagId])
}

// ─── FOLLOWS ─────────────────────────────────────────────────────

model UserFollow {
  id           String     @id @default(uuid()) @db.Uuid
  followerId   String     @db.Uuid
  // Target: either a nickname (user) or a hashtag — XOR constraint enforced in app layer
  targetNickname String?  @db.VarChar(30)
  targetHashtagId String? @db.Uuid
  createdAt    DateTime   @default(now())

  follower     User       @relation("follower", fields: [followerId], references: [id])
  targetHashtag Hashtag?  @relation(fields: [targetHashtagId], references: [id])

  @@unique([followerId, targetNickname])
  @@unique([followerId, targetHashtagId])
  @@index([followerId])
  @@index([targetNickname])
}

// ─── COMMENTS ────────────────────────────────────────────────────

model Comment {
  id        String    @id @default(uuid()) @db.Uuid
  postId    String    @db.Uuid
  authorId  String    @db.Uuid
  content   String    @db.VarChar(300)
  createdAt DateTime  @default(now())
  deletedAt DateTime?

  post   Post @relation(fields: [postId], references: [id])
  author User @relation(fields: [authorId], references: [id])

  @@index([postId, createdAt])
}

// ─── REACTIONS ───────────────────────────────────────────────────

model Reaction {
  postId    String       @db.Uuid
  userId    String       @db.Uuid
  type      ReactionType
  createdAt DateTime     @default(now())

  post Post @relation(fields: [postId], references: [id])
  user User @relation(fields: [userId], references: [id])

  @@id([postId, userId])
  @@index([postId, type])
  @@index([userId, createdAt])
}

// ─── FEED VIEWS ──────────────────────────────────────────────────

model FeedView {
  postId     String    @db.Uuid
  userId     String    @db.Uuid
  seenAt     DateTime  @default(now())
  interacted Boolean   @default(false)
  dismissed  Boolean   @default(false)   // "no me interesa"

  post Post @relation(fields: [postId], references: [id])
  user User @relation(fields: [userId], references: [id])

  @@id([postId, userId])
  @@index([userId, seenAt])
}

// ─── ACHIEVEMENTS ────────────────────────────────────────────────

model Achievement {
  id         String          @id @default(uuid()) @db.Uuid
  userId     String          @db.Uuid
  type       AchievementType
  progress   Int             @default(0)
  target     Int             @default(0)   // meta numérica (ej: 100 para Comentarista)
  unlockedAt DateTime?

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, type])
}

// ─── DAILY RANKINGS ──────────────────────────────────────────────

model DailyRanking {
  id       String       @id @default(uuid()) @db.Uuid
  date     DateTime     @db.Date
  category RankCategory
  rank     Int          @db.SmallInt
  userId   String       @db.Uuid
  value    Int

  @@unique([date, category, rank])
  @@index([date, category])
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────

model Notification {
  id        String           @id @default(uuid()) @db.Uuid
  userId    String           @db.Uuid            // recipient
  type      NotificationType
  postId    String?          @db.Uuid
  actorNickname String?      @db.VarChar(30)     // quien generó la notif
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())

  user User  @relation(fields: [userId], references: [id])
  post Post? @relation(fields: [postId], references: [id])

  @@index([userId, read, createdAt])
}

model PushToken {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String   @db.Uuid
  subscription String   @db.Text    // PushSubscription JSON
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
}

// ─── INTEREST VECTORS (pgvector) ─────────────────────────────────

model UserInterestVector {
  userId    String                     @id @db.Uuid
  vector    Unsupported("vector(128)")
  updatedAt DateTime                   @default(now())
  user      User                       @relation(fields: [userId], references: [id])

  @@index([vector], map: "user_vector_ivfflat", type: Unsupported("ivfflat (vector_cosine_ops)"))
}

model PostEmbedding {
  postId    String                     @id @db.Uuid
  vector    Unsupported("vector(128)")
  createdAt DateTime                   @default(now())
  post      Post                       @relation(fields: [postId], references: [id])
}

// ─── AFFINITY GRAPH ──────────────────────────────────────────────

model UserAuthorAffinity {
  viewerId  String   @db.Uuid
  authorId  String   @db.Uuid
  score     Float    @default(0)
  updatedAt DateTime @default(now())

  @@id([viewerId, authorId])
  @@index([viewerId, score])
}

// ─── BLOCKS ──────────────────────────────────────────────────────

model UserBlock {
  blockerId String   @db.Uuid
  blockedId String   @db.Uuid
  createdAt DateTime @default(now())

  blocker User @relation("blocker", fields: [blockerId], references: [id])
  blocked User @relation("blocked", fields: [blockedId], references: [id])

  @@id([blockerId, blockedId])
  @@index([blockerId])
}

// ─── ENUMS ───────────────────────────────────────────────────────

enum PostType {
  TEXT
  POLL
  EPHEMERAL
}

enum AgeRange {
  R18_20
  R21_23
  R24_PLUS
}

enum Gender {
  M
  F
  UNSPECIFIED
}

enum ReactionType {
  LIKE
  FIRE
  TEA
  DED
}

enum AchievementType {
  STREAK_7
  STREAK_30
  VIRAL_POST
  TOP_CHISMOSO
  COMENTARISTA_100
  VOCERO_50
  MADRUGADOR
  MULTIPUBLICADOR
  REVELADO_10
  ENCUESTADOR_5
}

enum RankCategory {
  MOST_LIKES
  MOST_POSTS
  MOST_COMMENTS
}

enum NotificationType {
  REACTION        // alguien reaccionó a tu post
  COMMENT         // alguien comentó tu post
  MENTION         // alguien te mencionó con @nickname
  TRENDING        // tu post entró en trending
  RANKING         // entraste en top-3 del día
  ACHIEVEMENT     // desbloqueaste un logro
  FOLLOWER        // alguien te sigue (anónimo, solo "alguien nuevo te sigue")
}
```

---

## 6. Algoritmo de Relevancia — Implementación Completa

### Pipeline Overview
```
[1. Candidate Retrieval ~500] → [2. Feature Hydration ~20 features]
    → [3. Light Ranker ~100] → [4. Heavy Ranker top-20]
    → [5. Post-Ranking Heuristics] → [FEED FINAL]
```

### Stage 1 — Candidate Retrieval (7 fuentes)

```typescript
// domain/services/CandidateRanker.ts

const BUCKET_SIZES = {
  inNetworkAffinity:    0.40,   // 200 candidates
  followGraph:          0.20,   // 100 candidates
  outOfNetworkCohort:   0.20,   // 100 candidates
  interestVector:       0.10,   // 50 candidates
  followedHashtags:     0.05,   // 25 candidates
  crossUniversity:      0.03,   // 15 candidates
  coldStart:            0.02,   // 10 candidates (new users only)
}
```

### Stage 3 — ScoreCalculator (pure domain function)

```typescript
// domain/services/ScoreCalculator.ts

export interface PostFeatures {
  // Engagement
  likes: number; fire: number; tea: number; ded: number
  comments: number; shares: number; reports: number
  pollVotes: number           // RF: poll vote signal
  postAgeHours: number
  // Author signals
  authorStreak: number
  isIdentityRevealed: boolean // RF: identity reveal trust signal
  isEphemeral: boolean
  hoursUntilExpiry: number    // para ephemeral urgency boost
  trendingVelocity: number
  // Personalization
  viewerAuthorInteractions: number
  cohortMatchFaculty: boolean
  cohortMatchAgeRange: boolean
  embeddingDistance: number   // cosine distance 0-1
  viewerFollowsAuthor: boolean
  viewerFollowsHashtag: boolean
  postMatchesViewerActiveHour: boolean
  sessionRepetitionCount: number  // times same hashtag in this session
  isReturnFromNotification: boolean
  // Negative signals
  dismissed: boolean          // "no me interesa"
}

const WEIGHTS = {
  likes:    1.0,
  fire:     1.5,
  tea:      1.3,
  ded:      1.2,
  comments: 2.0,
  shares:   2.5,
  polls:    0.8,
  reports: -5.0,
}

export function calculateScore(f: PostFeatures): number {
  // Feature 18: negative feedback — hard zero
  if (f.dismissed) return 0

  // Features 8-13: base engagement with time decay
  const engagement =
    f.likes    * WEIGHTS.likes    +
    f.fire     * WEIGHTS.fire     +
    f.tea      * WEIGHTS.tea      +
    f.ded      * WEIGHTS.ded      +
    f.comments * WEIGHTS.comments +
    f.shares   * WEIGHTS.shares   +
    f.pollVotes * WEIGHTS.polls   +
    f.reports  * WEIGHTS.reports

  // Feature 12: log2 time decay (slower than ln — favors up to 48h)
  const baseScore = engagement / Math.log2(f.postAgeHours + 2)

  // Feature 17: author streak bonus
  const authorBonus = Math.log(f.authorStreak + 1) * 0.05

  // Feature 10: trending velocity bonus (capped to prevent spam viral)
  const velocityBonus = Math.min(f.trendingVelocity * 0.3, 2.0)

  // Feature 15: ephemeral urgency — posts near expiry get boost
  const ephemeralBonus = (f.isEphemeral && f.hoursUntilExpiry < 4) ? baseScore * 0.4 : 0

  // Feature 16: identity reveal trust signal
  const identityBonus = f.isIdentityRevealed ? 0.25 : 0

  // Features 19-27: personalization multiplier
  let boost = 1.0
  boost += Math.min(f.viewerAuthorInteractions * 0.05, 0.50) // Feature 19: interaction history
  boost += f.cohortMatchFaculty    ? 0.15 : 0                // Feature 20
  boost += f.cohortMatchAgeRange   ? 0.10 : 0                // Feature 21
  boost += f.embeddingDistance < 0.3 ? 0.20 : 0             // Feature 22: embedding proximity
  boost += f.viewerFollowsAuthor   ? 0.35 : 0                // Feature 23: follow graph
  boost += f.viewerFollowsHashtag  ? 0.25 : 0                // Feature 24: hashtag follow
  boost += f.postMatchesViewerActiveHour ? 0.10 : 0          // Feature 25: time-of-day
  boost -= f.sessionRepetitionCount >= 3 ? 0.20 : 0          // Feature 26: session diversity penalty

  const personalizedScore = (baseScore * boost) + authorBonus + velocityBonus + ephemeralBonus + identityBonus

  // Feature 27: notification re-engagement — override score for return visits
  if (f.isReturnFromNotification) return personalizedScore * 10

  return Math.max(0, personalizedScore)
}
```

### Stage 5 — Post-Ranking Heuristics

```typescript
// domain/services/CandidateRanker.ts

export function applyHeuristics(ranked: ScoredPost[], sessionState: SessionState): ScoredPost[] {
  const result: ScoredPost[] = []
  const authorCount: Record<string, number> = {}
  const contentTypeCounts = { TEXT: 0, POLL: 0, EPHEMERAL: 0 }

  for (const post of ranked) {
    // Feature 28: Author diversity cap
    authorCount[post.authorId] = (authorCount[post.authorId] ?? 0) + 1
    if (authorCount[post.authorId] > 2) {
      post.score *= 0.3  // demote, don't remove
    }

    // Feature 34: Report cascade demotion
    if (post.reportsCount >= 5) continue              // hidden
    if (post.reportsCount >= 3) post.score *= 0.20
    else if (post.reportsCount >= 1) post.score *= 0.80

    result.push(post)
    contentTypeCounts[post.type]++
  }

  // Feature 29: Content type balance — inject polls and ephemerals if scarce
  // (implementation: ensure at least 1 poll and 1 ephemeral in top-20 if available)

  // Feature 31: Trending injection — insert 1 viral post in positions 3-5
  const viral = findViralPost(ranked)
  if (viral && !result.slice(2, 5).includes(viral)) {
    result.splice(3, 0, viral)
  }

  // Feature 32: Freshness guarantee — ensure min 3 posts from last 2h
  const fresh = ranked.filter(p => p.postAgeHours < 2).slice(0, 3)
  fresh.forEach(p => { if (!result.includes(p)) result.push(p) })

  // Feature 35: Hashtag trending injection
  const trendingHashtag = getTrendingHashtag()
  if (trendingHashtag) {
    const hashtagPost = ranked.find(p => p.hashtags.includes(trendingHashtag))
    if (hashtagPost) result.splice(result.length, 0, hashtagPost)
  }

  return result.slice(0, 20)
}
```

### Redis Streams Consumer (Real-Time Learning)

```typescript
// infrastructure/queue/workers/streamConsumer.ts

import { createClient } from 'redis'
import { calculateScore } from '../../domain/services/ScoreCalculator'

const redis = createClient({ url: process.env.REDIS_URL })
const STREAM_KEY = 'qhatu:interactions'

// Consumer group: "embedding-updater"
async function processEmbeddingUpdate(event: InteractionEvent) {
  const INTERACTION_WEIGHTS: Record<string, number> = {
    like: 0.5, fire: 0.7, tea: 0.6, ded: 0.6,
    comment: 1.0, share: 1.2, dismiss: -0.8,
  }
  const weight = INTERACTION_WEIGHTS[event.type] ?? 0.5
  const postEmbedding = await pgvectorStore.getPostEmbedding(event.postId)
  const userVector   = await pgvectorStore.getUserVector(event.userId)

  // Feature 19: EMA update — real-time interest learning
  const updated = userVector.map((v, i) => 0.9 * v + 0.1 * postEmbedding[i] * weight)
  await pgvectorStore.setUserVector(event.userId, updated)
}
```

### Hashtag Trending Detection (Feature 35)

```typescript
// infrastructure/queue/workers/hashtagTrendingWorker.ts
// Runs every 5 minutes via BullMQ repeatable job

async function detectTrendingHashtags() {
  const windowMs = 2 * 60 * 60 * 1000  // 2 hours
  const prevWindowMs = 4 * 60 * 60 * 1000

  const [currentCounts, prevCounts] = await Promise.all([
    getHashtagCounts(windowMs),
    getHashtagCounts(prevWindowMs, windowMs),
  ])

  for (const [tag, currentCount] of Object.entries(currentCounts)) {
    const prevCount = prevCounts[tag] ?? 1
    const spikeFactor = currentCount / prevCount

    // Feature 35: spike ≥3× average triggers trending
    if (spikeFactor >= 3) {
      await prisma.hashtag.update({
        where: { tag },
        data: { trendScore: spikeFactor },
      })
    }
  }
}
```

---

## 7. Search Architecture

PostgreSQL full-text search con `tsvector` + `pg_trgm` para typo-tolerance.

```sql
-- Search index on posts
CREATE INDEX posts_search_idx ON posts USING GIN(search_vector);

-- Update trigger
CREATE OR REPLACE FUNCTION update_post_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('spanish', NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_search_vector_update
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_post_search_vector();
```

```typescript
// Unified search: posts + hashtags + nicknames
async function unifiedSearch(query: string, viewerId?: string) {
  const [posts, hashtags, users] = await Promise.all([
    // Full-text search posts
    prisma.$queryRaw`
      SELECT id, content, score,
             ts_rank(search_vector, plainto_tsquery('spanish', ${query})) AS rank
      FROM posts
      WHERE search_vector @@ plainto_tsquery('spanish', ${query})
        AND deleted_at IS NULL
      ORDER BY rank DESC, score DESC
      LIMIT 20
    `,
    // Hashtag search (prefix match)
    prisma.hashtag.findMany({
      where: { tag: { startsWith: query.toLowerCase().replace('#', '') } },
      orderBy: { postsCount: 'desc' },
      take: 5,
    }),
    // Nickname search (trigram similarity)
    prisma.$queryRaw`
      SELECT nickname, avatar_seed, total_likes_earned
      FROM users
      WHERE similarity(nickname, ${query}) > 0.3
        AND deleted_at IS NULL
      ORDER BY similarity(nickname, ${query}) DESC
      LIMIT 5
    `,
  ])
  return { posts, hashtags, users }
}
```

---

## 8. Notification System

```typescript
// application/NotificationUseCase.ts

export class NotificationUseCase {
  async dispatch(event: NotificationEvent) {
    const { type, recipientId, postId, actorNickname } = event

    // 1. Persist in-app notification
    await this.notifRepo.create({ userId: recipientId, type, postId, actorNickname })

    // 2. Send push if user has token and hasn't disabled this type
    const tokens = await this.pushRepo.getTokens(recipientId)
    if (tokens.length > 0) {
      const payload = buildPushPayload(type, actorNickname, postId)
      await Promise.allSettled(
        tokens.map(t => this.webPush.send(t.subscription, payload))
      )
    }
  }
}

function buildPushPayload(type: NotificationType, actor?: string, postId?: string) {
  const messages: Record<NotificationType, string> = {
    REACTION:    `${actor} reaccionó a tu post`,
    COMMENT:     `${actor} comentó tu post`,
    MENTION:     `${actor} te mencionó`,
    TRENDING:    'Tu post está en tendencias',
    RANKING:     'Entraste en el top 3 del día',
    ACHIEVEMENT: 'Desbloqueaste un logro',
    FOLLOWER:    'Alguien nuevo te sigue',
  }
  return JSON.stringify({
    title: 'Qhatu',
    body: messages[type],
    icon: '/isomobile_clasic.png',
    data: { postId },
  })
}
```

---

## 9. API Endpoints

### Auth
```
POST /auth/register           { email }                       → { message }
POST /auth/verify             { email, otp }                  → { accessToken, refreshToken, user }
POST /auth/refresh            { refreshToken }                → { accessToken, refreshToken }
POST /auth/logout             —                               → 204
POST /auth/push-token         { subscription: PushSubscription } → 201
```

### Posts
```
GET  /posts                   ?tab&cursor&faculty&gender&ageRange&type  → { posts[], nextCursor }
POST /posts                   { content, type, poll?, isIdentityRevealed? } → { post }
GET  /posts/:id               —                               → { post, reactionCounts, commentsCount }
DELETE /posts/:id             —                               → 204
POST /posts/:id/report        { reason }                      → 204
PUT  /posts/:id/reaction      { type }                        → { reactionCounts }
DELETE /posts/:id/reaction    —                               → { reactionCounts }
POST /posts/:id/dismiss       —                               → 204
```

### Comments
```
GET  /posts/:id/comments      ?cursor                         → { comments[], nextCursor }
POST /posts/:id/comments      { content }                     → { comment }
DELETE /comments/:id          —                               → 204
```

### Polls
```
POST /polls/:id/vote          { optionId }                    → { results: { optionId, count, percentage }[] }
```

### Users
```
GET  /users/me                —                               → { user, stats, achievements[] }
PATCH /users/me               { nickname?, faculty?, gender?, ageRange? } → { user }
GET  /users/:nickname         —                               → { publicProfile }
GET  /users/:nickname/posts   ?cursor                         → { posts[], nextCursor }
DELETE /users/me              —                               → 204
```

### Social
```
POST   /follows               { targetNickname? | targetHashtagId? } → 201
DELETE /follows/:id           —                               → 204
GET    /follows/feed          ?cursor                         → { posts[], nextCursor }
POST   /blocks                { targetNickname }              → 201
```

### Rankings & Search
```
GET  /rankings/daily          ?date                           → { mostLikes[], mostPosts[], mostComments[] }
GET  /search                  ?q&cursor                       → { posts[], hashtags[], users[] }
GET  /hashtags/trending       —                               → { hashtags[] }
```

### Notifications
```
GET  /notifications           ?cursor                         → { notifications[], unreadCount }
POST /notifications/read-all  —                               → 204
```

### Real-time
```
GET  /stream                  (SSE, Auth required)            → text/event-stream
```

---

## 10. Async Jobs (BullMQ + Redis Streams)

| Job | Trigger | Latencia objetivo |
|---|---|---|
| `score.recalculate` | Redis Stream: reaction/comment | < 500ms |
| `embedding.update` | Redis Stream: any interaction | < 1s |
| `affinity.update` | Redis Stream: any interaction | < 1s |
| `notification.dispatch` | Redis Stream: reaction/comment/follow | < 2s |
| `feed.invalidate` | Redis Stream: new post published | < 200ms |
| `hashtag.trending` | BullMQ repeatable: cada 5 min | — |
| `ephemeral.expire` | Cron: cada 15 min | — |
| `streak.check` | Cron: 00:05 UTC-5 | — |
| `rankings.daily` | Cron: 23:59 UTC-5 | — |

---

## 11. Seguridad

### Anonimato irreversible
- Email → `SHA-256(email.toLowerCase() + EMAIL_HASH_SALT)` → `CHAR(64)` en DB
- Salt en variable de entorno, nunca en DB ni código
- UUID interno jamás expuesto en respuestas públicas
- `User` table sin columna `email`

### Identity reveal (opt-in por post)
- `isIdentityRevealed: true` en el post — solo expone el nickname (ya público)
- No expone email, UUID, ni ningún dato sensible
- Decisión es por post, no afecta otros posts del usuario

### Auth
- JWT access: 15min. Refresh: 7 días, rotativo (token anterior invalidado en Redis)
- OTP: 6 dígitos, TTL 15min, max 5 intentos (luego bloqueo 1h)

### Rate Limiting
```
POST /auth/register   → 3/hora/IP
POST /auth/verify     → 5/15min/emailHash
POST /posts           → 20/hora/userId
PUT  /posts/:id/react → 60/min/userId
POST /search          → 30/min/userId
GET  /stream          → 1 conexión SSE activa/userId
```

---

## 12. PWA Configuration

```json
{
  "name": "Qhatu", "short_name": "Qhatu",
  "description": "Tu mundo. Tus chismes.",
  "theme_color": "#7B3FF2", "background_color": "#0F0D17",
  "display": "standalone", "orientation": "portrait",
  "start_url": "/feed", "scope": "/",
  "icons": [
    { "src": "/isomobile_clasic.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/isomobile_clasic.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Service Worker (Workbox)
| Asset | Strategy |
|---|---|
| Static JS/CSS | Cache-first, versioned |
| Fonts | Cache-first, TTL 30d |
| Feed API | Network-first, fallback cache |
| Auth API | Network-only |
| Push handler | Background sync |

---

## 13. Estructura de Carpetas

```
qhatu/
├── apps/
│   ├── web/                        → Next.js 14 PWA
│   │   ├── app/(auth)/             → login, register, verify
│   │   ├── app/(main)/             → feed, post/[id], profile/[nickname], search, notifications
│   │   ├── components/ui/          → Button, Card, Input, Badge
│   │   ├── components/feed/        → FeedCard, FeedTabs, FilterChips, RankingStrip
│   │   ├── components/post/        → PostComposer, ReactionBar, CommentThread, PollCard
│   │   ├── components/profile/     → AchievementGrid, StatsRow, ProfileHeader
│   │   ├── components/layout/      → BottomNav, TopBar
│   │   ├── hooks/                  → useFeed, usePost, useAuth, useSearch, useNotifications
│   │   ├── stores/                 → authStore, uiStore
│   │   └── lib/                    → api, auth, avatar, sse
│   │
│   └── api/                        → Fastify backend
│       ├── src/routes/             → Presentation layer
│       ├── src/application/        → Use Cases
│       ├── src/domain/
│       │   ├── entities/
│       │   ├── services/           → ScoreCalculator, EmbeddingCalculator, CandidateRanker, SearchRanker
│       │   └── ports/              → IPostRepo, IUserRepo, ICacheRepo, IStreamProducer...
│       ├── src/infrastructure/
│       │   ├── repositories/       → PostgresPostRepo, PostgresUserRepo, PostgresSearchRepo
│       │   ├── cache/              → RedisCacheRepo, RedisOtpRepo, RedisStreamProducer
│       │   ├── queue/workers/      → scoreWorker, embeddingWorker, hashtagTrendingWorker, notificationWorker
│       │   ├── embedding/          → PgVectorEmbeddingStore
│       │   ├── push/               → WebPushProvider
│       │   └── email/              → ResendEmailProvider
│       ├── src/middleware/         → auth, rateLimit
│       ├── src/jobs/               → dailyRankings, streakChecker, ephemeralExpiry
│       └── prisma/schema.prisma
│
├── packages/shared/                → Zod schemas, tipos, score utils compartidos
├── docs/PRD.md · EDD.md
├── entregable-1/                   → React Vite mockups (Entregable 1)
├── public/                         → Brand assets
├── CLAUDE.md
└── .claude/ai-rules.md
```

---

## 14. Variables de Entorno

```env
# Backend
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...                        # min 64 chars
JWT_REFRESH_SECRET=...
EMAIL_HASH_SALT=...                   # CRÍTICO — cambiar invalida todas las cuentas
RESEND_API_KEY=re_...
UNIVERSITY_EMAIL_DOMAIN=uni.edu.pe
VAPID_PUBLIC_KEY=...                  # Push notifications
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@qhatu.app
PORT=3001
NODE_ENV=development
BULLMQ_CONCURRENCY=5

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_KEY=...
```

---

## 15. Convenciones de Equipo

### Commits (Conventional Commits)
```
feat(feed): add follow graph candidate bucket
fix(score): cap velocity bonus at 2.0
feat(realtime): add Redis Streams consumer groups
perf(search): add GIN index on search_vector
test(domain): unit tests for ScoreCalculator all 30 features
```

### Branches
```
main        → producción (protegida)
dev         → integración
feat/xxx    → features
fix/xxx     → bugfixes
```
