import type { Metadata } from 'next'
import { PostDetail } from './PostDetail'

const API = process.env.API_URL ?? 'http://localhost:3002'

interface RawPost {
  authorNickname: string
  content: string
  media: { url: string; type: string }[]
}

async function getPost(id: string): Promise<RawPost | null> {
  try {
    const r = await fetch(`${API}/posts/${id}`, { cache: 'no-store' })
    if (!r.ok) return null
    return (await r.json()) as RawPost
  } catch {
    return null
  }
}

// Open Graph + Twitter cards → rich previews on WhatsApp / Discord / Facebook / X
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await getPost(params.id)
  if (!post) return { title: 'Qhatu' }

  const title = `${post.authorNickname} · Qhatu`
  const desc  = (post.content || '').slice(0, 180) || 'Post anónimo en Qhatu'
  const image = post.media.find((m) => m.type === 'IMAGE')?.url

  return {
    title,
    description: desc,
    openGraph: {
      title, description: desc, type: 'article', siteName: 'Qhatu',
      url: `/post/${params.id}`,
      images: image ? [{ url: image }] : ['/isotipo.png'],
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title, description: desc,
      images: image ? [image] : ['/isotipo.png'],
    },
  }
}

export default function Page({ params }: { params: { id: string } }) {
  return <PostDetail id={params.id} />
}
