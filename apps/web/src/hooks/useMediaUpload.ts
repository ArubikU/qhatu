'use client'
import { useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { validateUpload, type MediaType } from '@qhatu/shared'

export interface UploadedMedia {
  key: string             // storage object key — sent to API on post create
  type: MediaType
  previewUrl: string      // local object URL for composer preview (private buckets have no public URL)
}

interface UploadState {
  uploading: boolean
  progress: number      // 0–100
  error: string | null
}

export function useMediaUpload() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const [state, setState] = useState<UploadState>({ uploading: false, progress: 0, error: null })

  const upload = useCallback(async (file: File): Promise<UploadedMedia | null> => {
    setState({ uploading: true, progress: 0, error: null })
    try {
      // 1. Client-side validation (fail fast before network)
      validateUpload(file.type, file.size)

      // 2. Get presigned PUT URL + storage key
      const { uploadUrl, key, mediaType } = await api.media.presign(
        file.type, file.size, accessToken ?? '',
      )

      // 3. PUT directly to bucket with progress
      await putWithProgress(uploadUrl, file, (pct) => setState((s) => ({ ...s, progress: pct })))

      setState({ uploading: false, progress: 100, error: null })
      // Local preview — works for both public and private buckets
      return { key, type: mediaType, previewUrl: URL.createObjectURL(file) }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir el archivo'
      setState({ uploading: false, progress: 0, error: message })
      return null
    }
  }, [accessToken])

  const reset = useCallback(() => setState({ uploading: false, progress: 0, error: null }), [])

  return { ...state, upload, reset }
}

function putWithProgress(url: string, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload falló (HTTP ${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error('Error de red al subir'))
    xhr.send(file)
  })
}
