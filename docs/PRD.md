# PRD — Qhatu
> Plataforma de micro-blogging universitario anónimo
> Versión: 2.0 | Fecha: 2026-05-27

---

## 1. Visión del Producto

**Qhatu** (quechua: "contar, hablar, comunicar") es una PWA de micro-blogging multi-universitario con feed inteligente, anonimato opcional, y sistema social completo. Los estudiantes se registran con correo institucional, publican de forma anónima o revelada, siguen nicknames y temas, y consumen un feed personalizado en tiempo real mediante un algoritmo de 30 features inspirado en Twitter/X open-source.

**Tagline:** *Tu mundo. Tus chismes.*

---

## 2. Objetivos

| # | Objetivo | Métrica de Éxito |
|---|---|---|
| O1 | Comunidad universitaria verificada y activa | ≥500 DAU en los primeros 3 meses |
| O2 | Anonimato sólido con identidad opcional | 0 incidentes de deanonymización involuntaria |
| O3 | Engagement alto y recurrente | DAU/MAU ≥ 40%; sesión promedio ≥ 8 min |
| O4 | Experiencia multi-dispositivo premium | Lighthouse ≥ 90 mobile y desktop; FCP < 1.5s; layout responsive mobile-first hasta 4K |
| O5 | Feed con aprendizaje real | CTR del feed personalizado ≥ 2× feed cronológico |
| O6 | Retención por gamificación | ≥ 60% usuarios mantienen racha ≥ 3 días |

---

## 3. Usuarios Objetivo

### Primario
- Estudiantes universitarios (18–28 años)
- Smartphone como dispositivo principal
- Consumen contenido social 2–4 horas/día
- Comparten anécdotas, chismes, encuestas, opiniones del campus

### Secundario
- Egresados recientes con correo institucional vigente
- Docentes (solo lectura en v1, publicación en v2)

---

## 4. Problema a Resolver

Las redes sociales generalistas no garantizan anonimato ni exclusividad universitaria. Los chismes del campus se dispersan sin estructura ni relevancia. No existe un espacio verificado, seguro y adictivo para la cultura universitaria local peruana.

---

## 5. Solución

PWA multi-universitaria con:
- Registro exclusivo por dominio institucional
- Anonimato por defecto, identidad opcional por post
- Feed real-time personalizado con algoritmo de 30 features
- Social graph: seguir nicknames + hashtags
- Contenido mixto: texto + polls + posts efímeros 24h + imágenes (v2)
- Gamificación profunda: rachas, logros, rankings diarios
- Notificaciones push PWA + centro de actividad in-app
- Búsqueda unificada: posts + hashtags + nicknames
- Monetización: freemium + ads contextuales + B2B data anónima

---

## 6. Requerimientos Funcionales

### RF1 — Registro Multi-Universidad
- Correos con dominio institucional válido (configurable por instancia)
- Verificación OTP 6 dígitos, expira 15 min, max 5 intentos
- Un correo = una cuenta (deduplicación por hash)
- Feed prioriza propia universidad pero incluye contenido cross-uni con badge "Otro campus"

### RF2 — Identidad: Anónimo por Defecto, Opcional por Post
- Al registrarse: nickname único aleatorio asignado
- El usuario puede cambiar nickname (1 vez cada 30 días)
- **Por post**: opción "Publicar como yo mismo" revela nickname real con badge verificado
- Correo nunca expuesto — almacenado como SHA-256+salt en DB
- UUID interno nunca expuesto en API pública

### RF3 — Publicación de Contenido
- **Texto**: máx 300 caracteres, emojis permitidos en contenido
- **Polls**: pregunta + 2-4 opciones, voto anónimo, resultado visible post-voto
- **Posts efímeros**: se autodestruyen a las 24h, badge de reloj visible
- **Imágenes**: v2 (fuera de Entregable 2)
- Draft auto-guardado en localStorage
- Hashtags automáticos: palabras con # se indexan como hashtag

### RF4 — Sistema de Interacción
- Reacciones: Like / Fire / Tea / Ded (con iconos Lucide, sin emojis en UI)
- Comentarios (1 nivel de profundidad, máx 300 chars)
- Re-post con cita (quote post)
- Guardar en favoritos (privado)
- "No me interesa" — feedback negativo explícito que actualiza el algoritmo
- Bloquear autor (posts bloqueados no aparecen en ningún feed)
- Reportar post (demotion automático por threshold)

### RF5 — Social Graph
- **Seguir nicknames**: posts de seguidos reciben boost en "Para ti"
- **Seguir hashtags**: posts con hashtags seguidos aparecen en tab dedicado
- **Listas de seguidos**: ver feed solo de seguidos (tab "Siguiendo")
- Seguimiento es unidireccional y anónimo (el seguido no sabe quién le sigue)

### RF6 — Gamificación y Logros

| Logro | Condición | Icono |
|---|---|---|
| Racha 7 días | 7 días consecutivos con post | Zap |
| Racha 30 días | 30 días consecutivos | Zap (gold) |
| Post Viral | Post con >100 likes en <24h | TrendingUp |
| Top Chismoso | #1 ranking diario de likes | Trophy |
| Comentarista 100 | 100 comentarios acumulados | MessageCircle |
| Vocero 50 | 50 posts publicados | FileText |
| Madrugador | Post 6-8am con >20 likes | Sunrise |
| Multi-publicador | 5 posts en 1 día | Layers |
| Revelado | 10 posts con identidad revelada | Eye |
| Encuestador | 5 polls publicados | BarChart2 |

### RF7 — Rankings Diarios
- Top 3: más likes recibidos hoy
- Top 3: más posts publicados hoy
- Top 3: más comentarios realizados hoy
- Calculados 23:59 UTC-5, publicados día siguiente
- Histórico accesible (últimos 7 días)

### RF8 — Filtros y Búsqueda
- Filtros de feed: facultad, rango de edad, género, tipo de contenido (texto/poll/efímero)
- Búsqueda unificada: full-text en contenido + búsqueda de #hashtag + búsqueda de @nickname
- Búsqueda en tiempo real (debounce 300ms)
- Historial de búsquedas recientes (localStorage)

### RF9 — Notificaciones
- **Push PWA**: cuando alguien reacciona a tu post, comenta, te menciona, o tu post entra en trending
- **In-app notification center**: campana con lista de actividad, badges de no-leído
- Configuración granular: usuario puede desactivar tipos específicos de notif

### RF10 — Feed en Tiempo Real
- Nuevos posts aparecen sin recargar (SSE o WebSocket)
- Contador "X posts nuevos" al tope del feed (tap para cargar)
- Reacciones en posts visibles se actualizan en tiempo real
- Indicador de "usuarios activos ahora" en el campus (número global)

### RF11 — Algoritmo de Relevancia (30 features)
Ver sección 9.

### RF12 — Monetización
- **Freemium Qhatu+**: stats avanzados de posts, temas exclusivos, badges premium, nickname personalizado sin espera
- **Ads contextuales**: banners nativos para eventos universitarios, academias, servicios del campus — nunca tracking cross-site
- **B2B data**: insights agregados y anónimos para universidades (tendencias del campus, engagement por facultad) — cero datos individuales

---

## 7. Requerimientos No Funcionales

| ID | Categoría | Requisito |
|---|---|---|
| RNF1 | Performance | Lighthouse ≥ 90 mobile; FCP < 1.5s; TTI < 3s; feed initial load < 800ms |
| RNF2 | Seguridad | HTTPS; correos hasheados SHA-256+salt; JWT rotating; rate limiting Redis; no UUIDs en API pública |
| RNF3 | Escalabilidad | Stateless API; feed cache Redis TTL 5min; Redis Streams para eventos; pgvector para embeddings |
| RNF4 | PWA | Instalable; offline básico (feed cacheado); push notifications; standalone display |
| RNF4b | Desktop Responsive | Lighthouse ≥ 90 desktop; sidebar nav en ≥ 1024px; feed 2 columnas; PWA installable en Chrome/Edge desktop |
| RNF5 | Privacidad | Hard delete de cuenta + todos los datos; correo nunca en texto plano; anonimato irreversible |
| RNF6 | Disponibilidad | SLA 99.5% uptime |
| RNF7 | Realtime | SSE o WebSocket; latencia feed update < 2s desde publicación |
| RNF8 | Búsqueda | Full-text search latencia < 200ms para queries típicas |

---

## 8. Entregables

### Entregable 1 — Mockups React
**Stack:** Vite + React + TypeScript + Tailwind + Framer Motion + Lucide React
**Sin backend** — datos mock.

**Vistas:**
1. Login / Bienvenida
2. Registro (paso 1/3)
3. Verificación OTP (paso 2/3)
4. Home / Feed (tabs + filtros + cards + rankings)
5. Crear Post (bottom sheet + composer + counter)
6. Perfil (stats + logros + posts)

---

### Entregable 2 — Producto Completo
**Stack completo** — ver EDD para detalle.

**Incluye todo lo de Entregable 1 más:**
- Auth completo (OTP + JWT)
- Feed con algoritmo 30 features + Redis Streams real-time
- Sistema de follows (nicknames + hashtags)
- Polls + posts efímeros
- Gamificación completa (rachas, logros, rankings)
- Notificaciones push PWA + in-app
- Búsqueda unificada
- WebSocket/SSE feed en tiempo real
- PWA completa (service worker, manifest, offline)
- Deploy en producción

---

## 9. Algoritmo de Relevancia — 30 Features

### Pipeline (4 etapas)
```
[1. Candidate Retrieval] → [2. Feature Hydration] → [3. Light + Heavy Ranking] → [4. Post-Ranking Heuristics]
```

### Etapa 1 — Candidate Retrieval (7 fuentes, ~500 candidatos)

| # | Feature | Bucket | Descripción |
|---|---|---|---|
| 1 | In-network affinity | 40% | Posts de autores con historial interacción via `UserAuthorAffinity` score |
| 2 | Follow graph candidates | 20% | Posts de nicknames seguidos — bucket propio con prioridad alta |
| 3 | Out-of-network cohort | 20% | Posts de misma facultad/cohorte no vistos, ordered by score |
| 4 | Interest vector matching | 10% | Cosine sim pgvector `UserInterestVector` vs `PostEmbedding` (128-dim) |
| 5 | Followed hashtag candidates | 5% | Posts con hashtags seguidos por el viewer |
| 6 | Cross-university discovery | 3% | Posts de otras unis con score global top-1% — badge "Otro campus" |
| 7 | Cold start (new users) | 2% | Primeras 48h: curado por facultad+edad+género declarado, sin historial |

### Etapa 2 — Feature Hydration (~20 señales por candidato)

| # | Feature | Tipo | Peso / Uso |
|---|---|---|---|
| 8 | Reaction score | float | likes×1.0 + fire×1.5 + tea×1.3 + ded×1.2 |
| 9 | Comment score | float | comments×2.0 |
| 10 | Share score | float | shares×2.5 |
| 11 | Report penalty | float | reports×−5.0 |
| 12 | Log2 time decay | float | divisor: `log2(horas+2)` |
| 13 | Trending velocity | float | interacciones/última hora |
| 14 | Poll vote signal | float | votos×0.8 (entre like y comment) |
| 15 | Ephemeral urgency | float | +40% boost en últimas 4h de vida |
| 16 | Identity reveal trust | float | +0.25 si autor se reveló voluntariamente |
| 17 | Author streak bonus | float | `log(streakDays+1)×0.05` |
| 18 | Negative feedback signal | float | dismiss explícito → score×0 + actualiza vector negativo |

### Etapa 3 — Ranking (Light → Heavy)

**Light ranker** (500→~100): descarta si:
- `post_age_hours > 72`
- `reports_count ≥ 3`
- autor bloqueado por viewer
- `viewer_already_seen == true` (pasa a score×0.05)

**Heavy ranker** (~100→top 20):

| # | Feature | Descripción |
|---|---|---|
| 19 | Interaction history boost | +5% por interacción previa viewer→autor (cap 50%) |
| 20 | Cohort faculty boost | +15% misma facultad |
| 21 | Cohort age boost | +10% mismo rango de edad |
| 22 | Embedding proximity boost | +20% si cosine distance < 0.3 |
| 23 | Follow boost | +35% si viewer sigue al autor |
| 24 | Hashtag follow boost | +25% si post tiene hashtag seguido por viewer |
| 25 | Time-of-day personalization | +10% si post publicado en horario históricamente activo del viewer |
| 26 | Session diversity penalty | −20% si mismo hashtag/tema ya apareció ≥3× en sesión actual |
| 27 | Notification re-engagement | post que generó notif de vuelta aparece en top-3 |

### Etapa 4 — Post-Ranking Heuristics

| # | Heurístico | Lógica |
|---|---|---|
| 28 | Author diversity cap | Máx 2 posts del mismo autor en top-20; extras descienden |
| 29 | Content type balance | Mezcla posts texto/polls/efímeros en proporciones configurables |
| 30 | Feedback fatigue | >10 posts mismo autor visto hoy → score×0.3 |
| 31 | Trending injection | Fuerza 1 post viral (>100 likes <6h) en posiciones 3-5 |
| 32 | Freshness guarantee | Mínimo 3 posts de últimas 2h aunque score sea bajo |
| 33 | Seen penalty (soft) | Posts vistos → score×0.05 (no eliminados) |
| 34 | Report cascade demotion | 1 reporte: −20%. 3 reportes: −80%. 5+: oculto |
| 35 | Hashtag trending injection | Hashtag con spike ≥3× promedio últimas 2h → inyectar 1 post por página |

*Nota: features 28-35 son heurísticos post-ranking, se suman a las 30 features de scoring.*

### Real-Time Learning (Redis Streams)
- Cada interacción publica evento en stream `qhatu:interactions`
- Consumer groups: `score-updater`, `embedding-updater`, `affinity-updater`, `notification-dispatcher`
- Interest vector update: EMA `new = 0.9×current + 0.1×postEmbedding×weight`
- Interaction weights: like=0.5, fire=0.7, tea=0.6, ded=0.6, comment=1.0, share=1.2, dismiss=−0.8

---

## 10. Modelo de Datos Conceptual

```
User
├── id, emailHash, nickname, avatarSeed
├── ageRange, gender, faculty, universityDomain
├── streakCount, lastPostDate, totalLikesEarned
├── identityRevealed (bool — puede revelar en ciertos posts)

Post
├── id, authorId, content, type (TEXT/POLL/EPHEMERAL)
├── score, velocityScore
├── isIdentityRevealed (bool — autor optó por revelar en este post)
├── expiresAt (null para texto normal, +24h para efímeros)
├── createdAt, deletedAt

Poll / PollOption / PollVote
Hashtag / PostHashtag
Reaction / Comment / FeedView
UserFollow (followerId, targetNickname OR targetHashtag)
UserAuthorAffinity (viewerId, authorId, score)
UserInterestVector (pgvector 128-dim)
PostEmbedding (pgvector 128-dim)
Achievement / DailyRanking / Notification
UserBlock
```

---

## 11. Roadmap

```
Semana 1-2   → Entregable 1: React mockups (Vite + Tailwind + Lucide + Framer Motion)
Semana 3-4   → Backend: Auth + Posts + Reacciones + Social graph básico
Semana 5-6   → Algoritmo 30 features + Redis Streams + Feed real-time (SSE)
Semana 7     → Polls + Posts efímeros + Gamificación completa + Rankings
Semana 8     → Notificaciones push + Búsqueda + Follows + Identity reveal
Semana 9     → PWA completa + Optimización + QA
Semana 10    → Deploy + Entregable 2
```

---

## 12. Versión Web/Desktop — Análisis de Viabilidad

### Conclusión
**Desktop responsive web: VIABLE y recomendado.** Se implementa como extensión de la PWA existente vía breakpoints CSS — sin cambios de backend, sin segundo repositorio.

**App nativa de escritorio (Electron/Tauri): NO recomendado en v1.**

### Análisis

#### ¿Por qué el desktop web es viable?

| Factor | Evaluación |
|---|---|
| Stack | Next.js 14 ya corre en cualquier browser desktop — cero trabajo de plataforma |
| Esfuerzo | Solo layout CSS: sidebar, 2 columnas, max-width — estimado 1-2 días |
| Audience fit | Estudiantes usan laptops para estudiar → oportunidad de uso en clase/biblioteca |
| PWA installable | Chrome/Edge permiten instalar la PWA en desktop → experiencia "app" sin Electron |
| Backend | Idéntico — SSE, algoritmo, Redis Streams funcionan igual |
| SEO | Páginas públicas (trending, perfiles revelados) ganan crawleability en desktop |

#### Cambios requeridos para desktop responsive

1. **Navegación**: `md:` — sidebar fijo izquierdo reemplaza bottom nav (patrón Twitter/X)
2. **Feed layout**: `lg:` — feed central + panel derecho (tendencias + sugerencias)
3. **Composer**: modal dialog en desktop vs. bottom sheet en mobile
4. **Max-width container**: `max-w-[1280px]` centrado, sin stretching en pantallas 4K
5. **Keyboard shortcuts**: `K` = nuevo post, `?` = ayuda (opcional, mejora UX power users)
6. **Hover states**: cards con hover visible (mouse existe en desktop)
7. **Scrollbar styling**: custom scrollbar para coherencia visual dark

#### ¿Por qué NO Electron/Tauri en v1?

| Factor | Razón |
|---|---|
| PWA cubre el caso | Chrome/Edge instalan la PWA en desktop con notificaciones nativas, offline, ícono en taskbar |
| Overhead Electron | ~150MB instalador solo para un wrapper de browser — injustificado |
| Tauri es más ligero | ~5MB, pero requiere Rust toolchain en CI + distribución/auto-update separada |
| Distribution cost | App stores de escritorio (Microsoft Store, Mac App Store) añaden review y fees |
| Mantenimiento | Dos plataformas (web + desktop) aumentan carga sin beneficio proporcional en v1 |
| Verdict | Revisar en v3+ si hay demanda comprobada de features offline avanzado |

### Breakpoints Target

| Breakpoint | Layout |
|---|---|
| `< 768px` (mobile) | 1 columna + bottom nav (diseño actual) |
| `768px – 1024px` (tablet) | 1 columna + sidebar colapsado (solo iconos) |
| `≥ 1024px` (desktop) | Sidebar expandido + feed central (max 600px) + panel derecho (300px) |
| `≥ 1440px` (wide) | Todo lo anterior + padding lateral generoso, sin stretch |

### Impacto en RNF

Añadir a RNF4:
> **RNF4b — Desktop responsive**: Lighthouse ≥ 90 en desktop. Layout adaptive en ≥ 768px con sidebar nav. PWA installable en Chrome/Edge desktop.

### Priorización

- **Entregable 1**: sidebar y 2 columnas opcionales en mockups (bajo costo, demo profesional)
- **Entregable 2**: implementación completa responsive desde el día 1 en Next.js
- **v2**: evaluar Tauri solo si ≥ 20% de DAU viene de desktop y demandan offline pesado

---

## 13. Fuera del Alcance (v1 / Entregable 2)

- Mensajes directos entre usuarios
- Imágenes/video en posts (v2 post-entregable)
- Moderación automatizada por IA
- App nativa React Native o Flutter — solo PWA
- App de escritorio Electron/Tauri — PWA installable cubre el caso
- Monetización activa (diseñada, no implementada en Entregable 2)
- Panel admin universitario
