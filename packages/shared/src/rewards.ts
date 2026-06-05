/**
 * Qhatu reward catalog — cosmetic gamification (Discord/Twitter style).
 * Single source of truth shared by FE (render + preview) and BE (grant + equip).
 *
 * Categories:
 *   FRAME        — avatar frame (marco)
 *   NAME_EFFECT  — nickname text effect
 *   STREAK_BADGE — fire-streak tiers
 *   BADGE        — achievement badges
 *   TITLE        — equippable titles
 *
 * Unlock is pure + deterministic from UserStats → previewable client-side.
 */

export type RewardCategory = 'FRAME' | 'NAME_EFFECT' | 'STREAK_BADGE' | 'BADGE' | 'TITLE'
export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC'
export type UnlockType = 'DEFAULT' | 'STREAK' | 'POSTS' | 'LIKES' | 'COMMENTS' | 'FOLLOWERS' | 'POLLS' | 'EPHEMERAL' | 'RANKING' | 'SPECIAL'

export interface RewardUnlock {
  type: UnlockType
  threshold?: number   // streak days / counts / "top N" for RANKING
}

export interface Reward {
  id: string
  name: string
  description: string
  category: RewardCategory
  rarity: Rarity
  unlock: RewardUnlock
  /** Key the SVG generator switches on. */
  variant: string
  /** Optional palette override for the generator. */
  colors?: string[]
  animated?: boolean
}

export interface UserStats {
  streakCount: number
  prestige: number         // completed 365-day cycles (streak material tier)
  postsCount: number
  likesReceived: number
  commentsCount: number
  followers: number
  pollsCreated: number
  ephemeralCount: number
  bestRank: number | null  // best daily-ranking position ever (1 = top)
}

// Prestige material ramp — applied to streak badges as the user completes years
export const PRESTIGE_MATERIALS = [
  { name: 'Cobre',    color: '#B87333', glow: '#E8A867' },
  { name: 'Hierro',   color: '#8A8D91', glow: '#C7CBD1' },
  { name: 'Bronce',   color: '#CD7F32', glow: '#F0B266' },
  { name: 'Plata',    color: '#C0C0C8', glow: '#FFFFFF' },
  { name: 'Oro',      color: '#FFD700', glow: '#FFF1A8' },
  { name: 'Platino',  color: '#7FFFD4', glow: '#D6FFF4' },
  { name: 'Diamante', color: '#6FE3FF', glow: '#C8F6FF' },
  { name: 'Mítico',   color: '#FF4DA6', glow: '#FFC8E6' },
] as const

export function prestigeMaterial(prestige: number) {
  return PRESTIGE_MATERIALS[Math.min(prestige, PRESTIGE_MATERIALS.length - 1)]!
}

export const RARITY_COLOR: Record<Rarity, string> = {
  COMMON:    '#9B95AB',
  RARE:      '#4DA3FF',
  EPIC:      '#B14DFF',
  LEGENDARY: '#FFB23E',
  MYTHIC:    '#FF4D6D',
}

export const RARITY_ORDER: Record<Rarity, number> = {
  COMMON: 0, RARE: 1, EPIC: 2, LEGENDARY: 3, MYTHIC: 4,
}

// ─── Frames ───────────────────────────────────────────────────────────────────

const FRAME_DEFS: { variant: string; name: string; rarity: Rarity; unlock: RewardUnlock; colors: string[]; animated?: boolean }[] = [
  { variant: 'ring',      name: 'Aro Simple',      rarity: 'COMMON',    unlock: { type: 'DEFAULT' },                  colors: ['#9B95AB'] },
  { variant: 'ring',      name: 'Aro Lavanda',     rarity: 'COMMON',    unlock: { type: 'POSTS', threshold: 1 },      colors: ['#C8B6FF'] },
  { variant: 'dashed',    name: 'Aro Punteado',    rarity: 'COMMON',    unlock: { type: 'POSTS', threshold: 5 },      colors: ['#7B3FF2'] },
  { variant: 'double',    name: 'Doble Aro',       rarity: 'RARE',      unlock: { type: 'POSTS', threshold: 20 },     colors: ['#7B3FF2', '#C8B6FF'] },
  { variant: 'glow',      name: 'Aro Brillante',   rarity: 'RARE',      unlock: { type: 'LIKES', threshold: 50 },     colors: ['#7B3FF2'] },
  { variant: 'neon',      name: 'Neón Cian',       rarity: 'RARE',      unlock: { type: 'LIKES', threshold: 100 },    colors: ['#00E5FF'] },
  { variant: 'neon',      name: 'Neón Rosa',       rarity: 'RARE',      unlock: { type: 'FOLLOWERS', threshold: 10 }, colors: ['#FF4DA6'] },
  { variant: 'andean',    name: 'Marco Andino',    rarity: 'EPIC',      unlock: { type: 'STREAK', threshold: 14 },    colors: ['#FF8A3D', '#7B3FF2'] },
  { variant: 'fire',      name: 'Marco de Fuego',  rarity: 'EPIC',      unlock: { type: 'STREAK', threshold: 30 },    colors: ['#FF6B00', '#FFB23E'], animated: true },
  { variant: 'ice',       name: 'Marco de Hielo',  rarity: 'EPIC',      unlock: { type: 'LIKES', threshold: 500 },    colors: ['#9BE5FF', '#4DA3FF'] },
  { variant: 'leaves',    name: 'Marco Sakura',    rarity: 'EPIC',      unlock: { type: 'FOLLOWERS', threshold: 50 }, colors: ['#FFB6D9', '#FF7AB6'] },
  { variant: 'gold',      name: 'Marco Dorado',    rarity: 'LEGENDARY', unlock: { type: 'LIKES', threshold: 1000 },   colors: ['#FFD700', '#FFB23E'], animated: true },
  { variant: 'cosmic',    name: 'Marco Cósmico',   rarity: 'LEGENDARY', unlock: { type: 'STREAK', threshold: 100 },   colors: ['#7B3FF2', '#00E5FF', '#FF4DA6'], animated: true },
  { variant: 'glitch',    name: 'Marco Glitch',    rarity: 'LEGENDARY', unlock: { type: 'RANKING', threshold: 3 },    colors: ['#FF4D6D', '#00E5FF'], animated: true },
  { variant: 'crown',     name: 'Marco Real',      rarity: 'MYTHIC',    unlock: { type: 'RANKING', threshold: 1 },    colors: ['#FFD700', '#FF4D6D'], animated: true },
  { variant: 'aurora',    name: 'Aurora',          rarity: 'MYTHIC',    unlock: { type: 'STREAK', threshold: 365 },   colors: ['#00E5FF', '#7B3FF2', '#FF4DA6', '#FFB23E'], animated: true },
  // — extra —
  { variant: 'dashed',    name: 'Aro Cian',        rarity: 'COMMON',    unlock: { type: 'COMMENTS', threshold: 5 },   colors: ['#00E5FF'] },
  { variant: 'glow',      name: 'Esmeralda',       rarity: 'RARE',      unlock: { type: 'COMMENTS', threshold: 80 },  colors: ['#3DFF8A'] },
  { variant: 'neon',      name: 'Neón Oro',        rarity: 'RARE',      unlock: { type: 'POSTS', threshold: 40 },     colors: ['#FFD700'] },
  { variant: 'double',    name: 'Doble Rosa',      rarity: 'RARE',      unlock: { type: 'FOLLOWERS', threshold: 20 }, colors: ['#FF4DA6', '#FFC36F'] },
  { variant: 'ice',       name: 'Escarcha',        rarity: 'EPIC',      unlock: { type: 'STREAK', threshold: 21 },    colors: ['#C8B6FF', '#7B3FF2'] },
  { variant: 'fire',      name: 'Fuego Azul',      rarity: 'EPIC',      unlock: { type: 'LIKES', threshold: 750 },    colors: ['#00E5FF', '#4D7BFF'], animated: true },
  { variant: 'leaves',    name: 'Otoño',           rarity: 'EPIC',      unlock: { type: 'POSTS', threshold: 200 },    colors: ['#FF8A3D', '#FFB23E'] },
  { variant: 'cosmic',    name: 'Nebulosa',        rarity: 'LEGENDARY', unlock: { type: 'LIKES', threshold: 4000 },   colors: ['#3DFF8A', '#00E5FF', '#7B3FF2'], animated: true },
  { variant: 'aurora',    name: 'Eclipse',         rarity: 'MYTHIC',    unlock: { type: 'STREAK', threshold: 300 },   colors: ['#B14DFF', '#FF4DA6', '#00E5FF', '#FFD700'], animated: true },
]

// ─── Name effects ─────────────────────────────────────────────────────────────

const NAME_DEFS: { variant: string; name: string; rarity: Rarity; unlock: RewardUnlock; colors: string[]; animated?: boolean }[] = [
  { variant: 'plain',     name: 'Normal',          rarity: 'COMMON',    unlock: { type: 'DEFAULT' },                   colors: ['#FFFFFF'] },
  { variant: 'gradient',  name: 'Degradado Qhatu', rarity: 'COMMON',    unlock: { type: 'POSTS', threshold: 3 },       colors: ['#7B3FF2', '#C8B6FF'] },
  { variant: 'gradient',  name: 'Lavanda',         rarity: 'COMMON',    unlock: { type: 'POSTS', threshold: 8 },       colors: ['#C8B6FF', '#E9E1FF'] },
  { variant: 'glow',      name: 'Brillo Lavanda',  rarity: 'RARE',      unlock: { type: 'LIKES', threshold: 25 },      colors: ['#C8B6FF'], animated: true },
  { variant: 'gradient',  name: 'Atardecer',       rarity: 'RARE',      unlock: { type: 'POSTS', threshold: 50 },      colors: ['#FF8A3D', '#FF4DA6'] },
  { variant: 'gradient',  name: 'Océano',          rarity: 'RARE',      unlock: { type: 'COMMENTS', threshold: 50 },   colors: ['#00E5FF', '#4DA3FF'] },
  { variant: 'gradient',  name: 'Caramelo',        rarity: 'RARE',      unlock: { type: 'FOLLOWERS', threshold: 5 },   colors: ['#FF6FD8', '#FFC36F'] },
  { variant: 'gradient',  name: 'Menta',           rarity: 'RARE',      unlock: { type: 'COMMENTS', threshold: 120 },  colors: ['#3DFFC2', '#7BFFE3'] },
  { variant: 'shadow',    name: 'Sombra',          rarity: 'RARE',      unlock: { type: 'EPHEMERAL', threshold: 5 },   colors: ['#B9B3C7'] },
  { variant: 'fire',      name: 'Fuego',           rarity: 'EPIC',      unlock: { type: 'STREAK', threshold: 30 },     colors: ['#FF6B00', '#FFD700'], animated: true },
  { variant: 'gradient',  name: 'Tóxico',          rarity: 'EPIC',      unlock: { type: 'COMMENTS', threshold: 200 },  colors: ['#9BFF3D', '#3DFF8A'] },
  { variant: 'rainbow',   name: 'Arcoíris',        rarity: 'EPIC',      unlock: { type: 'FOLLOWERS', threshold: 25 },  colors: [], animated: true },
  { variant: 'glow',      name: 'Neón Cian',       rarity: 'EPIC',      unlock: { type: 'LIKES', threshold: 500 },     colors: ['#00E5FF'], animated: true },
  { variant: 'glow',      name: 'Neón Rosa',       rarity: 'EPIC',      unlock: { type: 'FOLLOWERS', threshold: 40 },  colors: ['#FF4DA6'], animated: true },
  { variant: 'gradient',  name: 'Galaxia',         rarity: 'EPIC',      unlock: { type: 'STREAK', threshold: 45 },     colors: ['#7B3FF2', '#00E5FF', '#FF4DA6'] },
  { variant: 'chrome',    name: 'Cromo',           rarity: 'EPIC',      unlock: { type: 'POSTS', threshold: 150 },     colors: ['#E8E8F0', '#9BA3B5'], animated: true },
  { variant: 'glitch',    name: 'Glitch',          rarity: 'LEGENDARY', unlock: { type: 'RANKING', threshold: 3 },     colors: ['#FF4D6D', '#00E5FF'], animated: true },
  { variant: 'gold',      name: 'Oro Líquido',     rarity: 'LEGENDARY', unlock: { type: 'LIKES', threshold: 2000 },    colors: ['#FFD700', '#FFB23E'], animated: true },
  { variant: 'matrix',    name: 'Matrix',          rarity: 'LEGENDARY', unlock: { type: 'STREAK', threshold: 100 },    colors: ['#00FF66'], animated: true },
  { variant: 'gradient',  name: 'Lava',            rarity: 'LEGENDARY', unlock: { type: 'LIKES', threshold: 3500 },    colors: ['#FF3D00', '#FFC400'], animated: true },
  { variant: 'holo',      name: 'Holograma',       rarity: 'MYTHIC',    unlock: { type: 'RANKING', threshold: 1 },     colors: ['#7B3FF2', '#00E5FF', '#FF4DA6'], animated: true },
  { variant: 'blood',     name: 'Sangre',          rarity: 'MYTHIC',    unlock: { type: 'SPECIAL' },                   colors: ['#FF1A3C', '#8B0000'], animated: true },
  { variant: 'holo',      name: 'Prisma',          rarity: 'MYTHIC',    unlock: { type: 'STREAK', threshold: 200 },    colors: ['#FF4DA6', '#9BFF3D', '#00E5FF'], animated: true },
]

// ─── Streak badges ──────────────────────────────────────────────────────────

// Each streak tier has a unique name + colour ramp + visual style key.
const STREAK_DEFS: { days: number; name: string; style: string; colors: string[] }[] = [
  { days: 3,   name: 'Chispa',     style: 'ember',   colors: ['#FFB23E', '#FF8A3D'] },
  { days: 7,   name: 'Llama',      style: 'flame',   colors: ['#FF8A3D', '#FF4D00'] },
  { days: 14,  name: 'Fogata',     style: 'fire',    colors: ['#FF4D00', '#FF1A3C'] },
  { days: 30,  name: 'Brasa Viva', style: 'blaze',   colors: ['#FF4DA6', '#FF6B00'] },
  { days: 60,  name: 'Azul Vivo',  style: 'azure',   colors: ['#00E5FF', '#4D7BFF'] },
  { days: 100, name: 'Oro Ardiente', style: 'gold',  colors: ['#FFD700', '#FFB23E'] },
  { days: 150, name: 'Esmeralda',  style: 'emerald', colors: ['#3DFF8A', '#00C46A'] },
  { days: 200, name: 'Magenta',    style: 'magenta', colors: ['#FF4DA6', '#B14DFF'] },
  { days: 300, name: 'Cósmico',    style: 'cosmic',  colors: ['#7B3FF2', '#00E5FF', '#FF4DA6'] },
  { days: 365, name: 'Fénix',      style: 'phoenix', colors: ['#FFD700', '#FF4D00', '#FF1A3C'] },
]
function streakRarity(days: number): Rarity {
  if (days >= 300) return 'MYTHIC'
  if (days >= 100) return 'LEGENDARY'
  if (days >= 30)  return 'EPIC'
  if (days >= 7)   return 'RARE'
  return 'COMMON'
}

// ─── Achievement badges ───────────────────────────────────────────────────────

const BADGE_DEFS: { variant: string; name: string; description: string; rarity: Rarity; unlock: RewardUnlock }[] = [
  { variant: 'spark',    name: 'Primer Post',       description: 'Publicaste tu primer post',          rarity: 'COMMON',    unlock: { type: 'POSTS', threshold: 1 } },
  { variant: 'pen',      name: 'Escritor',          description: '10 posts publicados',                rarity: 'COMMON',    unlock: { type: 'POSTS', threshold: 10 } },
  { variant: 'pen',      name: 'Prolífico',         description: '100 posts publicados',               rarity: 'RARE',      unlock: { type: 'POSTS', threshold: 100 } },
  { variant: 'pen',      name: 'Imparable',         description: '500 posts publicados',               rarity: 'EPIC',      unlock: { type: 'POSTS', threshold: 500 } },
  { variant: 'heart',    name: 'Querido',           description: '10 likes recibidos',                 rarity: 'COMMON',    unlock: { type: 'LIKES', threshold: 10 } },
  { variant: 'heart',    name: 'Popular',           description: '100 likes recibidos',                rarity: 'RARE',      unlock: { type: 'LIKES', threshold: 100 } },
  { variant: 'heart',    name: 'Idolatrado',        description: '1000 likes recibidos',               rarity: 'EPIC',      unlock: { type: 'LIKES', threshold: 1000 } },
  { variant: 'heart',    name: 'Fenómeno',          description: '5000 likes recibidos',               rarity: 'LEGENDARY', unlock: { type: 'LIKES', threshold: 5000 } },
  { variant: 'chat',     name: 'Conversador',       description: '50 comentarios hechos',              rarity: 'COMMON',    unlock: { type: 'COMMENTS', threshold: 50 } },
  { variant: 'chat',     name: 'Debatero',          description: '500 comentarios hechos',             rarity: 'RARE',      unlock: { type: 'COMMENTS', threshold: 500 } },
  { variant: 'poll',     name: 'Encuestador',       description: '5 encuestas creadas',                rarity: 'RARE',      unlock: { type: 'POLLS', threshold: 5 } },
  { variant: 'poll',     name: 'Sondeador',         description: '25 encuestas creadas',               rarity: 'EPIC',      unlock: { type: 'POLLS', threshold: 25 } },
  { variant: 'ghost',    name: 'Efímero',           description: '10 posts efímeros',                  rarity: 'RARE',      unlock: { type: 'EPHEMERAL', threshold: 10 } },
  { variant: 'ghost',    name: 'Fantasma',          description: '50 posts efímeros',                  rarity: 'EPIC',      unlock: { type: 'EPHEMERAL', threshold: 50 } },
  { variant: 'people',   name: 'Magnético',         description: '10 seguidores',                      rarity: 'COMMON',    unlock: { type: 'FOLLOWERS', threshold: 10 } },
  { variant: 'people',   name: 'Influencer',        description: '100 seguidores',                     rarity: 'EPIC',      unlock: { type: 'FOLLOWERS', threshold: 100 } },
  { variant: 'people',   name: 'Celebridad',        description: '500 seguidores',                     rarity: 'LEGENDARY', unlock: { type: 'FOLLOWERS', threshold: 500 } },
  { variant: 'flame',    name: 'En Racha',          description: '7 días seguidos',                    rarity: 'COMMON',    unlock: { type: 'STREAK', threshold: 7 } },
  { variant: 'flame',    name: 'Constante',         description: '30 días seguidos',                   rarity: 'RARE',      unlock: { type: 'STREAK', threshold: 30 } },
  { variant: 'flame',    name: 'Devoto',            description: '100 días seguidos',                  rarity: 'LEGENDARY', unlock: { type: 'STREAK', threshold: 100 } },
  { variant: 'trophy',   name: 'Podio',             description: 'Top 3 del ranking diario',           rarity: 'EPIC',      unlock: { type: 'RANKING', threshold: 3 } },
  { variant: 'crown',    name: 'Número Uno',        description: '#1 del ranking diario',              rarity: 'LEGENDARY', unlock: { type: 'RANKING', threshold: 1 } },
  { variant: 'rocket',   name: 'Viral',             description: 'Un post que explotó',                rarity: 'LEGENDARY', unlock: { type: 'LIKES', threshold: 2500 } },
  { variant: 'mask',     name: 'Sin Máscara',       description: 'Revelaste tu identidad en un post',  rarity: 'RARE',      unlock: { type: 'SPECIAL' } },
  { variant: 'star',     name: 'Pionero',           description: 'De los primeros en Qhatu',           rarity: 'MYTHIC',    unlock: { type: 'SPECIAL' } },
  // — extra —
  { variant: 'pen',      name: 'Veterano',          description: '250 posts publicados',               rarity: 'LEGENDARY', unlock: { type: 'POSTS', threshold: 250 } },
  { variant: 'heart',    name: 'Amado',             description: '250 likes recibidos',                rarity: 'RARE',      unlock: { type: 'LIKES', threshold: 250 } },
  { variant: 'heart',    name: 'Mito Vivo',         description: '10000 likes recibidos',              rarity: 'MYTHIC',    unlock: { type: 'LIKES', threshold: 10000 } },
  { variant: 'chat',     name: 'Charlatán',         description: '1000 comentarios',                   rarity: 'EPIC',      unlock: { type: 'COMMENTS', threshold: 1000 } },
  { variant: 'poll',     name: 'Estadístico',       description: '50 encuestas creadas',               rarity: 'LEGENDARY', unlock: { type: 'POLLS', threshold: 50 } },
  { variant: 'people',   name: 'Conocido',          description: '50 seguidores',                      rarity: 'RARE',      unlock: { type: 'FOLLOWERS', threshold: 50 } },
  { variant: 'people',   name: 'Estrella',          description: '1000 seguidores',                    rarity: 'MYTHIC',    unlock: { type: 'FOLLOWERS', threshold: 1000 } },
  { variant: 'flame',    name: 'Llama Eterna',      description: '200 días seguidos',                  rarity: 'MYTHIC',    unlock: { type: 'STREAK', threshold: 200 } },
  { variant: 'flame',    name: 'Inquebrantable',    description: '365 días seguidos',                  rarity: 'MYTHIC',    unlock: { type: 'STREAK', threshold: 365 } },
  { variant: 'rocket',   name: 'Despegue',          description: '50 posts efímeros',                  rarity: 'EPIC',      unlock: { type: 'EPHEMERAL', threshold: 25 } },
  { variant: 'trophy',   name: 'Top 10',            description: 'Top 10 del ranking diario',          rarity: 'RARE',      unlock: { type: 'RANKING', threshold: 10 } },
  { variant: 'spark',    name: 'Constancia',        description: '14 días seguidos',                   rarity: 'RARE',      unlock: { type: 'STREAK', threshold: 14 } },
]

// ─── Titles ─────────────────────────────────────────────────────────────────

const TITLE_DEFS: { name: string; rarity: Rarity; unlock: RewardUnlock }[] = [
  { name: 'Novato',              rarity: 'COMMON',    unlock: { type: 'DEFAULT' } },
  { name: 'Curioso',             rarity: 'COMMON',    unlock: { type: 'POSTS', threshold: 10 } },
  { name: 'Chismoso',            rarity: 'RARE',      unlock: { type: 'POSTS', threshold: 50 } },
  { name: 'Comentarista',        rarity: 'RARE',      unlock: { type: 'COMMENTS', threshold: 100 } },
  { name: 'Encuestador',         rarity: 'RARE',      unlock: { type: 'POLLS', threshold: 10 } },
  { name: 'Búho Nocturno',       rarity: 'RARE',      unlock: { type: 'SPECIAL' } },
  { name: 'Madrugador',          rarity: 'RARE',      unlock: { type: 'SPECIAL' } },
  { name: 'Influencer',          rarity: 'EPIC',      unlock: { type: 'FOLLOWERS', threshold: 100 } },
  { name: 'Veterano',            rarity: 'EPIC',      unlock: { type: 'STREAK', threshold: 60 } },
  { name: 'El Viral',            rarity: 'EPIC',      unlock: { type: 'LIKES', threshold: 2500 } },
  { name: 'Fantasma',            rarity: 'EPIC',      unlock: { type: 'EPHEMERAL', threshold: 50 } },
  { name: 'Coleccionista',       rarity: 'LEGENDARY', unlock: { type: 'SPECIAL' } },
  { name: 'Leyenda del Campus',  rarity: 'LEGENDARY', unlock: { type: 'RANKING', threshold: 1 } },
  { name: 'Inmortal',            rarity: 'MYTHIC',    unlock: { type: 'STREAK', threshold: 365 } },
  { name: 'Mítico',              rarity: 'MYTHIC',    unlock: { type: 'LIKES', threshold: 10000 } },
  // — extra —
  { name: 'Anónimo Pro',         rarity: 'COMMON',    unlock: { type: 'POSTS', threshold: 25 } },
  { name: 'Tendencia',           rarity: 'EPIC',      unlock: { type: 'RANKING', threshold: 3 } },
  { name: 'Sabelotodo',          rarity: 'RARE',      unlock: { type: 'COMMENTS', threshold: 300 } },
  { name: 'Imán Social',         rarity: 'EPIC',      unlock: { type: 'FOLLOWERS', threshold: 200 } },
  { name: 'Racha de Hierro',     rarity: 'LEGENDARY', unlock: { type: 'STREAK', threshold: 150 } },
  { name: 'Ídolo',               rarity: 'LEGENDARY', unlock: { type: 'LIKES', threshold: 5000 } },
  { name: 'Espíritu Libre',      rarity: 'EPIC',      unlock: { type: 'EPHEMERAL', threshold: 30 } },
]

// ─── Build the catalog ─────────────────────────────────────────────────────────

function slug(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function buildCatalog(): Reward[] {
  const out: Reward[] = []

  FRAME_DEFS.forEach((f, i) => out.push({
    id: `frame-${slug(f.name)}-${i}`,
    name: f.name,
    description: `Marco ${f.rarity.toLowerCase()}`,
    category: 'FRAME',
    rarity: f.rarity,
    unlock: f.unlock,
    variant: f.variant,
    colors: f.colors,
    animated: f.animated,
  }))

  NAME_DEFS.forEach((n, i) => out.push({
    id: `name-${slug(n.name)}-${i}`,
    name: n.name,
    description: `Efecto de nombre ${n.rarity.toLowerCase()}`,
    category: 'NAME_EFFECT',
    rarity: n.rarity,
    unlock: n.unlock,
    variant: n.variant,
    colors: n.colors,
    animated: n.animated,
  }))

  STREAK_DEFS.forEach((s) => {
    const rarity = streakRarity(s.days)
    out.push({
      id: `streak-${s.days}`,
      name: `${s.name} · ${s.days}d`,
      description: `Publicaste ${s.days} días seguidos`,
      category: 'STREAK_BADGE',
      rarity,
      unlock: { type: 'STREAK', threshold: s.days },
      variant: s.style,             // unique per tier → unique visual
      colors: s.colors,
      animated: s.days >= 30,
    })
  })

  BADGE_DEFS.forEach((b, i) => out.push({
    id: `badge-${slug(b.name)}-${i}`,
    name: b.name,
    description: b.description,
    category: 'BADGE',
    rarity: b.rarity,
    unlock: b.unlock,
    variant: b.variant,
    colors: [RARITY_COLOR[b.rarity]],
    animated: RARITY_ORDER[b.rarity] >= 3,
  }))

  TITLE_DEFS.forEach((t, i) => out.push({
    id: `title-${slug(t.name)}-${i}`,
    name: t.name,
    description: `Título ${t.rarity.toLowerCase()}`,
    category: 'TITLE',
    rarity: t.rarity,
    unlock: t.unlock,
    variant: 'title',
    colors: [RARITY_COLOR[t.rarity]],
  }))

  return out
}

export const REWARDS: Reward[] = buildCatalog()

export const REWARDS_BY_ID: Record<string, Reward> = Object.fromEntries(REWARDS.map((r) => [r.id, r]))

export function getReward(id: string): Reward | undefined {
  return REWARDS_BY_ID[id]
}

export function rewardsByCategory(category: RewardCategory): Reward[] {
  return REWARDS.filter((r) => r.category === category)
}

// ─── Unlock evaluation (pure) ───────────────────────────────────────────────────

export function qualifies(reward: Reward, s: UserStats): boolean {
  const t = reward.unlock.threshold ?? 0
  switch (reward.unlock.type) {
    case 'DEFAULT':   return true
    case 'STREAK':    return s.streakCount    >= t
    case 'POSTS':     return s.postsCount     >= t
    case 'LIKES':     return s.likesReceived  >= t
    case 'COMMENTS':  return s.commentsCount  >= t
    case 'FOLLOWERS': return s.followers      >= t
    case 'POLLS':     return s.pollsCreated   >= t
    case 'EPHEMERAL': return s.ephemeralCount >= t
    case 'RANKING':   return s.bestRank != null && s.bestRank <= t
    case 'SPECIAL':   return false  // granted explicitly (events / actions)
    default:          return false
  }
}

/** All reward ids the stats currently qualify for (excludes SPECIAL). */
export function unlockedRewardIds(s: UserStats): string[] {
  return REWARDS.filter((r) => qualifies(r, s)).map((r) => r.id)
}

export const TOTAL_REWARDS = REWARDS.length
