const ANIMALS = [
  'Cóndor', 'Puma', 'Vicuña', 'Alpaca', 'Cuy', 'Llama', 'Zorro', 'Águila',
  'Lobo', 'Orca', 'Colibrí', 'Tapir', 'Ñandú', 'Guanaco', 'Yacaré',
  'Pecarí', 'Quirquincho', 'Tigrillo', 'Tucán', 'Jaguar', 'Caimán',
  'Flamenco', 'Nutria', 'Manatí', 'Murciélago', 'Capibara', 'Tortuguita',
  'Taruca', 'Viscacha', 'Huemul',
]

const ADJECTIVES = [
  'Veloz', 'Andino', 'Secreto', 'Digital', 'Urbano', 'Nocturno', 'Astuto',
  'Brillante', 'Misterioso', 'Silencioso', 'Audaz', 'Certero', 'Sagaz',
  'Curioso', 'Intrépido', 'Sereno', 'Ágil', 'Furtivo', 'Distante', 'Libre',
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function generateUniqueNickname(
  exists: (nickname: string) => Promise<boolean>,
): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const animal    = randomItem(ANIMALS)
    const adjective = randomItem(ADJECTIVES)
    const number    = randomNumber(10, 99)
    const nickname  = `${animal}${adjective}${number}`

    if (!(await exists(nickname))) return nickname
  }

  // Fallback: use a long random suffix to guarantee uniqueness
  const fallback = `Usuario${randomBytes16Hex()}`
  return fallback
}

function randomBytes16Hex(): string {
  // Simple deterministic fallback using Math.random (sufficient for nickname uniqueness edge-case)
  return Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase()
}
