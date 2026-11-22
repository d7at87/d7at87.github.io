import type { Category, Lang, LText, Notes, Product, Settings, SiteData, VideoItem } from './types'
import { SEED_BRANDS, SEED_CATEGORIES, SEED_PRODUCTS, SEED_VIDEOS } from './seedCatalog'
import { SEED_CONTENT, SEED_SETTINGS, SEED_UI } from './seedSite'

/**
 * Seeds + defensive normalisation.
 *
 * Every entry point (localStorage cache, remote payload, imported JSON file)
 * goes through `normalizeSiteData`, so a partial or hand-edited document can
 * never crash the storefront.
 */

export function seedData(): SiteData {
  return {
    products: SEED_PRODUCTS,
    categories: SEED_CATEGORIES,
    brands: SEED_BRANDS,
    videos: SEED_VIDEOS,
    content: SEED_CONTENT,
    ui: SEED_UI,
    settings: SEED_SETTINGS,
  }
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}

function clamp(n: unknown, min: number, max: number, fallback: number): number {
  const v = Number(n)
  if (!Number.isFinite(v)) return fallback
  return Math.min(max, Math.max(min, v))
}

/** Merge `patch` over `base`: objects merge recursively, arrays replace. */
export function deepMerge<T>(base: T, patch: unknown): T {
  if (patch === undefined || patch === null) return base
  if (Array.isArray(base)) return (Array.isArray(patch) ? patch : base) as T
  if (isObj(base)) {
    if (!isObj(patch)) return base
    const out: Record<string, unknown> = { ...base }
    for (const [k, v] of Object.entries(patch)) {
      out[k] = deepMerge((base as Record<string, unknown>)[k], v)
    }
    return out as T
  }
  return patch as T
}

const EMPTY_NOTES: Notes = { top: [], heart: [], base: [] }

const PRODUCT_BASE: Product = {
  id: '',
  name: { ar: '', he: '' },
  latin: '',
  brand: '',
  categoryId: '',
  priceNum: 0,
  description: { ar: '', he: '' },
  notes: { ar: EMPTY_NOTES, he: EMPTY_NOTES },
  longevity: { ar: '', he: '' },
  intensity: 3,
  variant: 0,
  colors: { accent: '#d4a24c', liquid: '#7a4a12' },
}

const CATEGORY_BASE: Category = {
  id: '',
  name: { ar: '', he: '' },
  desc: { ar: '', he: '' },
  color: '#d4a24c',
}

function normLText(v: LText): LText {
  return { ar: str(v.ar), he: str(v.he) }
}

function normNotes(v: Notes): Notes {
  const list = (x: unknown) => (Array.isArray(x) ? x.filter((s): s is string => typeof s === 'string') : [])
  return { top: list(v.top), heart: list(v.heart), base: list(v.base) }
}

function normProduct(raw: unknown): Product | null {
  if (!isObj(raw) || typeof raw.id !== 'string' || !raw.id) return null
  const p = deepMerge(PRODUCT_BASE, raw)
  p.name = normLText(p.name)
  p.description = normLText(p.description)
  p.longevity = normLText(p.longevity)
  p.notes = { ar: normNotes(p.notes.ar), he: normNotes(p.notes.he) }
  p.latin = str(p.latin)
  p.brand = str(p.brand)
  p.categoryId = str(p.categoryId)
  p.image = typeof p.image === 'string' && p.image ? p.image : undefined
  p.variant = p.variant === 1 || p.variant === 2 ? p.variant : 0
  p.intensity = Math.round(clamp(p.intensity, 1, 5, 3))
  p.priceNum = clamp(p.priceNum, 0, 1e9, 0)
  const old = Number(p.oldPriceNum)
  p.oldPriceNum = Number.isFinite(old) && old > 0 ? old : undefined
  return p
}

function normCategory(raw: unknown): Category | null {
  if (!isObj(raw) || typeof raw.id !== 'string' || !raw.id) return null
  const c = deepMerge(CATEGORY_BASE, raw)
  c.name = normLText(c.name)
  c.desc = normLText(c.desc)
  c.color = str(c.color, '#d4a24c')
  return c
}

function normVideo(raw: unknown): VideoItem | null {
  if (!isObj(raw) || typeof raw.id !== 'string' || typeof raw.src !== 'string' || !raw.src) return null
  return {
    id: raw.id,
    title: normLText(deepMerge({ ar: '', he: '' }, raw.title)),
    src: raw.src,
    poster: typeof raw.poster === 'string' && raw.poster ? raw.poster : undefined,
  }
}

function normSettings(s: Settings): Settings {
  const lang: Lang = s.defaultLang === 'he' ? 'he' : 'ar'
  return {
    ...s,
    siteName: normLText(s.siteName),
    currency: normLText(s.currency),
    address: normLText(s.address),
    defaultLang: lang,
    fontH: clamp(s.fontH, 0.85, 1.25, 1),
    fontB: clamp(s.fontB, 0.85, 1.25, 1),
    perPage: Math.round(clamp(s.perPage, 4, 48, 12)),
    pin: typeof s.pin === 'string' && s.pin ? s.pin : '1234',
    whatsapp: str(s.whatsapp).replace(/\D/g, ''),
    email: str(s.email),
    phone: str(s.phone),
    announcements: {
      ar: s.announcements.ar.filter((x) => typeof x === 'string'),
      he: s.announcements.he.filter((x) => typeof x === 'string'),
    },
    heroBg: {
      type: s.heroBg.type === 'image' ? 'image' : 'video',
      video: str(s.heroBg.video),
      image: str(s.heroBg.image),
    },
  }
}

export function normalizeSiteData(raw: unknown): SiteData {
  const seed = seedData()
  if (!isObj(raw)) return seed
  const src = raw as Partial<SiteData>

  const products = Array.isArray(src.products)
    ? src.products.map(normProduct).filter((p): p is Product => p !== null)
    : seed.products

  const categories = Array.isArray(src.categories)
    ? src.categories.map(normCategory).filter((c): c is Category => c !== null)
    : seed.categories

  const brands = Array.isArray(src.brands)
    ? src.brands.filter((b): b is string => typeof b === 'string' && b.trim() !== '')
    : seed.brands

  const videos = Array.isArray(src.videos)
    ? src.videos.map(normVideo).filter((v): v is VideoItem => v !== null)
    : seed.videos

  return {
    products,
    categories,
    brands,
    videos,
    content: deepMerge(seed.content, src.content),
    ui: deepMerge(seed.ui, src.ui),
    settings: normSettings(deepMerge(seed.settings, src.settings)),
  }
}
