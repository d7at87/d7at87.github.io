/**
 * Small canvas helpers for the image studio.
 * All operations keep the alpha channel unless a background color is chosen.
 */

export type FrameAspect = 'original' | '1:1' | '4:5' | '9:16'

export interface FrameOptions {
  /** هامش حول العنصر كنسبة من الضلع الأكبر (0–20) */
  padding: number
  /** نسبة الإطار النهائي */
  aspect: FrameAspect
  /** لون خلفية ثابت، أو null لخلفية شفافة */
  background: string | null
  /** ظل خفيف تحت العنصر */
  shadow: boolean
  /** 100 = بدون تغيير */
  brightness: number
  contrast: number
  saturation: number
  /** أقصى ضلع للصورة الناتجة */
  maxDim?: number
}

const ASPECT_RATIO: Record<FrameAspect, number | null> = {
  original: null,
  '1:1': 1,
  '4:5': 4 / 5,
  '9:16': 9 / 16,
}

function loadBitmap(source: Blob): Promise<ImageBitmap> {
  return createImageBitmap(source)
}

/** Trim transparent margins, frame the subject, and optionally apply background, shadow and color filters. */
export async function trimTransparent(source: Blob, opts: FrameOptions): Promise<Blob> {
  const bmp = await loadBitmap(source)
  const canvas = document.createElement('canvas')
  canvas.width = bmp.width
  canvas.height = bmp.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas is unavailable')
  ctx.drawImage(bmp, 0, 0)

  const { data, width, height } = ctx.getImageData(0, 0, bmp.width, bmp.height)
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y++) {
    const row = y * width
    for (let x = 0; x < width; x++) {
      if (data[(row + x) * 4 + 3] > 8) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < minX || maxY < minY) throw new Error('لم يتم العثور على عنصر في الصورة')

  const bw = maxX - minX + 1
  const bh = maxY - minY + 1
  const base = Math.max(bw, bh)
  const padPct = Math.max(0, Math.min(20, opts.padding))
  const pad = Math.round((base * padPct) / 100)
  const contentW = bw + pad * 2
  const contentH = bh + pad * 2
  const ratio = ASPECT_RATIO[opts.aspect] ?? bw / bh

  let frameW: number
  let frameH: number
  if (ratio == null) {
    frameW = contentW
    frameH = contentH
  } else if (contentW / contentH > ratio) {
    frameW = contentW
    frameH = contentW / ratio
  } else {
    frameH = contentH
    frameW = contentH * ratio
  }

  const maxDim = opts.maxDim ?? 1400
  const scale = Math.min(1, maxDim / Math.max(frameW, frameH))
  const outW = Math.max(1, Math.round(frameW * scale))
  const outH = Math.max(1, Math.round(frameH * scale))

  const out = document.createElement('canvas')
  out.width = outW
  out.height = outH
  const octx = out.getContext('2d')
  if (!octx) throw new Error('Canvas is unavailable')
  octx.imageSmoothingEnabled = true
  octx.imageSmoothingQuality = 'high'

  if (opts.background) {
    octx.fillStyle = opts.background
    octx.fillRect(0, 0, outW, outH)
  }

  const drawW = bw * scale
  const drawH = bh * scale
  const x = (outW - drawW) / 2
  const y = (outH - drawH) / 2
  const filters = `brightness(${opts.brightness}%) contrast(${opts.contrast}%) saturate(${opts.saturation}%)`

  octx.save()
  if (filters !== 'brightness(100%) contrast(100%) saturate(100%)') octx.filter = filters

  if (opts.shadow) {
    octx.save()
    octx.shadowColor = 'rgba(0, 0, 0, 0.28)'
    octx.shadowBlur = Math.max(4, base * scale * 0.045)
    octx.shadowOffsetY = Math.max(2, base * scale * 0.018)
    octx.drawImage(canvas, minX, minY, bw, bh, x, y, drawW, drawH)
    octx.restore()
  }

  octx.drawImage(canvas, minX, minY, bw, bh, x, y, drawW, drawH)
  octx.restore()

  const blob = await new Promise<Blob | null>((res) => out.toBlob(res, 'image/png'))
  if (!blob) throw new Error('تعذر إنشاء الصورة النهائية')
  return blob
}

/** Re-encode a blob to another image format (used by downloads). */
export async function encodeImage(source: Blob, type: string, quality = 0.92): Promise<Blob> {
  const bmp = await loadBitmap(source)
  const canvas = document.createElement('canvas')
  canvas.width = bmp.width
  canvas.height = bmp.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return source
  if (type === 'image/jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(bmp, 0, 0)
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, quality))
  return blob ?? source
}

/** Trigger a browser download for a blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
