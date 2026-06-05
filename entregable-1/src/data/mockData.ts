export interface PostAuthor {
  nickname: string
  avatarSeed: string
  streakDays: number
  faculty: string
}

export interface Post {
  id: string
  author: PostAuthor
  content: string
  reactions: {
    likes: number
    fire: number
    tea: number
    ded: number
  }
  comments: number
  createdAt: string
  isTrending: boolean
  minutesAgo: number
}

export interface RankingEntry {
  type: 'chismoso' | 'publicador' | 'comentarista'
  nickname: string
  value: number
  label: string
}

export const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      nickname: 'CóndorVeloz42',
      avatarSeed: 'C',
      streakDays: 12,
      faculty: 'Ingeniería',
    },
    content:
      'El profe de Cálculo 3 acaba de cancelar el examen parcial porque "no terminé de revisar los temas". Llevamos 4 semanas esperando este momento y ahora esto 💀',
    reactions: { likes: 142, fire: 89, tea: 34, ded: 67 },
    comments: 23,
    createdAt: '2026-05-27T08:30:00',
    isTrending: true,
    minutesAgo: 15,
  },
  {
    id: '2',
    author: {
      nickname: 'LoboAndino_7',
      avatarSeed: 'L',
      streakDays: 5,
      faculty: 'Letras',
    },
    content:
      'La cafetería central subió el menú de S/5.50 a S/8.00 de la noche a la mañana sin avisar. La sopa, el segundo y la limonada. Literalmente inflation universitaria.',
    reactions: { likes: 98, fire: 120, tea: 15, ded: 44 },
    comments: 41,
    createdAt: '2026-05-27T07:45:00',
    isTrending: true,
    minutesAgo: 60,
  },
  {
    id: '3',
    author: {
      nickname: 'ZorroFurtivo',
      avatarSeed: 'Z',
      streakDays: 0,
      faculty: 'Ciencias',
    },
    content:
      'Alguien dejó un cuaderno lleno de apuntes en el piso 3 de la biblioteca. Tiene todo el avance del grupo de Química Orgánica. Si es tuyo avisa antes de que lo entregue a perdidos.',
    reactions: { likes: 56, fire: 12, tea: 78, ded: 5 },
    comments: 17,
    createdAt: '2026-05-27T06:20:00',
    isTrending: false,
    minutesAgo: 140,
  },
  {
    id: '4',
    author: {
      nickname: 'AguiaReal99',
      avatarSeed: 'A',
      streakDays: 30,
      faculty: 'Administración',
    },
    content:
      'El Wi-Fi del pabellón A lleva 3 días caído y TI dice "estamos trabajando en ello". Pregunta: ¿en qué exactamente? Porque claramente no es en arreglarlo.',
    reactions: { likes: 234, fire: 178, tea: 20, ded: 91 },
    comments: 58,
    createdAt: '2026-05-27T05:10:00',
    isTrending: true,
    minutesAgo: 230,
  },
  {
    id: '5',
    author: {
      nickname: 'PumaSecreto',
      avatarSeed: 'P',
      streakDays: 3,
      faculty: 'Medicina',
    },
    content:
      'Confirmado: el examen de Anatomía se filtró por tercera vez consecutiva. El decano ya convocó una reunión de emergencia para el lunes. Que empiece el show.',
    reactions: { likes: 312, fire: 267, tea: 145, ded: 88 },
    comments: 76,
    createdAt: '2026-05-27T04:00:00',
    isTrending: true,
    minutesAgo: 350,
  },
  {
    id: '6',
    author: {
      nickname: 'VikingaDelSur',
      avatarSeed: 'V',
      streakDays: 7,
      faculty: 'Ingeniería',
    },
    content:
      'Mención honorífica al estudiante que llegó a sustentar su tesis con la misma chompa del primer ciclo. Cuatro años de lealtad. Eso se llama consistencia.',
    reactions: { likes: 445, fire: 89, tea: 23, ded: 112 },
    comments: 34,
    createdAt: '2026-05-27T02:30:00',
    isTrending: false,
    minutesAgo: 430,
  },
  {
    id: '7',
    author: {
      nickname: 'ChamanDigital',
      avatarSeed: 'C',
      streakDays: 1,
      faculty: 'Ciencias',
    },
    content:
      'Aviso importante: la impresora del segundo piso del centro de cómputo vuelve a comer hojas. Por favor impriman doble o llevarán sorpresas al aula.',
    reactions: { likes: 33, fire: 8, tea: 5, ded: 19 },
    comments: 9,
    createdAt: '2026-05-27T01:00:00',
    isTrending: false,
    minutesAgo: 510,
  },
]

export const mockRankings: RankingEntry[] = [
  { type: 'chismoso', nickname: 'PumaSecreto', value: 89, label: 'puntos' },
  { type: 'publicador', nickname: 'AguiaReal99', value: 14, label: 'posts hoy' },
  { type: 'comentarista', nickname: 'LoboAndino_7', value: 53, label: 'comentarios' },
]

export const mockUser = {
  nickname: 'CóndorVeloz42',
  avatarSeed: 'C',
  faculty: 'Ingeniería',
  ageRange: '21-23 años',
  posts: 47,
  streakDays: 12,
  totalLikes: 234,
}

export const mockUserPosts: Post[] = [
  {
    id: 'u1',
    author: mockUser,
    content:
      'El profe de Cálculo 3 acaba de cancelar el examen parcial porque "no terminé de revisar los temas". Llevamos 4 semanas esperando este momento y ahora esto 💀',
    reactions: { likes: 142, fire: 89, tea: 34, ded: 67 },
    comments: 23,
    createdAt: '2026-05-27T08:30:00',
    isTrending: true,
    minutesAgo: 15,
  },
  {
    id: 'u2',
    author: mockUser,
    content:
      'Primera fila del auditorio central vacía como siempre. Si nadie la quiere les aviso: los profesores empiezan a mirar ahí cuando hacen preguntas.',
    reactions: { likes: 67, fire: 34, tea: 11, ded: 28 },
    comments: 12,
    createdAt: '2026-05-25T10:00:00',
    isTrending: false,
    minutesAgo: 2940,
  },
  {
    id: 'u3',
    author: mockUser,
    content:
      'El guardia de la entrada me saludó por mi nombre hoy. Nivel de asistencia: preocupante.',
    reactions: { likes: 388, fire: 112, tea: 45, ded: 201 },
    comments: 47,
    createdAt: '2026-05-22T09:15:00',
    isTrending: false,
    minutesAgo: 7000,
  },
]
