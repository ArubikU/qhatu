'use client'
import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Send, Loader2, Clock, Eye, BarChart2, Plus, Trash2, ImagePlus } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { MentionTextarea } from '@/components/ui/MentionTextarea'
import { useCreatePost } from '@/hooks/useCreatePost'
import { useMediaUpload, type UploadedMedia } from '@/hooks/useMediaUpload'
import { useEmbedder } from '@/hooks/useEmbedder'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { MEDIA_LIMITS, mimeToKind, canAddMedia, MAX_POST_CHARS } from '@qhatu/shared'
import { Avatar } from '@/components/common/Avatar'

const ACCEPT = [
  ...MEDIA_LIMITS.image.mimeTypes,
  ...MEDIA_LIMITS.video.mimeTypes,
].join(',')

interface CreatePostModalProps {
  open: boolean
  onClose: () => void
}

type PostType = 'TEXT' | 'EPHEMERAL' | 'POLL'

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const user        = useAuthStore((s) => s.user)
  const createPost  = useCreatePost()

  const [content,            setContent]            = useState('')
  const [type,               setType]               = useState<PostType>('TEXT')
  const [isIdentityRevealed, setIsIdentityRevealed] = useState(false)
  const [pollQuestion,       setPollQuestion]       = useState('')
  const [pollOptions,        setPollOptions]        = useState(['', ''])
  const [media,              setMedia]              = useState<UploadedMedia[]>([])
  const fileRef     = useRef<HTMLInputElement>(null)

  const upload   = useMediaUpload()
  const embedder = useEmbedder()

  const hasMedia    = media.length > 0
  const canAddMore  = media.length < MEDIA_LIMITS.maxItems

  // Is media uploads enabled on the backend?
  const { data: mediaConfig } = useQuery({
    queryKey: ['media-config'],
    queryFn:  () => api.media.config(),
    staleTime: 5 * 60_000,
  })
  const mediaEnabled = mediaConfig?.enabled ?? false

  const remaining = MAX_POST_CHARS - content.length
  const isValid   = remaining >= 0 &&
    (content.trim().length > 0 || hasMedia || type === 'POLL') &&
    (type !== 'POLL' || (pollQuestion.trim() && pollOptions.filter((o) => o.trim()).length >= 2)) &&
    !upload.uploading

  useEffect(() => {
    if (open) {
      embedder.warmup()  // start loading the embedding model in the background
    } else {
      // Reset on close
      setContent('')
      setType('TEXT')
      setIsIdentityRevealed(false)
      setPollQuestion('')
      setPollOptions(['', ''])
      setMedia([])
      upload.reset()
    }
  }, [open])

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''  // allow re-selecting same file
    if (files.length === 0) return

    // Media + poll mutually exclusive
    if (type === 'POLL') setType('TEXT')

    // Upload sequentially, respecting per-kind limits
    let current = [...media]
    for (const file of files) {
      const kind = mimeToKind(file.type)
      if (!kind) continue
      if (!canAddMedia(current, kind)) break  // hit a limit — stop
      const result = await upload.upload(file)
      if (result) {
        current = [...current, result]
        setMedia(current)
      }
    }
  }

  const removeMedia = (idx: number) => {
    setMedia((m) => m.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!isValid || createPost.isPending) return

    // Compute semantic embedding on-device (WebGPU/WASM). Times out → posts without it.
    const embedSource = type === 'POLL' ? pollQuestion : content
    const embedding   = embedSource.trim()
      ? (await embedder.embed(embedSource)) ?? undefined
      : undefined

    await createPost.mutateAsync({
      content,
      type,
      isIdentityRevealed,
      media: hasMedia ? media.map((m) => ({ key: m.key, type: m.type })) : undefined,
      embedding,
      poll: type === 'POLL'
        ? { question: pollQuestion, options: pollOptions.filter((o) => o.trim()) }
        : undefined,
    })
    onClose()
  }

  const addPollOption = () => {
    if (pollOptions.length < 4) setPollOptions([...pollOptions, ''])
  }

  const removePollOption = (i: number) => {
    if (pollOptions.length <= 2) return
    setPollOptions(pollOptions.filter((_, idx) => idx !== i))
  }

  return (
    <Sheet open={open} onClose={onClose} maxWidth={520} dragToClose={!hasMedia && !upload.uploading}>
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold font-heading">Nuevo post</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Author row */}
              <div className="flex gap-3 mb-3">
                <Avatar seed={user?.avatarSeed ?? 'q'} size={36} />
                <div className="text-sm text-white/60 font-body pt-1">
                  {isIdentityRevealed ? (
                    <span className="text-lavender font-semibold">{user?.nickname}</span>
                  ) : (
                    <span>Anónimo</span>
                  )}
                </div>
              </div>

              {/* Textarea — @menciones + #tags */}
              <MentionTextarea
                value={content}
                onChange={setContent}
                placeholder="¿Qué está pasando en tu campus? Usa @ y #"
                maxLength={MAX_POST_CHARS}
                rows={4}
                autoFocus={open}
                className="w-full bg-transparent text-white placeholder-white/30 text-sm font-body resize-none focus:outline-none leading-relaxed mb-2"
              />

              {/* Media gallery preview */}
              {hasMedia && (
                <div className={`grid gap-1.5 mb-3 ${media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {media.map((m, i) => (
                    <div key={m.key} className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30 aspect-square">
                      {m.type === 'IMAGE' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.previewUrl} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <video src={m.previewUrl} className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                      >
                        <X size={12} />
                      </button>
                      {m.type === 'VIDEO' && (
                        <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded font-body">video</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload progress */}
              {upload.uploading && (
                <div className="flex items-center gap-2 mb-3 text-xs text-white/50 font-body">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  Subiendo… {upload.progress}%
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${upload.progress}%` }} />
                  </div>
                </div>
              )}

              {/* Upload error */}
              {upload.error && (
                <p className="text-red-400 text-xs mb-2 font-body">{upload.error}</p>
              )}

              {/* Poll fields */}
              {type === 'POLL' && (
                <div className="bg-white/5 rounded-xl p-3 mb-3 border border-white/10">
                  <input
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Pregunta de la encuesta"
                    maxLength={200}
                    className="w-full bg-transparent text-sm text-white placeholder-white/40 font-body focus:outline-none mb-2 border-b border-white/10 pb-2"
                  />
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1.5">
                      <input
                        value={opt}
                        onChange={(e) => {
                          const next = [...pollOptions]
                          next[i] = e.target.value
                          setPollOptions(next)
                        }}
                        placeholder={`Opción ${i + 1}`}
                        maxLength={100}
                        className="flex-1 bg-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 font-body focus:outline-none border border-white/10"
                      />
                      {pollOptions.length > 2 && (
                        <button type="button" onClick={() => removePollOption(i)} className="text-white/30 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 4 && (
                    <button type="button" onClick={addPollOption} className="flex items-center gap-1 text-xs text-lavender hover:text-white transition-colors mt-1 font-body">
                      <Plus size={12} /> Agregar opción
                    </button>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                {/* Type toggles */}
                <div className="flex items-center gap-1">
                  {mediaEnabled && (
                    <>
                      <input
                        ref={fileRef}
                        type="file"
                        accept={ACCEPT}
                        multiple
                        onChange={handleFilePick}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={upload.uploading || !canAddMore || type === 'POLL'}
                        title={`Imágenes (máx ${MEDIA_LIMITS.maxImages}) o video (máx ${MEDIA_LIMITS.maxVideos})`}
                        className={`relative p-2 rounded-full transition-colors ${hasMedia ? 'bg-green-500/20 text-green-400' : 'text-white/30 hover:text-white/60'} disabled:opacity-40`}
                      >
                        <ImagePlus size={16} />
                        {hasMedia && (
                          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                            {media.length}
                          </span>
                        )}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setType(type === 'EPHEMERAL' ? 'TEXT' : 'EPHEMERAL')}
                    title="Efímero (24h)"
                    className={`p-2 rounded-full transition-colors ${type === 'EPHEMERAL' ? 'bg-orange-500/20 text-orange-400' : 'text-white/30 hover:text-white/60'}`}
                  >
                    <Clock size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (!hasMedia) setType(type === 'POLL' ? 'TEXT' : 'POLL') }}
                    disabled={hasMedia}
                    title="Encuesta"
                    className={`p-2 rounded-full transition-colors ${type === 'POLL' ? 'bg-blue-500/20 text-blue-400' : 'text-white/30 hover:text-white/60'} disabled:opacity-40`}
                  >
                    <BarChart2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsIdentityRevealed((v) => !v)}
                    title="Revelar identidad"
                    className={`p-2 rounded-full transition-colors ${isIdentityRevealed ? 'bg-lavender/20 text-lavender' : 'text-white/30 hover:text-white/60'}`}
                  >
                    <Eye size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-body ${remaining < 30 ? 'text-red-400' : 'text-white/30'}`}>
                    {remaining}
                  </span>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isValid || createPost.isPending}
                    className="flex items-center gap-2 bg-primary disabled:bg-white/10 disabled:text-white/30 hover:bg-[#6b2fe2] text-white font-semibold px-4 py-2 rounded-full text-sm transition-all shadow-[0_0_20px_rgba(123,63,242,0.4)] disabled:shadow-none font-heading"
                  >
                    {createPost.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    Publicar
                  </button>
                </div>
              </div>
            </div>
    </Sheet>
  )
}
