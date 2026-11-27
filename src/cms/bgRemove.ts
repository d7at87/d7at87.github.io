/**
 * Background removal for admin uploads.
 *
 * The AI engine is loaded from a CDN at runtime (and only when the admin asks
 * for it) so Vite never bundles/minifies onnxruntime-web. This keeps the main
 * storefront bundle small and avoids the usual WASM production-build crashes.
 *
 * Engine: IMG.LY background-removal (ISNet, quantized model ~45 MB).
 * The model is cached by the browser/CDN after the first run.
 */

type RemoveBackgroundFn = (input: Blob, config: Record<string, unknown>) => Promise<Blob>

export interface BgProgress {
  label: string
  percent?: number
}

const ENGINE_URL = 'https://esm.sh/@imgly/background-removal@1.5.5'
const DATA_PATH = 'https://staticimgly.com/@imgly/background-removal-data/1.5.5/dist/'

let enginePromise: Promise<RemoveBackgroundFn> | null = null

async function loadEngine(): Promise<RemoveBackgroundFn> {
  if (!enginePromise) {
    enginePromise = (async () => {
      // Native dynamic import that Vite leaves untouched.
      const importModule = new Function('url', 'return import(url)') as (
        url: string,
      ) => Promise<Record<string, unknown>>
      const mod = await importModule(ENGINE_URL)
      const direct = mod.removeBackground
      const fallback = (mod.default as Record<string, unknown> | undefined)?.removeBackground
      const fn = (direct ?? fallback) as RemoveBackgroundFn | undefined
      if (typeof fn !== 'function') throw new Error('Background-removal engine is unavailable')
      return fn
    })().catch((err) => {
      enginePromise = null
      throw err
    })
  }
  return enginePromise
}

/** Remove the background from an image and return a transparent PNG blob. */
export async function removeImageBackground(
  file: Blob,
  onProgress?: (p: BgProgress) => void,
): Promise<Blob> {
  const removeBackground = await loadEngine()

  onProgress?.({ label: 'جارٍ تحضير محرك إزالة الخلفية...' })

  const result = await removeBackground(file, {
    publicPath: DATA_PATH,
    device: 'cpu',
    model: 'isnet_quint8',
    output: { format: 'image/png', quality: 1 },
    progress: (key: string, current: number, total: number) => {
      const fetching = key.startsWith('fetch:')
      const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : undefined
      if (fetching) {
        onProgress?.({
          label: pct != null && pct < 100 ? `تحميل نموذج الذكاء الاصطناعي ${pct}%` : 'اكتمل تحميل النموذج — جارٍ المعالجة...',
          percent: pct,
        })
      } else {
        onProgress?.({ label: 'جارٍ إزالة الخلفية...', percent: pct })
      }
    },
  })

  if (!(result instanceof Blob)) throw new Error('Background removal returned no image')
  return result
}
