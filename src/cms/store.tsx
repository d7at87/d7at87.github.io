import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Category, Content, Lang, LText, Product, Settings, SiteData, VideoItem } from './types'
import { normalizeSiteData, seedData } from './normalize'
import { migrateMediaToRemote } from './migrate'
import { fetchSite, getSession, pushSite, remoteConfigured, signInRemote, signOutRemote } from './remote'
import { lb } from './labels'

const LS_DATA = 'ashour-cms-v1'
const LS_LANG = 'ashour-lang'

export type SyncStatus = 'local' | 'loading' | 'ready' | 'saving' | 'error'

function readCache(): SiteData {
  try {
    const raw = localStorage.getItem(LS_DATA)
    return raw ? normalizeSiteData(JSON.parse(raw)) : seedData()
  } catch {
    return seedData()
  }
}

function readLang(data: SiteData): Lang {
  try {
    const saved = localStorage.getItem(LS_LANG)
    if (saved === 'ar' || saved === 'he') return saved
  } catch {
    /* ignore */
  }
  return data.settings.defaultLang
}

function errorText(e: unknown): string {
  return e instanceof Error && e.message ? e.message : 'حدث خطأ غير متوقع'
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
  /* publishing */
  remote: boolean
  user: string | null
  status: SyncStatus
  message: string
  dirty: boolean
  lastPublished: string | null
  publish: () => Promise<boolean>
  pull: () => Promise<boolean>
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => void
}

const Ctx = createContext<SiteCtx | null>(null)

export function SiteProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(readCache)
  const [lang, setLangState] = useState<Lang>(() => readLang(readCache()))
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState<SyncStatus>(remoteConfigured ? 'loading' : 'local')
  const [message, setMessage] = useState('')
  const [lastPublished, setLastPublished] = useState<string | null>(null)
  const [user, setUser] = useState<string | null>(() => getSession()?.email ?? null)

  /* Every mutation goes through here: updates state and flags unsaved work. */
  const commit = useCallback((fn: (d: SiteData) => SiteData) => {
    setData((d) => fn(d))
    if (remoteConfigured) setDirty(true)
  }, [])

  const pull = useCallback(async () => {
    if (!remoteConfigured) return false
    setStatus('loading')
    try {
      const remote = await fetchSite()
      if (remote) {
        setData(normalizeSiteData(remote.data))
        setLastPublished(remote.updatedAt)
        setDirty(false)
        setMessage('تم تحديث البيانات من الخادم')
      } else {
        setMessage('لا توجد نسخة منشورة بعد — عدّل ثم اضغط «نشر الآن»')
      }
      setStatus('ready')
      return true
    } catch (e) {
      setStatus('error')
      setMessage(errorText(e))
      return false
    }
  }, [])

  useEffect(() => {
    if (remoteConfigured) void pull()
  }, [pull])

  const publish = useCallback(async () => {
    if (!remoteConfigured) return false
    setStatus('saving')
    setMessage('جارٍ تجهيز الملفات والنشر...')
    try {
      const migrated = await migrateMediaToRemote(data)
      await pushSite(migrated.data)
      if (migrated.moved > 0) setData(migrated.data)
      setDirty(false)
      setLastPublished(new Date().toISOString())
      setStatus('ready')
      if (migrated.failed > 0) {
        setMessage(`نُشر الموقع، لكن ${migrated.failed} ملف وسائط لم يُرفع — أعد المحاولة`)
      } else if (migrated.moved > 0) {
        setMessage(`تم النشر — رُفع ${migrated.moved} ملف وسائط إلى السحابة`)
      } else {
        setMessage('تم النشر بنجاح — التعديلات ظاهرة الآن لكل الزوار')
      }
      return true
    } catch (e) {
      setStatus('error')
      setMessage(errorText(e))
      return false
    }
  }, [data])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const session = await signInRemote(email, password)
      setUser(session.email)
      setStatus('ready')
      setMessage('تم تسجيل الدخول')
      return null
    } catch (e) {
      return errorText(e)
    }
  }, [])

  const signOut = useCallback(() => {
    signOutRemote()
    setUser(null)
    setMessage('')
  }, [])

  /* ---------------- Auto-publish (opt-in, after 3s of silence) ---------------- */
  useEffect(() => {
    if (!remoteConfigured || !user || status !== 'ready') return
    if (!dirty || !data.settings.autoPublish) return
    const t = setTimeout(() => {
      void publish()
    }, 3000)
    return () => clearTimeout(t)
  }, [remoteConfigured, user, status, dirty, data, publish])

  /* With the cloud as source of truth, the admin has no device copy — visitors
     read the cloud; a local draft would only mislead the admin. */
  const signedInCloud = remoteConfigured && Boolean(user)

  useEffect(() => {
    if (signedInCloud) return
    try {
      localStorage.setItem(LS_DATA, JSON.stringify(data))
    } catch {
      /* storage full — ignore */
    }
  }, [data, signedInCloud])

  /* Never lose unpublished edits silently. */
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

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
    const t = (key: string) => data.ui[key]?.[lang] ?? data.ui[key]?.ar ?? lb(key, lang)
    const L = (v: LText) => v?.[lang] ?? v?.ar ?? ''
    const formatPrice = (n: number) =>
      `${n.toLocaleString(lang === 'ar' ? 'ar-EG' : 'he-IL')} ${data.settings.currency[lang] ?? data.settings.currency.ar}`
    const catName = (id: string) => {
      const cat = data.categories.find((c) => c.id === id)
      return cat ? (cat.name[lang] ?? cat.name.ar) : id
    }
    return {
      lang,
      setLang,
      t,
      L,
      data,
      formatPrice,
      catName,
      saveProduct: (p) =>
        commit((d) => ({
          ...d,
          products: d.products.some((x) => x.id === p.id)
            ? d.products.map((x) => (x.id === p.id ? p : x))
            : [...d.products, p],
        })),
      deleteProduct: (id) => commit((d) => ({ ...d, products: d.products.filter((x) => x.id !== id) })),
      saveCategory: (c) =>
        commit((d) => ({
          ...d,
          categories: d.categories.some((x) => x.id === c.id)
            ? d.categories.map((x) => (x.id === c.id ? c : x))
            : [...d.categories, c],
        })),
      deleteCategory: (id) => {
        if (data.products.some((p) => p.categoryId === id)) return false
        commit((d) => ({ ...d, categories: d.categories.filter((x) => x.id !== id) }))
        return true
      },
      setBrands: (brands) => commit((d) => ({ ...d, brands })),
      setVideos: (videos) => commit((d) => ({ ...d, videos })),
      setContent: (content) => commit((d) => ({ ...d, content })),
      setUI: (ui) => commit((d) => ({ ...d, ui })),
      patchSettings: (s) => commit((d) => ({ ...d, settings: { ...d.settings, ...s } })),
      replaceAll: (d) => commit(() => normalizeSiteData(d)),
      resetAll: () => commit(() => seedData()),
      remote: remoteConfigured,
      user,
      status,
      message,
      dirty,
      lastPublished,
      publish,
      pull,
      signIn,
      signOut,
    }
  }, [data, lang, commit, user, status, message, dirty, lastPublished, publish, pull, signIn, signOut])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSite(): SiteCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSite must be used within SiteProvider')
  return ctx
}
