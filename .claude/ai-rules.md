# AI Rules — Qhatu

Reglas específicas para agentes AI trabajando en este proyecto.

---

## Contexto del Proyecto

Qhatu es una PWA de micro-blogging universitario anónimo. Monorepo pnpm + Turborepo.
Stack: Next.js 14 (App Router) + Fastify + PostgreSQL (Prisma) + Redis + TypeScript strict.
Branding: dark mode, neon púrpura (#7B3FF2), glassmorphism, Poppins + Inter.
Ver `CLAUDE.md` para referencia completa. Ver `docs/PRD.md` y `docs/EDD.md` para specs.

---

## Reglas de Comportamiento

### 1. Seguridad — NO NEGOCIABLE
- Nunca generar código que guarde correos en texto plano
- Siempre hashear emails: `sha256(email.toLowerCase() + process.env.EMAIL_HASH_SALT)`
- Nunca exponer UUIDs internos en respuestas de API públicas
- Siempre validar con Zod antes de procesar inputs
- Siempre incluir rate limiting en rutas de auth

### 2. Arquitectura (Clean Architecture — 4 capas)
- **Presentation**: route handlers (Fastify) y React components/pages — solo orquestan
- **Application**: Use Cases en `application/` — lógica de flujo, llama a domain + infra ports
- **Domain**: entities + pure services en `domain/` — cero imports externos, cero I/O
- **Infrastructure**: implementaciones concretas de ports (Prisma, Redis, BullMQ, pgvector)
- Regla: las dependencias apuntan siempre hacia el domain. Domain no importa nada.
- Frontend: componentes servidor por defecto; `'use client'` solo si hay interactividad real
- Queries Prisma: solo en repositories (`infrastructure/repositories/`), nunca en use cases directamente
- Estado global: Zustand para UI; TanStack Query para server state
- No mezclar capas — un route handler nunca llama a Prisma directo

### 3. TypeScript
- Strict mode siempre
- No usar `any` sin comentario justificando
- Exportar tipos desde `packages/shared` cuando se usen en ambos apps
- Preferir `interface` para objetos de dominio, `type` para uniones/utilidades

### 4. Estilos
- Tailwind utility classes primero
- Design tokens CSS (de `styles/tokens.css`) para colores, radios, sombras
- Glassmorphism en cards: `rgba(255,255,255,0.05)` + `backdrop-filter: blur(20px)`
- No hardcodear colores de marca — usar variables CSS o clases Tailwind extendidas
- Dark mode siempre; no implementar light mode en v1

### 5. Base de datos
- Nuevas columnas: siempre con `prisma migrate dev`
- Índices obligatorios en campos de filtro frecuente (score, createdAt, nickname)
- Soft delete en Posts (`deletedAt`), hard delete en Users (derecho al olvido)
- No eliminar migrations generadas — son el historial de la DB

### 6. Performance
- Objetivo Lighthouse ≥ 90 mobile
- Paginar todo feed y lista de comentarios (cursor-based, no offset)
- Cache Redis para feeds calculados (TTL 5 min)
- Imágenes: Next.js `<Image>` siempre, nunca `<img>` directo
- Fuentes: `next/font` para Poppins e Inter (evitar layout shift)

---

## Patrones Preferidos

### Fetch con TanStack Query
```typescript
// ✅ Correcto
const { data, isLoading } = useQuery({
  queryKey: ['feed', tab, filters],
  queryFn: () => api.getFeed({ tab, filters }),
  staleTime: 1000 * 60 * 2, // 2 min
})

// ❌ Incorrecto
const [data, setData] = useState(null)
useEffect(() => { fetch('/api/feed').then(...) }, [])
```

### Validación de ruta Fastify
```typescript
// ✅ Correcto
fastify.post('/posts', {
  schema: {
    body: zodToJsonSchema(CreatePostSchema),
  },
  preHandler: [authenticate],
}, async (request, reply) => {
  const post = await postService.create(request.user.id, request.body)
  return reply.status(201).send(post)
})
```

### Hash de email
```typescript
// ✅ Correcto — siempre usar esta función
import { hashEmail } from '@/lib/hash'
const emailHash = hashEmail(email) // sha256 + salt de env

// ❌ NUNCA
await db.user.create({ data: { email } }) // email en texto plano
```

### Calificación de score
```typescript
// ✅ Recalcular en cada interacción
await scoreService.recalculate(postId)

// ❌ No calcular inline en el route handler
```

---

## Lo que NO hacer

- No crear archivos `.env` con valores reales (solo `.env.example`)
- No commitear secrets ni API keys
- No usar `console.log` en producción — usar el logger de Fastify (`request.log.info`)
- No crear endpoints sin autenticación que devuelvan datos de usuarios
- No modificar assets en `public/` (logos de marca)
- No cambiar la paleta de colores del branding
- No implementar mensajes directos (fuera de scope v1)
- No implementar adjuntos multimedia en posts (fuera de scope v1)

---

## Checklist antes de PR

- [ ] TypeScript sin errores (`pnpm typecheck`)
- [ ] Lint limpio (`pnpm lint`)
- [ ] Tests pasan (`pnpm test`)
- [ ] Nuevas rutas tienen validación Zod
- [ ] Nuevas rutas de auth tienen rate limiting
- [ ] Nuevas columnas DB tienen migration generada
- [ ] No hay emails en texto plano
- [ ] No hay UUIDs expuestos en respuestas públicas
- [ ] Componentes nuevos usan design tokens, no colores hardcodeados

---

## Glosario del Dominio

| Término | Significado |
|---|---|
| `nickname` | Identidad pública anónima del usuario |
| `emailHash` | SHA-256+salt del correo institucional |
| `score` | Puntuación de relevancia de un post (algoritmo) |
| `streak` | Racha de días consecutivos con al menos 1 post |
| `tab` | Sección del feed: `for-you`, `trending`, `recent` |
| `tea` | Tipo de reacción (chisme/drama) 👀 |
| `ded` | Tipo de reacción (muy gracioso) 💀 |
