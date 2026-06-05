/// <reference lib="webworker" />
/**
 * Embedding worker — runs Transformers.js (all-MiniLM-L6-v2, 384-dim) on the
 * user's device. Tries WebGPU, falls back to WASM. The library + model + wasm
 * are fetched from the jsDelivr CDN at runtime (webpackIgnore) so nothing
 * Node-specific gets bundled. Model is cached by the browser after first load.
 *
 * Keep the model id in sync with EMBEDDING_MODEL in @qhatu/shared.
 */
const MODEL = 'Xenova/all-MiniLM-L6-v2'
const TF_CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractorPromise: Promise<any> | null = null

async function getExtractor(): Promise<unknown> {
  if (extractorPromise) return extractorPromise

  extractorPromise = (async () => {
    const TF = await import(/* webpackIgnore: true */ TF_CDN)
    TF.env.allowLocalModels = false
    try {
      return await TF.pipeline('feature-extraction', MODEL, { device: 'webgpu' })
    } catch {
      return await TF.pipeline('feature-extraction', MODEL, { device: 'wasm' })
    }
  })()

  return extractorPromise
}

interface InMsg { id: number; text: string }

self.onmessage = async (e: MessageEvent<InMsg>) => {
  const { id, text } = e.data
  if (id === -1) {
    // Warmup — just trigger model load, ignore result
    getExtractor().catch(() => null)
    return
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractor = (await getExtractor()) as any
    const output = await extractor(text, { pooling: 'mean', normalize: true })
    const vector = Array.from(output.data as Float32Array)
    ;(self as unknown as Worker).postMessage({ id, ok: true, vector })
  } catch (err) {
    ;(self as unknown as Worker).postMessage({
      id, ok: false, error: err instanceof Error ? err.message : 'embed failed',
    })
  }
}
