// All requests go through the Next.js rewrite proxy (/api → localhost:3002)
// so cookies are same-origin and credentials are sent automatically.
const BASE = '/api'

export class ApiError extends Error {
  public status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  opts?: Omit<RequestInit, 'headers'> & { token?: string }
): Promise<T> {
  const { token, ...fetchOpts } = opts ?? {}
  const headers: Record<string, string> = {
    // Only set JSON content-type when there's actually a body — otherwise Fastify
    // rejects the empty body ("Body cannot be empty when content-type is json").
    ...(fetchOpts.body != null ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  const res = await fetch(`${BASE}${path}`, {
    ...fetchOpts,
    headers,
    credentials: 'include',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string }
    throw new ApiError(res.status, body.message ?? 'Error desconocido')
  }
  return res.json() as Promise<T>
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  nickname: string
  avatarSeed: string
  faculty: string | null
}

export interface VerifyOtpPayload {
  email: string
  otp: string
  faculty?: string
  ageRange?: string
  gender?: string
}

export type ReactionType = 'LIKE' | 'FIRE' | 'TEA' | 'DED'

export interface PollOption {
  id: string
  text: string
  votesCount: number
  isMyVote: boolean
}

export type MediaType = 'IMAGE' | 'VIDEO'

export interface MediaItem {
  url: string
  type: MediaType
}

export interface PostItem {
  id: string
  content: string
  type: 'TEXT' | 'POLL' | 'EPHEMERAL'
  media: MediaItem[]
  authorFrame: string | null
  authorNameEffect: string | null
  authorTitle: string | null
  isMine: boolean
  isIdentityRevealed: boolean
  authorNickname: string
  authorAvatarSeed: string
  authorAvatarUrl: string | null
  authorFaculty: string | null
  hashtags: string[]
  likesCount: number
  fireCount: number
  teaCount: number
  dedCount: number
  commentsCount: number
  myReaction: ReactionType | null
  expiresAt: string | null
  createdAt: string
  poll: {
    id: string
    question: string
    options: PollOption[]
  } | null
}

export interface FeedPage {
  posts: PostItem[]
  nextCursor: string | null
}

export interface CommentItem {
  id: string
  postId: string
  authorNickname: string
  content: string
  createdAt: string
}

export interface CommentsPage {
  comments: CommentItem[]
  nextCursor: string | null
}

// ─── API client ───────────────────────────────────────────────────────────────

export interface UserProfile {
  nickname: string
  avatarSeed: string
  faculty: string | null
  universityDomain: string
  streakCount: number
  totalLikesEarned: number
  createdAt: string
}

export interface EquippedSlots {
  frame: string | null
  nameEffect: string | null
  badge: string | null
  title: string | null
}

export interface MeProfile extends UserProfile {
  id: string
  avatarUrl: string | null
  ageRange: string | null
  prestige: number
  equipped: EquippedSlots
}

export interface RewardStats {
  streakCount: number
  prestige: number
  postsCount: number
  likesReceived: number
  commentsCount: number
  followers: number
  pollsCreated: number
  ephemeralCount: number
  bestRank: number | null
}

export interface RewardsProfile {
  stats: RewardStats
  owned: string[]
  equipped: EquippedSlots
}

export interface RankingEntry {
  rank: number
  value: number
  nickname: string
  avatarSeed: string
  frame: string | null
  title: string | null
}

export const api = {
  users: {
    me: (token: string) =>
      request<MeProfile>('/users/me', { token }),

    profile: (nickname: string) =>
      request<UserProfile>(`/users/${nickname}`),

    updateAvatar: (avatarSeed: string, token: string) =>
      request<{ avatarSeed: string }>('/users/me/avatar', {
        method: 'PATCH',
        body: JSON.stringify({ avatarSeed }),
        token,
      }),
  },

  auth: {
    register: (email: string) =>
      request<{ message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    verifyOtp: (data: VerifyOtpPayload) =>
      request<{ accessToken: string; user: AuthUser }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    refresh: () =>
      request<{ accessToken: string }>('/auth/refresh', { method: 'POST' }),

    // ── "Perdí mi cuenta": OTP al correo → reinicia identidad (posts intactos) ──
    recoverRequest: (email: string) =>
      request<{ message: string }>('/auth/account/recover-request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    recoverConfirm: (email: string, otp: string) =>
      request<{ accessToken: string; user: AuthUser }>('/auth/account/recover-confirm', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      }),

    logout: (token: string) =>
      request<{ message: string }>('/auth/logout', { method: 'POST', token }),

    // ── QR rotating login ──
    qrCreate: () =>
      request<{ sessionId: string; expiresAt: string }>('/auth/qr/create', { method: 'POST' }),

    qrStatus: (sessionId: string) =>
      request<{ status: 'PENDING' | 'APPROVED' | 'CONSUMED' | 'EXPIRED' }>(`/auth/qr/status?s=${encodeURIComponent(sessionId)}`),

    qrApprove: (sessionId: string, token: string) =>
      request<{ ok: boolean }>('/auth/qr/approve', { method: 'POST', body: JSON.stringify({ sessionId }), token }),

    qrClaim: (sessionId: string) =>
      request<{ accessToken: string; user: AuthUser }>('/auth/qr/claim', { method: 'POST', body: JSON.stringify({ sessionId }) }),

    // ── Account security ──
    changeEmailRequest: (newEmail: string, token: string) =>
      request<{ message: string }>('/auth/email/change-request', { method: 'POST', body: JSON.stringify({ newEmail }), token }),

    changeEmailConfirm: (newEmail: string, otp: string, token: string) =>
      request<{ message: string }>('/auth/email/change-confirm', { method: 'POST', body: JSON.stringify({ newEmail, otp }), token }),

    deleteRequest: (emailAddr: string, token: string) =>
      request<{ message: string }>('/auth/account/delete-request', { method: 'POST', body: JSON.stringify({ email: emailAddr }), token }),

    deleteConfirm: (deleteToken: string) =>
      request<{ message: string }>('/auth/account/delete-confirm', { method: 'POST', body: JSON.stringify({ token: deleteToken }) }),
  },

  media: {
    config: () =>
      request<{ enabled: boolean }>('/media/config'),

    presign: (contentType: string, size: number, token: string) =>
      request<{
        uploadUrl: string
        key: string
        expiresIn: number
        mediaType: MediaType
      }>('/media/presign', {
        method: 'POST',
        body: JSON.stringify({ contentType, size }),
        token,
      }),
  },

  posts: {
    publicFeed: (params: { tab?: string; cursor?: string }) =>
      request<FeedPage>(`/posts/public?tab=${params.tab === 'trending' ? 'trending' : 'recent'}${params.cursor ? `&cursor=${params.cursor}` : ''}`),

    feed: (params: { tab?: string; cursor?: string }, token: string) =>
      request<FeedPage>(`/posts/feed?tab=${params.tab ?? 'recent'}${params.cursor ? `&cursor=${params.cursor}` : ''}`, { token }),

    create: (data: { content: string; type: string; isIdentityRevealed: boolean; media?: { key: string; type: MediaType }[]; embedding?: number[]; poll?: { question: string; options: string[] } }, token: string) =>
      request<PostItem>('/posts', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),

    get: (id: string) =>
      request<PostItem>(`/posts/${id}`),

    delete: (id: string, token: string) =>
      request<{ message: string }>(`/posts/${id}`, { method: 'DELETE', token }),

    vote: (postId: string, optionId: string, token: string) =>
      request<{ ok: boolean }>(`/posts/${postId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ optionId }),
        token,
      }),

    react: (postId: string, type: ReactionType, token: string) =>
      request<{ action: 'added' | 'removed' }>(`/posts/${postId}/react`, {
        method: 'POST',
        body: JSON.stringify({ type }),
        token,
      }),

    comments: (postId: string, token: string, cursor?: string) =>
      request<CommentsPage>(`/posts/${postId}/comments${cursor ? `?cursor=${cursor}` : ''}`, { token }),

    addComment: (postId: string, content: string, token: string) =>
      request<CommentItem>(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
        token,
      }),
  },

  search: {
    query: (q: string, scope: 'all' | 'posts' | 'users' | 'hashtags', token: string | undefined, embedding?: number[]) =>
      request<{
        posts: { id: string; content: string; authorNickname: string; authorAvatarSeed: string; createdAt: string; likesCount: number; commentsCount: number; hasMedia: boolean }[]
        users: { nickname: string; avatarSeed: string; faculty: string | null }[]
        hashtags: { tag: string; postCount: number }[]
        semantic: { id: string; content: string; authorNickname: string; authorAvatarSeed: string; createdAt: string; likesCount: number; commentsCount: number; hasMedia: boolean }[]
      }>('/search', { method: 'POST', body: JSON.stringify({ q, scope, embedding }), token }),
  },

  notifications: {
    list: (token: string, cursor?: string) =>
      request<{
        notifications: { id: string; type: string; payload: unknown; read: boolean; createdAt: string }[]
        unreadCount: number
        nextCursor: string | null
      }>(`/notifications${cursor ? `?cursor=${cursor}` : ''}`, { token }),

    unreadCount: (token: string) =>
      request<{ count: number }>('/notifications/unread-count', { token }),

    markRead: (id: string, token: string) =>
      request<{ ok: boolean }>(`/notifications/read/${id}`, { method: 'POST', token }),

    markAllRead: (token: string) =>
      request<{ ok: boolean }>('/notifications/read-all', { method: 'POST', token }),

    vapidKey: () =>
      request<{ publicKey: string }>('/notifications/vapid-public-key'),

    subscribe: (subscription: PushSubscriptionJSON, token: string) =>
      request<{ ok: boolean }>('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription }),
        token,
      }),
  },

  rewards: {
    me: (token: string) =>
      request<RewardsProfile>('/rewards/me', { token }),

    equip: (rewardId: string | null, category: 'FRAME' | 'NAME_EFFECT' | 'BADGE' | 'TITLE' | 'STREAK_BADGE', token: string) =>
      request<{ equipped: EquippedSlots }>('/rewards/equip', {
        method: 'POST',
        body: JSON.stringify({ rewardId, category }),
        token,
      }),
  },

  rankings: {
    get: (type: 'LIKES_RECEIVED' | 'POSTS_PUBLISHED' | 'COMMENTS_MADE', token: string) =>
      request<{ type: string; entries: RankingEntry[] }>(`/rankings?type=${type}`, { token }),
  },

  trends: {
    get: () =>
      request<{
        hashtags: { tag: string; postCount: number }[]
        users: { nickname: string; avatarSeed: string; avatarUrl: string | null; faculty: string | null; university: string }[]
        stats: { totalPosts: number }
      }>('/trends'),
  },

  social: {
    follow: (targetNickname: string, action: 'follow' | 'unfollow', token: string) =>
      request<{ following: boolean }>('/social/follow', {
        method: 'POST',
        body: JSON.stringify({ targetNickname, action }),
        token,
      }),

    isFollowing: (nickname: string, token: string) =>
      request<{ following: boolean }>(`/social/follow/${nickname}`, { token }),
  },
}
