import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Category, Content, Lang, LText, Product, Settings, SiteData, VideoItem } from './types'
import { SEED_CATEGORIES, SEED_BRANDS, SEED_PRODUCTS, SEED_VIDEOS } from './seedCatalog'
import { SEED_CONTENT, SEED_SETTINGS, SEED_UI } from './seedSite'

const LS_DATA = 'ashour-cms-v1'
const LS_LANG = 'ashour-lang'

function seedData(): SiteData {
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

function loadData(): SiteData {
  try {
    const raw = localStorage.getItem(LS_DATA)
    if (!raw) return seedData()
    const parsed = JSON.parse(raw) as Partial<SiteData>
    const seed = seedData()
    return {
      products: Array.isArray(parsed.products) && parsed.products.length ? parsed.products : seed.products,
      categories: Array.isArray(parsed.categories) && parsed.categories.length ? parsed.categories : seed.categories,
      brands: Array.isArray(parsed.brands) && parsed.brands.length ? parsed.brands : seed.brands,
      videos: Array.isArray(parsed.videos) ? parsed.videos : seed.videos,
      content: { ...seed.content, ...(parsed.content || {}) },
      ui: { ...seed.ui, ...(parsed.ui || {}) },
      settings: { ...seed.settings, ...(parsed.settings || {}) },
    }
  } catch {
    return seedData()
  }
}

interface SiteCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
  L: (v: LText) => string
  data: SiteData
  formatPrice: (n: number) => string
  catName: (id: string) => string
  saveProduct: (p: Product) => void
  deleteProduct: (id: string) => void
  saveCategory: (c: Category) => void
  deleteCategory: (id: string) => boolean
  setBrands: (b: string[]) => void
  setVideos: (v: VideoItem[]) => void
  setContent: (c: Content) => void
  setUI: (u: Record<string, LText>) => void
  patchSettings: (s: Partial<Settings>) => void
  replaceAll: (d: SiteData) => void
  resetAll: () => void
}

const Ctx = createContext<SiteCtx | null>(null)

export function SiteProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(loadData)
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(LS_LANG) as Lang | null
      if (saved === 'ar' || saved === 'he') return saved
    } catch {
      /* ignore */
    }
    return loadData().settings.defaultLang
  })

  useEffect(() => {
    try {
      localStorage.setItem(LS_DATA, JSON.stringify(data))
    } catch {
      /* storage full — ignore */
    }
  }, [data])

  useEffect(() => {
    try {
      localStorage.setItem(LS_LANG, lang)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (l: Lang) => setLangState(l)

  const value = useMemo<SiteCtx>(() => {
    const t = (key: string) => data.ui[key]?.[lang] ?? data.ui[key]?.ar ?? key
    const L = (v: LText) => v?.[lang] ?? v?.ar ?? ''
    const formatPrice = (n: number) =>
      `${n.toLocaleString(lang === 'ar' ? 'ar-EG' : 'he-IL')} ${data.settings.currency[lang] ?? data.settings.currency.ar}`
    const catName = (id: string) => data.categories.find((c) => c.id === id)?.name[lang] ?? data.categories.find((c) => c.id === id)?.name.ar ?? id
    return {
      lang,
      setLang,
      t,
      L,
      data,
      formatPrice,
      catName,
      saveProduct: (p) =>
        setData((d) => ({
          ...d,
          products: d.products.some((x) => x.id === p.id)
            ? d.products.map((x) => (x.id === p.id ? p : x))
            : [...d.products, p],
        })),
      deleteProduct: (id) => setData((d) => ({ ...d, products: d.products.filter((x) => x.id !== id) })),
      saveCategory: (c) =>
        setData((d) => ({
          ...d,
          categories: d.categories.some((x) => x.id === c.id)
            ? d.categories.map((x) => (x.id === c.id ? c : x))
            : [...d.categories, c],
        })),
      deleteCategory: (id) => {
        let ok = false
        setData((d) => {
          if (d.products.some((p) => p.categoryId === id)) return d
          ok = true
          return { ...d, categories: d.categories.filter((x) => x.id !== id) }
        })
        return ok
      },
      setBrands: (brands) => setData((d) => ({ ...d, brands })),
      setVideos: (videos) => setData((d) => ({ ...d, videos })),
      setContent: (content) => setData((d) => ({ ...d, content })),
      setUI: (ui) => setData((d) => ({ ...d, ui })),
      patchSettings: (s) => setData((d) => ({ ...d, settings: { ...d.settings, ...s } })),
      replaceAll: (d) => setData(d),
      resetAll: () => setData(seedData()),
    }
  }, [data, lang])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSite(): SiteCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSite must be used within SiteProvider')
  return ctx
}
