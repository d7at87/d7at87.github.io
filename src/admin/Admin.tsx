import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import {
  Download,
  Eye,
  Layers,
  LogOut,
  Package,
  Pencil,
  Plus,
  Settings as SettingsIcon,
  Trash2,
  Type,
  Languages,
  Store,
  RotateCcw,
  Upload,
  Clapperboard,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  Copy,
  ImagePlus,
  CloudUpload,
  CloudOff,
  RefreshCw,
  Wand2,
  Images,
  Eraser,
  X,
} from 'lucide-react'
import type { Category, Content, LText, Product } from '../cms/types'
import { useSite } from '../cms/store'
import { compressImage, saveMediaSmart, useMediaURL } from '../cms/media'
import { removeImageBackground, type BgProgress } from '../cms/bgRemove'
import { downloadBlob, encodeImage, trimTransparent, type FrameAspect } from '../cms/imageTools'
import { deleteMedia, listMediaObjects, type MediaObject } from '../cms/remote'
import BottleSVG from '../components/BottleSVG'

const inp =
  'w-full bg-white px-3 py-2 text-sm text-ink-900 outline-none ring-1 ring-ink-950/15 transition placeholder:text-ink-500/40 focus:ring-gold-500'

function LPair({ label, value, onChange }: { label: string; value: LText; onChange: (v: LText) => void }) {
  return (
    <div className="grid items-start gap-2 md:grid-cols-[150px_1fr_1fr]">
      <span className="pt-2 text-xs font-bold text-ink-700">{label}</span>
      <input aria-label={`${label} (العربية)`} value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} placeholder="العربية" className={inp} />
      <input
        aria-label={`${label} (עברית)`}
        value={value.he}
        onChange={(e) => onChange({ ...value, he: e.target.value })}
        placeholder="עברית"
        dir="auto"
        className={inp}
      />
    </div>
  )
}

function SRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-2 md:grid-cols-[150px_1fr]">
      <span className="pt-2 text-xs font-bold text-ink-700">{label}</span>
      <div>{children}</div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-ink-950/10 bg-white p-5">
      <h3 className="mb-4 border-b hairline pb-3 font-royal text-xl font-bold text-ink-950">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

type Tab = 'products' | 'cats' | 'brands' | 'studio' | 'videos' | 'content' | 'strings' | 'layout' | 'settings'

const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: 'products', label: 'المنتجات', icon: Package },
  { id: 'cats', label: 'التصنيفات', icon: Layers },
  { id: 'brands', label: 'الدور', icon: Store },
  { id: 'studio', label: 'استوديو الصور', icon: Images },
  { id: 'videos', label: 'الفيديوهات', icon: Clapperboard },
  { id: 'content', label: 'المحتوى والنصوص', icon: Type },
  { id: 'strings', label: 'نصوص الواجهة', icon: Languages },
  { id: 'layout', label: 'عرض الأقسام', icon: LayoutGrid },
  { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
]

export default function Admin() {
  const { data, remote, user, signIn, signOut } = useSite()
  const [authed, setAuthed] = useState(() => {
    if (remote) return Boolean(user)
    try {
      return sessionStorage.getItem('ashour-admin') === '1'
    } catch {
      return false
    }
  })
  const [secret, setSecret] = useState('')
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<Tab>('products')

  if (!authed) {
    const submit = async (e: React.FormEvent) => {
      e.preventDefault()
      setErr('')
      if (remote) {
        setBusy(true)
        const problem = await signIn(email.trim(), secret)
        setBusy(false)
        if (problem) {
          setErr(problem)
          return
        }
        setAuthed(true)
        return
      }
      if (secret === data.settings.pin) {
        try {
          sessionStorage.setItem('ashour-admin', '1')
        } catch {
          /* ignore */
        }
        setAuthed(true)
      } else setErr('رمز خاطئ')
    }

    return (
      <div className="grid min-h-screen place-items-center bg-ivory-100 p-4">
        <form onSubmit={submit} className="w-full max-w-sm border border-ink-950/10 bg-white p-8 text-center shadow-xl">
          <p className="font-royal text-3xl font-bold text-ink-950">لوحة التحكم</p>
          <p className="mt-2 text-sm text-ink-500">
            {remote ? 'سجّل الدخول بحساب المشرف — التعديلات تُنشر لكل الزوار' : 'أدخل رمز الدخول (الافتراضي 1234)'}
          </p>
          {remote && (
            <input
              aria-label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inp} mt-4 text-start`}
              placeholder="admin@example.com"
              dir="ltr"
              autoComplete="username"
              autoFocus
            />
          )}
          <input
            aria-label={remote ? 'كلمة المرور' : 'رمز الدخول'}
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className={remote ? `${inp} mt-2` : `${inp} mt-5 text-center tracking-[0.5em]`}
            placeholder={remote ? 'كلمة المرور' : '••••'}
            autoComplete={remote ? 'current-password' : 'off'}
            autoFocus={!remote}
          />
          {err && <p className="mt-2 text-xs text-red-700">{err}</p>}
          <button
            disabled={busy || !secret || (remote && !email)}
            className="mt-4 w-full bg-ink-950 py-3 text-sm font-bold text-ivory-50 transition hover:bg-gold-600 disabled:opacity-40"
          >
            {busy ? 'جارٍ الدخول...' : 'دخول'}
          </button>
          <a href="#" className="mt-4 inline-block text-xs text-ink-500 underline">
            عودة للموقع
          </a>
          {!remote && (
            <p className="mt-3 text-[11px] leading-5 text-ink-500">
              وضع محلي: التعديلات تُحفظ في هذا المتصفح فقط. راجع SYNC.md لتفعيل النشر للزوار.
            </p>
          )}
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory-100">
      <div className="sticky top-0 z-30 border-b hairline bg-ivory-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="font-royal text-2xl font-bold text-ink-950">لوحة التحكم</p>
          <div className="flex items-center gap-2">
            <span className="bg-ink-950 px-3 py-1 text-xs font-bold text-ivory-50">
              {data.products.length.toLocaleString('ar-EG')} منتج
            </span>
            <a
              href="#"
              className="flex items-center gap-1.5 border border-ink-950/20 px-3 py-1.5 text-xs font-bold text-ink-900 transition hover:bg-ink-950 hover:text-ivory-50"
            >
              <Eye size={13} /> معاينة الموقع
            </a>
            <button
              onClick={() => {
                if (remote) signOut()
                try {
                  sessionStorage.removeItem('ashour-admin')
                } catch {
                  /* ignore */
                }
                setAuthed(false)
                window.location.hash = ''
              }}
              className="flex items-center gap-1.5 border border-ink-950/20 px-3 py-1.5 text-xs font-bold text-ink-900 transition hover:bg-red-700 hover:text-white"
            >
              <LogOut size={13} /> خروج
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex shrink-0 items-center gap-1.5 px-4 py-2 text-xs font-bold transition ${
                tab === tb.id ? 'bg-ink-950 text-ivory-50' : 'text-ink-700 hover:bg-ink-950/5'
              }`}
            >
              <tb.icon size={14} /> {tb.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-5">
        <SyncBar />
      </div>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        {tab === 'products' && <ProductsTab />}
        {tab === 'cats' && <CatsTab />}
        {tab === 'brands' && <BrandsTab />}
        {tab === 'studio' && <StudioTab />}
        {tab === 'videos' && <VideosTab />}
        {tab === 'content' && <ContentTab />}
        {tab === 'strings' && <StringsTab />}
        {tab === 'layout' && <LayoutTab />}
        {tab === 'settings' && <SettingsTab key={data.settings.pin} />}
      </div>
    </div>
  )
}

/* ---------------- Publish bar ---------------- */

function SyncBar() {
  const { remote, user, dirty, status, message, lastPublished, publish, pull } = useSite()

  if (!remote) {
    return (
      <div className="flex items-start gap-2 border border-amber-600/30 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-900">
        <CloudOff size={15} className="mt-0.5 shrink-0" />
        <p>
          <b>وضع محلي:</b> التعديلات تُحفظ في هذا المتصفح فقط ولا يراها الزوار. لتفعيل النشر أضف{' '}
          <code className="bg-white px-1" dir="ltr">
            VITE_SUPABASE_URL
          </code>{' '}
          و{' '}
          <code className="bg-white px-1" dir="ltr">
            VITE_SUPABASE_ANON_KEY
          </code>{' '}
          ثم أعد النشر — الخطوات كاملة في <b>SYNC.md</b>.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border border-ink-950/10 bg-white px-4 py-3 text-xs">
      <span
        className={`flex items-center gap-1.5 px-2 py-1 font-bold ${
          dirty ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-900'
        }`}
      >
        <CloudUpload size={13} /> {dirty ? 'تغييرات غير منشورة' : 'كل شيء منشور'}
      </span>
      <span className="text-ink-500">
        {message || (lastPublished ? `آخر نشر: ${new Date(lastPublished).toLocaleString('ar-EG')}` : 'لم تُنشر نسخة بعد')}
      </span>
      <div className="ms-auto flex items-center gap-2">
        {user && (
          <span className="hidden text-ink-500 sm:inline" dir="ltr">
            {user}
          </span>
        )}
        <button
          onClick={() => void pull()}
          disabled={status === 'loading' || status === 'saving'}
          className="flex items-center gap-1.5 border border-ink-950/20 px-3 py-1.5 font-bold transition hover:bg-ink-950 hover:text-ivory-50 disabled:opacity-40"
        >
          <RefreshCw size={13} className={status === 'loading' ? 'animate-spin' : ''} /> تحديث
        </button>
        <button
          onClick={async () => {
            if (!window.confirm('نشر التعديلات الآن؟ ستظهر فوراً لكل زوار الموقع.')) return
            await publish()
          }}
          disabled={!dirty || status === 'saving'}
          className="flex items-center gap-1.5 bg-ink-950 px-3 py-1.5 font-bold text-ivory-50 transition hover:bg-gold-600 disabled:opacity-40"
        >
          <CloudUpload size={13} /> {status === 'saving' ? 'جارٍ النشر...' : 'نشر الآن'}
        </button>
      </div>
    </div>
  )
}

/* ---------------- Publish bar ---------------- */

const BIG_WARN = 50 * 1024 * 1024
/** Supabase Free gives ~1 GB total storage; warn well before uploads start failing. */
const STORAGE_QUOTA = 1024 * 1024 * 1024

function confirmSize(size: number, action: string): boolean {
  return window.confirm(
    `${action} (${(size / 1048576).toFixed(1)} MB) حجم كبير.\n` +
      'Supabase Free تمنح مساحة تخزين محدودة (حوالي 1 GB إجمالياً) — ملفات الفيديو الكبيرة تزيد استهلاك الحصة.\n' +
      'رفعه على أي حال؟',
  )
}

/* ---------------- Storage in the cloud ---------------- */

function MediaCloudTab() {
  const { data, remote } = useSite()
  const [objects, setObjects] = useState<MediaObject[] | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    setBusy(true)
    setMessage('')
    try {
      setObjects(await listMediaObjects())
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'فشل القراءة')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!remote) return null

  const inUse = (name: string) =>
    data.products.some((p) => p.image?.includes(name)) ||
    data.videos.some((v) => v.src.includes(name) || (v.poster?.includes(name) ?? false)) ||
    data.settings.heroBg.image.includes(name) ||
    data.settings.heroBg.video.includes(name)

  const remove = async (name: string) => {
    const used = inUse(name)
    const ok = window.confirm(
      `حذف «${name}» من التخزين؟\n${
        used ? '⚠️ هذا الملف مرجّع من منتج أو فيديو — عدّل ذلك أولاً' : 'الحذف فوري: الصورة ستختفي للزوار'
      }`,
    )
    if (!ok) return
    setMessage('')
    try {
      await deleteMedia(name)
      await refresh()
      setMessage('تم الحذف')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '')
    }
  }

  const mb = (n: number) => `${(n / 1048576).toFixed(1)} MB`
  const total = objects ? objects.reduce((a, o) => a + o.size, 0) : 0

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-500">
          {objects === null ? 'جارٍ القراءة...' : `${objects.length} ملف · ${mb(total)}`}
          {message && <span className="ms-2 text-red-700">{message}</span>}
        </p>
        <button
          onClick={() => void refresh()}
          disabled={busy}
          className="flex items-center gap-1.5 border border-ink-950/20 px-3 py-1.5 text-xs font-bold transition hover:bg-ink-950 hover:text-ivory-50 disabled:opacity-40"
        >
          <RefreshCw size={13} className={busy ? 'animate-spin' : ''} /> تحديث
        </button>
      </div>
      {objects && (
        <div className="mt-3">
          <div className="h-1.5 w-full bg-ink-950/10">
            <div
              className={`h-full transition-all ${total > STORAGE_QUOTA * 0.8 ? 'bg-red-700' : 'bg-gold-600'}`}
              style={{ width: `${Math.min(100, (total / STORAGE_QUOTA) * 100)}%` }}
            />
          </div>
          <p className={`mt-1 text-[11px] ${total > STORAGE_QUOTA * 0.8 ? 'font-bold text-red-700' : 'text-ink-500'}`}>
            {total > STORAGE_QUOTA * 0.8
              ? `اقتربت من حد التخزين (${mb(total)} من ~1 GB) — احذف ملفات قديمة أو ارتقِ بخطتك قبل نفاد الحصة`
              : `من حصة ~1 GB: ${mb(total)} مستخدمة (${Math.round((total / STORAGE_QUOTA) * 100)}٪)`}
          </p>
        </div>
      )}
      {objects && objects.length === 0 && <p className="mt-3 text-center text-xs text-ink-500">التخزين فارغ</p>}
      {objects && objects.length > 0 && (
        <ul className="mt-3 divide-y divide-ink-950/10 border border-ink-950/10 bg-white">
          {objects.map((o) => {
            const used = inUse(o.name)
            return (
              <li key={o.name} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                <span className="min-w-0 truncate font-mono text-ink-700" dir="ltr">
                  {o.name}
                </span>
                <span className="shrink-0 font-bold text-ink-950">{mb(o.size)}</span>
                <button
                  onClick={() => void remove(o.name)}
                  disabled={used}
                  title={used ? 'قيد الاستخدام من منتج أو فيديو' : 'حذف نهائي — سيزول للزوار'}
                  className={`flex shrink-0 items-center gap-1 font-bold transition ${
                    used ? 'cursor-not-allowed text-ink-400' : 'text-red-700 hover:underline'
                  }`}
                >
                  <Trash2 size={13} /> {used ? 'قيد الاستخدام' : 'حذف'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <p className="mt-2 text-[11px] leading-5 text-ink-500">
        أقصى قائمة 1000 ملف. حذف ملف يزيله فوراً — حذف رابط لا يزيل المحتوى إلا بعد إعادة النشر.
      </p>
    </div>
  )
}

/* ---------------- Products ---------------- */

const blankProduct = (categories: Category[], brands: string[]): Product => ({
  id: `p-${Date.now()}`,
  name: { ar: '', he: '' },
  latin: '',
  brand: brands[0] ?? '',
  categoryId: categories[0]?.id ?? '',
  priceNum: 100,
  description: { ar: '', he: '' },
  notes: {
    ar: { top: [], heart: [], base: [] },
    he: { top: [], heart: [], base: [] },
  },
  longevity: { ar: '', he: '' },
  intensity: 3,
  variant: 0,
  colors: { accent: '#d4a24c', liquid: '#7a4a12' },
})

function ProductsTab() {
  const { data, saveProduct, deleteProduct, catName } = useSite()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)

  const list = data.products.filter(
    (p) => !q.trim() || p.name.ar.includes(q.trim()) || p.name.he.includes(q.trim()) || p.brand.includes(q.trim()),
  )

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input aria-label="بحث في المنتجات" value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في المنتجات..." className={`${inp} max-w-xs`} />
        <span className="text-xs text-ink-500">
          {list.length.toLocaleString('ar-EG')} / {data.products.length.toLocaleString('ar-EG')}
        </span>
        <button
          onClick={() => setEditing(blankProduct(data.categories, data.brands))}
          className="ms-auto flex items-center gap-1.5 bg-ink-950 px-5 py-2.5 text-xs font-bold text-ivory-50 transition hover:bg-gold-600"
        >
          <Plus size={14} /> إضافة منتج
        </button>
      </div>

      <div className="overflow-x-auto border border-ink-950/10 bg-white">
        <table className="w-full min-w-[760px] text-start text-sm">
          <thead>
            <tr className="border-b hairline bg-ivory-100 text-xs text-ink-500">
              <th className="p-3 font-bold">المنتج</th>
              <th className="p-3 font-bold">الدار</th>
              <th className="p-3 font-bold">التصنيف</th>
              <th className="p-3 font-bold">السعر</th>
              <th className="p-3 font-bold">شارات</th>
              <th className="p-3 font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-b hairline last:border-0 hover:bg-ivory-50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-10 shrink-0 bg-ivory-100">
                      <BottleSVG variant={p.variant} accent={p.colors.accent} liquid={p.colors.liquid} className="h-full w-full" />
                    </div>
                    <div>
                      <p className="font-bold text-ink-950">{p.name.ar || '—'}</p>
                      <p className="text-[11px] text-ink-500">{p.latin}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-ink-700">{p.brand}</td>
                <td className="p-3 text-ink-700">{catName(p.categoryId)}</td>
                <td className="p-3 font-bold text-ink-950">
                  {p.priceNum.toLocaleString('ar-EG')}
                  {p.oldPriceNum ? <span className="ms-2 text-xs font-normal text-ink-500 line-through">{p.oldPriceNum.toLocaleString('ar-EG')}</span> : null}
                </td>
                <td className="p-3 text-xs text-ink-500">
                  {[p.isBestSeller && 'الأكثر مبيعاً', p.isNew && 'جديد'].filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const clone = structuredClone(p)
                        clone.id = `p-${Date.now()}`
                        clone.name = { ...clone.name, ar: `${clone.name.ar} (نسخة)` }
                        clone.isBestSeller = false
                        saveProduct(clone)
                      }}
                      aria-label="duplicate"
                      title="تكرار"
                      className="grid size-8 place-items-center bg-ink-950/[0.04] text-ink-900 ring-1 ring-ink-950/10 transition hover:bg-ink-950 hover:text-ivory-50"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => setEditing(structuredClone(p))}
                      aria-label="edit"
                      className="grid size-8 place-items-center bg-ink-950/[0.04] text-ink-900 ring-1 ring-ink-950/10 transition hover:bg-ink-950 hover:text-ivory-50"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`حذف «${p.name.ar}»؟`)) deleteProduct(p.id)
                      }}
                      aria-label="delete"
                      className="grid size-8 place-items-center bg-red-700/5 text-red-700 ring-1 ring-red-700/20 transition hover:bg-red-700 hover:text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <ProductForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function ProductForm({ initial, onClose }: { initial: Product; onClose: () => void }) {
  const { data, saveProduct } = useSite()
  const [p, setP] = useState<Product>(initial)
  const [uploading, setUploading] = useState(false)
  const imgURL = useMediaURL(p.image)
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((prev) => ({ ...prev, [k]: v }))
  const setL = (k: 'name' | 'description' | 'longevity', v: LText) => setP((prev) => ({ ...prev, [k]: v }))
  const notesText = (lg: 'ar' | 'he', k: 'top' | 'heart' | 'base') => p.notes[lg][k].join('\n')
  const setNotes = (lg: 'ar' | 'he', k: 'top' | 'heart' | 'base', v: string) =>
    setP((prev) => ({ ...prev, notes: { ...prev.notes, [lg]: { ...prev.notes[lg], [k]: v.split('\n').map((s) => s.trim()).filter(Boolean) } } }))

  const valid = p.name.ar.trim() && p.priceNum > 0 && p.categoryId

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/60 p-4" onClick={onClose}>
      <div className="mx-auto my-6 w-full max-w-3xl border border-ink-950/10 bg-ivory-50 p-5 shadow-2xl sm:p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-5 font-royal text-2xl font-bold text-ink-950">{data.products.some((x) => x.id === p.id) ? 'تعديل منتج' : 'إضافة منتج'}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-ink-950/10 bg-white p-4 md:col-span-2">
            <p className="mb-3 text-xs font-bold text-ink-700">صورة المنتج (اختياري — إن لم ترفع تُستخدم الزجاجة المرسومة)</p>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="h-32 w-24 shrink-0 bg-ivory-100 ring-1 ring-ink-950/10">
                {imgURL ? (
                  <img src={imgURL} alt="" className="h-full w-full object-contain" />
                ) : (
                  <BottleSVG variant={p.variant} accent={p.colors.accent} liquid={p.colors.liquid} className="h-full w-full" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 bg-ink-950 px-4 py-2 text-xs font-bold text-ivory-50 transition hover:bg-gold-600">
                  <ImagePlus size={14} /> {uploading ? 'جارٍ الرفع...' : 'رفع صورة'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      setUploading(true)
                      try {
                        const blob = await compressImage(f)
                        if (blob.size > BIG_WARN && !(await confirmSize(blob.size, 'صورة المنتج'))) return
                        const id = await saveMediaSmart(blob)
                        set('image', id)
                      } catch {
                        window.alert('تعذر رفع الصورة — تحقق من الاتصال أو من مساحة التخزين')
                      } finally {
                        setUploading(false)
                        e.target.value = ''
                      }
                    }}
                  />
                </label>
                {p.image && (
                  <button onClick={() => set('image', undefined)} className="border border-red-700/30 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-700 hover:text-white">
                    إزالة الصورة
                  </button>
                )}
                <RemoveBgButton image={p.image} onDone={(id) => set('image', id)} />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-ink-500">تُضغط الصورة تلقائياً وتُحفظ في جهازك — تظهر بدل الزجاجة المرسومة. زر «إزالة الخلفية» يعمل تلقائياً وينتج صورة شفافة.</p>
          </div>
          <div className="md:col-span-2">
            <LPair label="اسم المنتج" value={p.name} onChange={(v) => setL('name', v)} />
          </div>
          <SRow label="الاسم اللاتيني">
            <input value={p.latin} onChange={(e) => set('latin', e.target.value)} className={inp} dir="ltr" placeholder="OUD ROYAL" />
          </SRow>
          <SRow label="الدار">
            <input value={p.brand} onChange={(e) => set('brand', e.target.value)} className={inp} list="adm-brands" />
            <datalist id="adm-brands">
              {data.brands.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </SRow>
          <SRow label="التصنيف">
            <select value={p.categoryId} onChange={(e) => set('categoryId', e.target.value)} className={inp}>
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.ar}
                </option>
              ))}
            </select>
          </SRow>
          <div className="grid grid-cols-2 gap-3">
            <SRow label="السعر">
              <input type="number" min={1} value={p.priceNum} onChange={(e) => set('priceNum', Number(e.target.value) || 0)} className={inp} />
            </SRow>
            <SRow label="السعر قبل الخصم">
              <input
                type="number"
                min={0}
                value={p.oldPriceNum ?? ''}
                onChange={(e) => set('oldPriceNum', e.target.value ? Number(e.target.value) : undefined)}
                className={inp}
                placeholder="اختياري"
              />
            </SRow>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SRow label="التركيز (1-5)">
              <input type="number" min={1} max={5} value={p.intensity} onChange={(e) => set('intensity', Math.min(5, Math.max(1, Number(e.target.value) || 1)))} className={inp} />
            </SRow>
            <SRow label="شكل الزجاجة">
              <select value={p.variant} onChange={(e) => set('variant', Number(e.target.value) as 0 | 1 | 2)} className={inp}>
                <option value={0}>كلاسيكية</option>
                <option value={1}>نحيفة</option>
                <option value={2}>دائرية</option>
              </select>
            </SRow>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SRow label="لون السائل">
              <div className="flex gap-2">
                <input type="color" value={p.colors.accent} onChange={(e) => set('colors', { ...p.colors, accent: e.target.value })} className="h-9 w-12 cursor-pointer" />
                <input value={p.colors.accent} onChange={(e) => set('colors', { ...p.colors, accent: e.target.value })} className={inp} dir="ltr" />
              </div>
            </SRow>
            <SRow label="لون العمق">
              <div className="flex gap-2">
                <input type="color" value={p.colors.liquid} onChange={(e) => set('colors', { ...p.colors, liquid: e.target.value })} className="h-9 w-12 cursor-pointer" />
                <input value={p.colors.liquid} onChange={(e) => set('colors', { ...p.colors, liquid: e.target.value })} className={inp} dir="ltr" />
              </div>
            </SRow>
          </div>
          <SRow label="الحالة والشارات">
            <div className="flex flex-wrap gap-4 pt-2 text-sm text-ink-800">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!p.isNew} onChange={(e) => set('isNew', e.target.checked)} className="size-4 accent-[#8a6c2a]" /> جديد
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!p.isBestSeller} onChange={(e) => set('isBestSeller', e.target.checked)} className="size-4 accent-[#8a6c2a]" /> الأكثر مبيعاً
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!p.soldOut} onChange={(e) => set('soldOut', e.target.checked)} className="size-4 accent-[#8a6c2a]" /> نفدت الكمية
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!p.hidden} onChange={(e) => set('hidden', e.target.checked)} className="size-4 accent-[#8a6c2a]" /> إخفاء من الموقع
              </label>
            </div>
          </SRow>
          <div className="md:col-span-2">
            <LPair label="الوصف" value={p.description} onChange={(v) => setL('description', v)} />
          </div>
          {(['ar', 'he'] as const).map((lg) => (
            <div key={lg} className="space-y-2 border border-ink-950/10 bg-white p-3 md:col-span-2">
              <p className="text-xs font-bold text-ink-700">النوتات ({lg === 'ar' ? 'العربية — سطر لكل نوتة' : 'עברית — שורה לכל תו'})</p>
              <div className="grid gap-2 md:grid-cols-3">
                {(['top', 'heart', 'base'] as const).map((k) => (
                  <textarea
                    key={k}
                    value={notesText(lg, k)}
                    onChange={(e) => setNotes(lg, k, e.target.value)}
                    rows={3}
                    dir="auto"
                    placeholder={k === 'top' ? 'افتتاحية' : k === 'heart' ? 'قلب' : 'قاعدة'}
                    className={inp}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="md:col-span-2">
            <LPair label="الثبات" value={p.longevity} onChange={(v) => setL('longevity', v)} />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            disabled={!valid}
            onClick={() => {
              saveProduct(p)
              onClose()
            }}
            className="flex-1 bg-ink-950 py-3 text-sm font-bold text-ivory-50 transition hover:bg-gold-600 disabled:opacity-40"
          >
            حفظ المنتج
          </button>
          <button onClick={onClose} className="border border-ink-950/20 px-6 py-3 text-sm font-bold text-ink-900 transition hover:bg-ink-950/5">
            إلغاء
          </button>
        </div>
        {!valid && <p className="mt-2 text-center text-xs text-red-700">أكمل الاسم والسعر والتصنيف للحفظ</p>}
      </div>
    </div>
  )
}

/* ---------------- Categories ---------------- */

function askBgModelConsent(): boolean {
  if (window.localStorage.getItem('ashour-bg-model')) return true
  return window.confirm(
    'إزالة الخلفية تعمل بالذكاء الاصطناعي داخل متصفحك.\nأول مرة فقط يتم تحميل النموذج (~50 ميجابايت) وقد تستغرق 1–3 دقائق على الهاتف. بعدها تصبح أسرع. متابعة؟',
  )
}

function RemoveBgButton({ image, onDone }: { image?: string; onDone: (id: string) => void }) {
  const url = useMediaURL(image)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<BgProgress | null>(null)
  const [previous, setPrevious] = useState<string | null>(null)
  const keepPrevious = useRef(false)

  useEffect(() => {
    if (keepPrevious.current) {
      keepPrevious.current = false
      return
    }
    setPrevious(null)
  }, [image])

  if (!image || !url) return null

  const run = async () => {
    if (!askBgModelConsent()) return
    setBusy(true)
    setStatus({ label: 'جارٍ تحضير الصورة...' })
    try {
      const source = await (await fetch(url)).blob()
      const cutout = await removeImageBackground(source, setStatus)
      setStatus({ label: 'جارٍ حفظ الصورة...' })
      const blob = await compressImage(cutout)
      if (blob.size > BIG_WARN && !(await confirmSize(blob.size, 'الصورة بعد إزالة الخلفية'))) return
      const saved = await saveMediaSmart(blob)
      keepPrevious.current = true
      setPrevious(image)
      onDone(saved)
      try {
        window.localStorage.setItem('ashour-bg-model', '1')
      } catch {
        /* ignore */
      }
      setStatus(null)
    } catch {
      setStatus(null)
      window.alert(
        'تعذر إزالة الخلفية. تأكد من الاتصال بالإنترنت وحاول مرة أخرى.\nإن تكرر الخطأ، ارفع صورة PNG بخلفية شفافة جاهزة.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="flex items-center gap-1.5 border border-gold-600/40 px-4 py-2 text-xs font-bold text-gold-700 transition hover:bg-gold-600 hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
          <Wand2 size={14} /> {busy ? 'جارٍ إزالة الخلفية...' : 'إزالة الخلفية'}
        </button>
        {previous && !busy && (
          <button
            type="button"
            onClick={() => {
              onDone(previous)
              setPrevious(null)
            }}
            className="border border-ink-950/20 px-3 py-2 text-xs font-bold text-ink-700 transition hover:bg-ink-950 hover:text-ivory-50"
          >
            تراجع
          </button>
        )}
      </div>
      {busy && status && <span className="text-[10px] text-ink-500">{status.label}</span>}
    </div>
  )
}

function ImageField({
  label,
  hint,
  image,
  onChange,
}: {
  label: string
  hint: string
  image?: string
  onChange: (image?: string) => void
}) {
  const url = useMediaURL(image)
  const [uploading, setUploading] = useState(false)

  return (
    <SRow label={label}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden bg-ivory-100 ring-1 ring-ink-950/10">
          {url ? (
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-ink-500">بدون صورة</span>
          )}
        </div>
        <label className="flex cursor-pointer items-center gap-1.5 bg-ink-950 px-4 py-2 text-xs font-bold text-ivory-50 transition hover:bg-gold-600">
          <ImagePlus size={14} /> {uploading ? 'جارٍ الرفع...' : 'رفع صورة'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              setUploading(true)
              try {
                const blob = await compressImage(f)
                if (blob.size > BIG_WARN && !confirmSize(blob.size, label)) return
                onChange(await saveMediaSmart(blob))
              } catch {
                window.alert('تعذر رفع الصورة — تحقق من الاتصال أو مساحة التخزين')
              } finally {
                setUploading(false)
                e.target.value = ''
              }
            }}
          />
        </label>
        {image && (
          <button
            onClick={() => onChange(undefined)}
            className="border border-red-700/30 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-700 hover:text-white"
          >
            إزالة
          </button>
        )}
        <RemoveBgButton image={image} onDone={(id) => onChange(id)} />
      </div>
      <p className="mt-2 text-[11px] text-ink-500">{hint}</p>
    </SRow>
  )
}

const CATEGORY_IMAGE_HINT = 'تظهر صورة التصنيف في بلاط «مجموعات مختارة» بعد الريلز.'
const BRAND_LOGO_HINT = 'يظهر شعار الماركة في شريط «تسوّق حسب الماركة» بدل الحرف.'

function CatsTab() {
  const { data, saveCategory, deleteCategory } = useSite()
  const [showAdd, setShowAdd] = useState(false)
  const [draft, setDraft] = useState({ name: { ar: '', he: '' }, desc: { ar: '', he: '' }, color: '#d4a24c', image: undefined as string | undefined })

  const usedCount = (id: string) => data.products.filter((p) => p.categoryId === id).length

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="flex items-center gap-1.5 bg-ink-950 px-5 py-2.5 text-xs font-bold text-ivory-50 transition hover:bg-gold-600"
      >
        <Plus size={14} /> إضافة تصنيف (نسائي، أطفال...)
      </button>
      {showAdd && (
        <div className="space-y-3 border border-ink-950/10 bg-white p-5">
          <LPair label="الاسم" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <LPair label="الوصف" value={draft.desc} onChange={(v) => setDraft({ ...draft, desc: v })} />
          <SRow label="اللون">
            <input type="color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} className="h-9 w-16 cursor-pointer" />
          </SRow>
          <ImageField label="صورة التصنيف" hint={CATEGORY_IMAGE_HINT} image={draft.image} onChange={(image) => setDraft({ ...draft, image })} />
          <button
            disabled={!draft.name.ar.trim()}
            onClick={() => {
              saveCategory({ id: `c-${Date.now()}`, ...draft })
              setDraft({ name: { ar: '', he: '' }, desc: { ar: '', he: '' }, color: '#d4a24c', image: undefined })
              setShowAdd(false)
            }}
            className="bg-ink-950 px-6 py-2.5 text-xs font-bold text-ivory-50 transition hover:bg-gold-600 disabled:opacity-40"
          >
            حفظ التصنيف
          </button>
        </div>
      )}
      {data.categories.map((c) => (
        <div key={c.id} className="space-y-3 border border-ink-950/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-500">{usedCount(c.id).toLocaleString('ar-EG')} منتج مرتبط</span>
            <button
              onClick={() => {
                if (usedCount(c.id) > 0) {
                  window.alert(`لا يمكن الحذف: يوجد ${usedCount(c.id)} منتج في هذا التصنيف. انقلها أولاً.`)
                  return
                }
                if (window.confirm(`حذف تصنيف «${c.name.ar}»؟`)) {
                  if (!deleteCategory(c.id)) window.alert('تعذر الحذف')
                }
              }}
              className="flex items-center gap-1 text-xs font-bold text-red-700 hover:underline"
            >
              <Trash2 size={13} /> حذف
            </button>
          </div>
          <LPair label="الاسم" value={c.name} onChange={(v) => saveCategory({ ...c, name: v })} />
          <LPair label="الوصف" value={c.desc} onChange={(v) => saveCategory({ ...c, desc: v })} />
          <SRow label="اللون">
            <input type="color" value={c.color} onChange={(e) => saveCategory({ ...c, color: e.target.value })} className="h-9 w-16 cursor-pointer" />
          </SRow>
          <ImageField label="صورة التصنيف" hint={CATEGORY_IMAGE_HINT} image={c.image} onChange={(image) => saveCategory({ ...c, image })} />
        </div>
      ))}
    </div>
  )
}

/* ---------------- Brands ---------------- */

function BrandsTab() {
  const { data, setBrands, saveProduct, patchSettings } = useSite()
  const [name, setName] = useState('')
  const logos = data.settings.brandLogos ?? {}

  const setLogo = (brand: string, logo?: string) => {
    const next = { ...logos }
    if (logo) next[brand] = logo
    else delete next[brand]
    patchSettings({ brandLogos: next })
  }

  const used = (b: string) => data.products.filter((p) => p.brand === b).length

  return (
    <div className="border border-ink-950/10 bg-white p-5">
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم دار جديدة..." className={inp} />
        <button
          disabled={!name.trim() || data.brands.includes(name.trim())}
          onClick={() => {
            setBrands([...data.brands, name.trim()])
            setName('')
          }}
          className="flex shrink-0 items-center gap-1.5 bg-ink-950 px-5 py-2.5 text-xs font-bold text-ivory-50 transition hover:bg-gold-600 disabled:opacity-40"
        >
          <Plus size={14} /> إضافة
        </button>
      </div>
      <ul className="mt-4 divide-y divide-ink-950/10">
        {data.brands.map((b) => (
          <li key={b} className="space-y-3 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-ink-950">{b}</p>
                <p className="text-xs text-ink-500">{used(b).toLocaleString('ar-EG')} منتج</p>
              </div>
              <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const next = window.prompt('اسم الدار الجديد', b)?.trim()
                  if (!next || next === b) return
                  if (data.brands.includes(next)) {
                    window.alert('هذه الدار موجودة بالفعل')
                    return
                  }
                  setBrands(data.brands.map((x) => (x === b ? next : x)))
                  data.products.filter((p) => p.brand === b).forEach((p) => saveProduct({ ...p, brand: next }))
                  if (logos[b]) {
                    const moved = { ...logos, [next]: logos[b] }
                    delete moved[b]
                    patchSettings({ brandLogos: moved })
                  }
                }}
                aria-label={`تعديل ${b}`}
                className="grid size-8 place-items-center text-ink-700 ring-1 ring-ink-950/15 transition hover:bg-ink-950 hover:text-ivory-50"
              >
                <Pencil size={14} />
              </button>
                <button
                  onClick={() => {
                    if (used(b) > 0) {
                      window.alert(`لا يمكن الحذف: يوجد ${used(b)} منتج بهذه الدار.`)
                      return
                    }
                    if (window.confirm(`حذف «${b}»؟`)) {
                      setBrands(data.brands.filter((x) => x !== b))
                      setLogo(b, undefined)
                    }
                  }}
                  className="grid size-8 place-items-center text-red-700 ring-1 ring-red-700/20 transition hover:bg-red-700 hover:text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <ImageField label={`شعار ${b}`} hint={BRAND_LOGO_HINT} image={logos[b]} onChange={(logo) => setLogo(b, logo)} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------- Videos ---------------- */

function VideosTab() {
  const { data, setVideos } = useSite()
  const [showAdd, setShowAdd] = useState(false)
  const [draft, setDraft] = useState({ title: { ar: '', he: '' }, src: '', poster: '' })
  const [uploading, setUploading] = useState(false)

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= data.videos.length) return
    const arr = [...data.videos]
    const [item] = arr.splice(i, 1)
    arr.splice(j, 0, item)
    setVideos(arr)
  }

  const uploadVideoFile = async (f: File): Promise<string | null> => {
    if (f.size > 30 * 1024 * 1024) {
      window.alert('الفيديو كبير جداً (أكثر من 30MB) — اختر مقطعاً أصغر')
      return null
    }
    setUploading(true)
    try {
      return await saveMediaSmart(f)
    } catch {
      window.alert('تعذر رفع الفيديو — تحقق من الاتصال أو من مساحة التخزين')
      return null
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="flex items-center gap-1.5 bg-ink-950 px-5 py-2.5 text-xs font-bold text-ivory-50 transition hover:bg-gold-600"
      >
        <Plus size={14} /> إضافة فيديو (رفع ملف أو رابط)
      </button>
      {showAdd && (
        <div className="space-y-3 border border-ink-950/10 bg-white p-5">
          <LPair label="العنوان" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
          <SRow label="ملف الفيديو">
            <div className="flex flex-col gap-2">
              <label className="flex w-fit cursor-pointer items-center gap-1.5 bg-ink-950 px-4 py-2 text-xs font-bold text-ivory-50 transition hover:bg-gold-600">
                <Upload size={13} /> {uploading ? 'جارٍ الرفع...' : 'رفع mp4 من جهازك'}
                <input
                  type="file"
                  accept="video/mp4,video/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    const id = await uploadVideoFile(f)
                    if (id) setDraft({ ...draft, src: id })
                    e.target.value = ''
                  }}
                />
              </label>
              <input value={draft.src} onChange={(e) => setDraft({ ...draft, src: e.target.value })} className={inp} dir="ltr" placeholder="أو الصق رابط mp4 / مسار مثل /videos/name.mp4" />
            </div>
          </SRow>
          <SRow label="الصورة المصغرة">
            <div className="flex flex-col gap-2">
              <label className="flex w-fit cursor-pointer items-center gap-1.5 border border-ink-950/20 px-4 py-2 text-xs font-bold transition hover:bg-ink-950 hover:text-ivory-50">
                <ImagePlus size={13} /> رفع صورة مصغرة
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    try {
                      const blob = await compressImage(f, 540, 0.75)
                      if (blob.size > BIG_WARN && !(await confirmSize(blob.size, 'الصورة المصغرة'))) return
                      setDraft({ ...draft, poster: await saveMediaSmart(blob) })
                    } catch {
                      window.alert('تعذر رفع الصورة المصغرة')
                    }
                    e.target.value = ''
                  }}
                />
              </label>
              <input value={draft.poster} onChange={(e) => setDraft({ ...draft, poster: e.target.value })} className={inp} dir="ltr" placeholder="اختياري — رابط صورة" />
            </div>
          </SRow>
          <button
            disabled={!draft.title.ar.trim() || !draft.src.trim()}
            onClick={() => {
              setVideos([...data.videos, { id: `v-${Date.now()}`, ...draft }])
              setDraft({ title: { ar: '', he: '' }, src: '', poster: '' })
              setShowAdd(false)
            }}
            className="bg-ink-950 px-6 py-2.5 text-xs font-bold text-ivory-50 transition hover:bg-gold-600 disabled:opacity-40"
          >
            حفظ الفيديو
          </button>
        </div>
      )}
      {data.videos.map((v, i) => (
        <div key={v.id} className="flex flex-col gap-4 border border-ink-950/10 bg-white p-4 sm:flex-row">
          <video src={v.src} poster={v.poster} muted playsInline preload="metadata" className="h-36 w-20 shrink-0 self-start bg-ink-950 object-cover" />
          <div className="flex-1 space-y-2">
            <LPair label="العنوان" value={v.title} onChange={(nv) => setVideos(data.videos.map((x) => (x.id === v.id ? { ...x, title: nv } : x)))} />
            <SRow label="الرابط">
              <input
                value={v.src}
                onChange={(e) => setVideos(data.videos.map((x) => (x.id === v.id ? { ...x, src: e.target.value } : x)))}
                className={inp}
                dir="ltr"
              />
            </SRow>
          </div>
          <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
            <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="up" className="grid size-8 place-items-center ring-1 ring-ink-950/15 transition hover:bg-ink-950 hover:text-ivory-50 disabled:opacity-30">
              <ArrowUp size={14} />
            </button>
            <button onClick={() => move(i, 1)} disabled={i === data.videos.length - 1} aria-label="down" className="grid size-8 place-items-center ring-1 ring-ink-950/15 transition hover:bg-ink-950 hover:text-ivory-50 disabled:opacity-30">
              <ArrowDown size={14} />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`حذف فيديو «${v.title.ar}»؟`)) setVideos(data.videos.filter((x) => x.id !== v.id))
              }}
              aria-label="delete"
              className="grid size-8 place-items-center text-red-700 ring-1 ring-red-700/20 transition hover:bg-red-700 hover:text-white"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
      {data.videos.length === 0 && <p className="text-center text-sm text-ink-500">لا توجد فيديوهات — أضف أول فيديو بالأعلى</p>}
    </div>
  )
}

/* ---------------- Content ---------------- */

function ContentTab() {
  const { data, setContent } = useSite()
  const patch = (fn: (c: Content) => void) => {
    const c = structuredClone(data.content)
    fn(c)
    setContent(c)
  }
  const c = data.content

  return (
    <div className="space-y-5">
      <Card title="الواجهة الرئيسية (Hero)">
        <LPair label="سطر علوي" value={c.hero.eyebrow} onChange={(v) => patch((x) => (x.hero.eyebrow = v))} />
        <LPair label="العنوان 1" value={c.hero.title1} onChange={(v) => patch((x) => (x.hero.title1 = v))} />
        <LPair label="العنوان 2" value={c.hero.title2} onChange={(v) => patch((x) => (x.hero.title2 = v))} />
        <LPair label="الوصف" value={c.hero.sub} onChange={(v) => patch((x) => (x.hero.sub = v))} />
        <LPair label="زر 1" value={c.hero.cta1} onChange={(v) => patch((x) => (x.hero.cta1 = v))} />
        <LPair label="زر 2" value={c.hero.cta2} onChange={(v) => patch((x) => (x.hero.cta2 = v))} />
      </Card>

      <Card title="الريلز + صفحة الكتالوج">
        <LPair label="الريلز: علوي" value={c.reels.eyebrow} onChange={(v) => patch((x) => (x.reels.eyebrow = v))} />
        <LPair label="الريلز: عنوان" value={c.reels.title1} onChange={(v) => patch((x) => (x.reels.title1 = v))} />
        <LPair label="الريلز: مميز" value={c.reels.title2} onChange={(v) => patch((x) => (x.reels.title2 = v))} />
        <LPair label="المجموعة: علوي" value={c.collection.eyebrow} onChange={(v) => patch((x) => (x.collection.eyebrow = v))} />
        <LPair label="المجموعة: عنوان" value={c.collection.title1} onChange={(v) => patch((x) => (x.collection.title1 = v))} />
        <LPair label="المجموعة: مميز" value={c.collection.title2} onChange={(v) => patch((x) => (x.collection.title2 = v))} />
        <LPair label="المجموعة: وصف" value={c.collection.sub} onChange={(v) => patch((x) => (x.collection.sub = v))} />
      </Card>

      <Card title="ملاحظة عن التصميم الجديد">
        <p className="text-xs leading-6 text-ink-500">
          الأقسام القديمة (عائلات العطور، الدار، الخدمات، العروض) لم تعد تظهر بعد الريلز — بياناتها ما زالت محفوظة في
          ملف النسخ الاحتياطي ولا تؤثر على المتجر. أقسام المتجر الجديدة تقرأ منتجاتك وتصنيفاتك ودورك مباشرة من هنا،
          أما عناوينها فتُعدَّل من تبويب «نصوص الواجهة».
        </p>
      </Card>

      <Card title="الفوتر">
        <LPair label="نبذة" value={c.footer.about} onChange={(v) => patch((x) => (x.footer.about = v))} />
        <LPair label="عنوان النشرة" value={c.footer.newsTitle} onChange={(v) => patch((x) => (x.footer.newsTitle = v))} />
        <LPair label="الحقوق" value={c.footer.rights} onChange={(v) => patch((x) => (x.footer.rights = v))} />
      </Card>
    </div>
  )
}

/* ---------------- Storefront sections ---------------- */

const STORE_SECTIONS: { key: string; label: string; mode: 'rail' | 'grid' }[] = [
  { key: 'brands', label: 'شريط الماركات', mode: 'rail' },
  { key: 'featured', label: 'مجموعات مختارة', mode: 'rail' },
  { key: 'price', label: 'تسوّق حسب السعر', mode: 'rail' },
  { key: 'blackFriday', label: 'منتجات الجمعة السوداء', mode: 'grid' },
  { key: 'onSale', label: 'العروض', mode: 'grid' },
  { key: 'testers', label: 'تسترات', mode: 'grid' },
  { key: 'new', label: 'وصل حديثاً', mode: 'grid' },
  { key: 'best', label: 'الأكثر مبيعاً', mode: 'grid' },
  { key: 'gifts', label: 'مجموعات الهدايا', mode: 'grid' },
  { key: 'arabic', label: 'العطور العربية', mode: 'grid' },
  { key: 'niche', label: 'عطور النيش', mode: 'grid' },
]

function LayoutTab() {
  const { data, patchSettings } = useSite()
  const s = data.settings
  const layouts = s.layouts ?? {}
  const visibility = s.visibility ?? {}

  return (
    <div className="space-y-4">
      <div className="border border-ink-950/10 bg-white p-5">
        <p className="mb-1 text-sm font-bold text-ink-950">عرض أقسام المتجر بعد الريلز</p>
        <p className="text-xs leading-6 text-ink-500">
          اختر لكل قسم طريقة العرض: <b>جانبي</b> (بجانب بعض مع تمرير، مثل تسوّق حسب السعر) أو <b>شبكة ٤ أعمدة</b> (فوق بعض، مثل وصل حديثاً).
          يمكنك أيضاً إخفاء أي قسم دون حذف بياناته. التغيير يظهر فوراً في المتجر، وبعد النشر يظهر للزوار.
        </p>
      </div>
      <div className="border border-ink-950/10 bg-white p-5">
        {STORE_SECTIONS.map((sec) => (
          <div key={sec.key} className="grid items-center gap-3 border-b border-ink-950/10 py-4 last:border-0 md:grid-cols-[1fr_140px_180px]">
            <p className="text-sm font-bold text-ink-950">{sec.label}</p>
            <label className="flex items-center gap-2 text-xs font-bold text-ink-700">
              <input
                type="checkbox"
                checked={visibility[sec.key] !== false}
                onChange={(e) => patchSettings({ visibility: { ...visibility, [sec.key]: e.target.checked } })}
                className="size-4 accent-[#8b6914]"
              />
              إظهار القسم
            </label>
            <select
              value={layouts[sec.key] ?? sec.mode}
              onChange={(e) => patchSettings({ layouts: { ...layouts, [sec.key]: e.target.value as 'rail' | 'grid' } })}
              className={inp}
            >
              <option value="rail">عرض جانبي (تمرير)</option>
              <option value="grid">شبكة ٤ أعمدة</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Image studio ---------------- */

const STUDIO_CHECKER = {
  backgroundImage: 'repeating-conic-gradient(#e7e2da 0% 25%, #fbf9f6 0% 50%)',
  backgroundSize: '24px 24px',
}

function useObjectURL(blob: Blob | null): string {
  const [url, setUrl] = useState('')
  useEffect(() => {
    if (!blob) {
      setUrl('')
      return
    }
    const next = URL.createObjectURL(blob)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [blob])
  return url
}

function StudioCompare({
  before,
  after,
  value,
  onChange,
}: {
  before: string
  after: string
  value: number
  onChange: (v: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    onChange(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)))
  }

  return (
    <div>
      <div
        ref={ref}
        className="relative aspect-square w-full touch-none overflow-hidden border border-ink-950/10"
        style={STUDIO_CHECKER}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          move(e.clientX)
        }}
        onPointerMove={(e) => {
          if (e.buttons) move(e.clientX)
        }}
      >
        <img src={after} alt="بعد" className="pointer-events-none absolute inset-0 h-full w-full object-contain p-3" draggable={false} />
        <img
          src={before}
          alt="قبل"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain p-3"
          draggable={false}
          style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        />
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-gold-600" style={{ left: `${value}%` }} />
        <span className="pointer-events-none absolute left-2 top-2 bg-ink-950/80 px-2 py-1 text-[10px] font-bold text-ivory-50">قبل</span>
        <span className="pointer-events-none absolute right-2 top-2 bg-ink-950/80 px-2 py-1 text-[10px] font-bold text-ivory-50">بعد</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="مقارنة قبل وبعد"
        className="mt-3 w-full accent-[#8b6914]"
      />
      <p className="mt-1 text-center text-[11px] text-ink-500">اسحب الصورة أو المؤشر لمقارنة قبل/بعد</p>
    </div>
  )
}

interface BulkItem {
  id: string
  name: string
  source: Blob
  result?: Blob
  status: 'pending' | 'working' | 'done' | 'error'
  progress?: BgProgress
  error?: string
}

function BulkRow({
  item,
  disabled,
  onRemove,
}: {
  item: BulkItem
  disabled: boolean
  onRemove: () => void
}) {
  const sourceUrl = useObjectURL(item.source)
  const resultUrl = useObjectURL(item.result ?? null)
  const statusText =
    item.status === 'pending'
      ? 'بانتظار المعالجة'
      : item.status === 'working'
        ? 'جارٍ إزالة الخلفية...'
        : item.status === 'done'
          ? 'جاهزة'
          : item.error || 'فشلت المعالجة'

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <div className="grid size-16 shrink-0 place-items-center overflow-hidden border border-ink-950/10" style={STUDIO_CHECKER}>
        <img src={resultUrl || sourceUrl} alt="" className="h-full w-full object-contain p-1" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-ink-950">{item.name}</p>
        <p className={`text-[11px] ${item.status === 'error' ? 'text-red-700' : 'text-ink-500'}`}>{statusText}</p>
        {item.status === 'working' && item.progress && (
          <div className="mt-1">
            <div className="h-1 overflow-hidden bg-ink-950/10">
              <div className="h-full bg-gold-600 transition-all" style={{ width: `${item.progress.percent ?? 10}%` }} />
            </div>
            <p className="mt-0.5 text-[10px] text-ink-500">{item.progress.label}</p>
          </div>
        )}
      </div>
      {item.result && (
        <button
          onClick={() => downloadBlob(item.result!, `ashour-${item.name.replace(/\.[^.]+$/, '') || 'image'}.png`)}
          className="grid size-9 place-items-center border border-ink-950/20 text-ink-700 transition hover:bg-ink-950 hover:text-ivory-50"
          aria-label={`تنزيل ${item.name}`}
        >
          <Download size={14} />
        </button>
      )}
      <button
        onClick={onRemove}
        disabled={disabled || item.status === 'working'}
        className="grid size-9 place-items-center border border-red-700/25 text-red-700 transition hover:bg-red-700 hover:text-white disabled:opacity-30"
        aria-label={`حذف ${item.name}`}
      >
        <Trash2 size={14} />
      </button>
    </li>
  )
}

function BulkStudio() {
  const [items, setItems] = useState<BulkItem[]>([])
  const [padding, setPadding] = useState(8)
  const [aspect, setAspect] = useState<FrameAspect>('1:1')
  const [background, setBackground] = useState<string | null>(null)
  const [shadow, setShadow] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const stopRef = useRef(false)

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) {
      setError('اختر صوراً بصيغة JPG أو PNG أو WebP.')
      return
    }
    const room = 12 - items.length
    if (room <= 0) {
      setError('الحد الأقصى 12 صورة في الدفعة الواحدة.')
      return
    }
    setError('')
    const picked = list.slice(0, room)
    const next: BulkItem[] = []
    for (const f of picked) {
      try {
        const blob = await compressImage(f, 1400, 0.9)
        next.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: f.name,
          source: blob,
          status: 'pending',
        })
      } catch {
        /* skip unreadable file */
      }
    }
    setItems((prev) => [...prev, ...next])
  }

  const start = async () => {
    if (processing) return
    const pending = items.filter((x) => x.status === 'pending')
    if (pending.length === 0) {
      setError('أضف صوراً جديدة أولاً.')
      return
    }
    if (!askBgModelConsent()) return
    try {
      window.localStorage.setItem('ashour-bg-model', '1')
    } catch {
      /* ignore */
    }
    setProcessing(true)
    setError('')
    stopRef.current = false
    try {
      for (const item of pending) {
        if (stopRef.current) break
        setItems((prev) =>
          prev.map((x) =>
            x.id === item.id ? { ...x, status: 'working', progress: { label: 'جارٍ تحضير المحرك...' } } : x,
          ),
        )
        try {
          const cut = await removeImageBackground(item.source, (p) =>
            setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, progress: p } : x))),
          )
          const result = await trimTransparent(cut, {
            padding,
            aspect,
            background,
            shadow,
            brightness,
            contrast,
            saturation,
          })
          setItems((prev) =>
            prev.map((x) => (x.id === item.id ? { ...x, status: 'done', result, progress: undefined } : x)),
          )
        } catch {
          setItems((prev) =>
            prev.map((x) =>
              x.id === item.id ? { ...x, status: 'error', error: 'فشلت المعالجة', progress: undefined } : x,
            ),
          )
        }
      }
    } finally {
      setProcessing(false)
    }
  }

  const doneCount = items.filter((x) => x.status === 'done').length

  const downloadAll = () => {
    items
      .filter((x) => x.result)
      .forEach((item, i) => {
        setTimeout(() => downloadBlob(item.result!, `ashour-${i + 1}.png`), i * 600)
      })
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="border border-ink-950/10 bg-ivory-50 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-[11px] font-bold text-ink-600">
            <span className="flex items-center justify-between">
              <span>الهامش حول العنصر</span>
              <span>{padding.toLocaleString('ar-EG')}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={20}
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              className="w-full accent-[#8b6914]"
            />
          </label>
          <label className="block text-[11px] font-bold text-ink-600">
            المقاس
            <select
              value={aspect}
              onChange={(e) => setAspect(e.target.value as FrameAspect)}
              className={`${inp} mt-1 text-xs`}
            >
              <option value="original">المقاس الأصلي</option>
              <option value="1:1">مربع 1:1 — صور المنتجات</option>
              <option value="4:5">4:5 — إنستغرام</option>
              <option value="9:16">9:16 — ستوري / ريلز</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-ink-600">الخلفية</span>
          <button
            type="button"
            onClick={() => setBackground(null)}
            aria-label="خلفية شفافة"
            title="شفافة"
            className={`size-8 border border-ink-950/15 ${background === null ? 'ring-2 ring-gold-600 ring-offset-1' : ''}`}
            style={STUDIO_CHECKER}
          />
          {['#f8f5f3', '#ffffff', '#e7e2da', '#111111'].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setBackground(color)}
              aria-label={`خلفية ${color}`}
              title={color}
              className={`size-8 border border-ink-950/15 ${
                background?.toLowerCase() === color ? 'ring-2 ring-gold-600 ring-offset-1' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <label className="flex items-center gap-1 text-[10px] text-ink-500">
            لون مخصص
            <input
              type="color"
              value={background ?? '#f8f5f3'}
              onChange={(e) => setBackground(e.target.value)}
              className="size-8 cursor-pointer"
            />
          </label>
          <label className="ms-2 flex items-center gap-2 text-xs text-ink-700">
            <input
              type="checkbox"
              checked={shadow}
              onChange={(e) => setShadow(e.target.checked)}
              className="size-4 accent-[#8b6914]"
            />
            ظل خفيف
          </label>
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer text-[11px] font-bold text-ink-600">ضبط الألوان (اختياري)</summary>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {[
              { label: 'الإضاءة', value: brightness, onChange: setBrightness },
              { label: 'التباين', value: contrast, onChange: setContrast },
              { label: 'التشبع', value: saturation, onChange: setSaturation },
            ].map((item) => (
              <label key={item.label} className="block">
                <span className="flex items-center justify-between text-[10px] font-bold text-ink-600">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </span>
                <input
                  type="range"
                  min={50}
                  max={150}
                  value={item.value}
                  onChange={(e) => item.onChange(Number(e.target.value))}
                  className="w-full accent-[#8b6914]"
                />
              </label>
            ))}
          </div>
        </details>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void addFiles(e.target.files)
          e.target.value = ''
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fileRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files) void addFiles(e.dataTransfer.files)
        }}
        className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-8 text-center transition ${
          dragging ? 'border-gold-600 bg-gold-500/5' : 'border-ink-950/20 bg-white hover:border-gold-600'
        }`}
      >
        <ImagePlus size={28} className="text-gold-600" />
        <p className="mt-2 text-sm font-bold text-ink-950">أضف عدة صور (حتى 12 صورة)</p>
        <p className="mt-1 text-[11px] text-ink-500">تُعالج واحدة تلو الأخرى لتوفير ذاكرة الهاتف — PNG / JPG / WebP</p>
      </div>

      {error && <p className="border border-red-700/20 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

      {items.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-ink-600">
              {doneCount.toLocaleString('ar-EG')} / {items.length.toLocaleString('ar-EG')} جاهزة
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void start()}
                disabled={processing || !items.some((x) => x.status === 'pending')}
                className="flex items-center gap-1.5 bg-ink-950 px-4 py-2 text-xs font-bold text-ivory-50 transition hover:bg-gold-600 disabled:opacity-40"
              >
                <Wand2 size={14} /> {processing ? 'جارٍ المعالجة...' : 'بدء إزالة الخلفية'}
              </button>
              {processing && (
                <button
                  onClick={() => {
                    stopRef.current = true
                  }}
                  className="border border-red-700/30 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-700 hover:text-white"
                >
                  إيقاف بعد الصورة الحالية
                </button>
              )}
              {doneCount > 0 && (
                <button
                  onClick={downloadAll}
                  className="flex items-center gap-1.5 border border-ink-950/20 px-4 py-2 text-xs font-bold text-ink-800 transition hover:bg-ink-950 hover:text-ivory-50"
                >
                  <Download size={14} /> تنزيل الكل
                </button>
              )}
              {!processing && (
                <button
                  onClick={() => setItems([])}
                  className="flex items-center gap-1.5 border border-ink-950/20 px-4 py-2 text-xs font-bold text-ink-800 transition hover:bg-ink-950 hover:text-ivory-50"
                >
                  <Trash2 size={14} /> مسح القائمة
                </button>
              )}
            </div>
          </div>
          <ul className="divide-y divide-ink-950/10 border border-ink-950/10 bg-white px-4">
            {items.map((item) => (
              <BulkRow
                key={item.id}
                item={item}
                disabled={processing}
                onRemove={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
              />
            ))}
          </ul>
          <p className="text-[11px] leading-5 text-ink-500">
            «تنزيل الكل» قد يطلب من المتصفح السماح بتنزيل عدة ملفات. لحفظ صورة في المتجر مباشرة استخدم وضع «صورة واحدة».
          </p>
        </>
      )}
    </div>
  )
}

function BrushEditor({
  image,
  onApply,
  onClose,
}: {
  image: Blob
  onApply: (blob: Blob) => void
  onClose: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const baseRef = useRef<HTMLCanvasElement | null>(null)
  const maskRef = useRef<HTMLCanvasElement | null>(null)
  const lastRef = useRef<{ x: number; y: number } | null>(null)
  const drawingRef = useRef(false)
  const historyRef = useRef<ImageData[]>([])
  const [mode, setMode] = useState<'erase' | 'restore'>('erase')
  const [size, setSize] = useState(4)
  const [ready, setReady] = useState(false)
  const [historyLen, setHistoryLen] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const render = () => {
    const canvas = canvasRef.current
    const base = baseRef.current
    const mask = maskRef.current
    if (!canvas || !base || !mask) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(base, 0, 0)
    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(mask, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
  }

  const paint = (x: number, y: number) => {
    const mask = maskRef.current
    const canvas = canvasRef.current
    if (!mask || !canvas) return
    const ctx = mask.getContext('2d')
    if (!ctx) return
    const radius = Math.max(2, (canvas.width * size) / 100)
    ctx.save()
    ctx.globalCompositeOperation = mode === 'erase' ? 'destination-out' : 'source-over'
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const bmp = await createImageBitmap(image)
        if (cancelled) return
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = bmp.width
        canvas.height = bmp.height
        const base = document.createElement('canvas')
        base.width = bmp.width
        base.height = bmp.height
        const bctx = base.getContext('2d')
        if (!bctx) throw new Error()
        bctx.drawImage(bmp, 0, 0)
        baseRef.current = base

        const mask = document.createElement('canvas')
        mask.width = bmp.width
        mask.height = bmp.height
        const mctx = mask.getContext('2d')
        if (!mctx) throw new Error()
        mctx.fillStyle = '#ffffff'
        mctx.fillRect(0, 0, mask.width, mask.height)
        maskRef.current = mask

        render()
        setReady(true)
      } catch {
        if (!cancelled) setError('تعذر فتح محرر الفرشاة.')
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image])

  const point = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const undo = () => {
    const snap = historyRef.current.pop()
    const mask = maskRef.current
    if (!snap || !mask) return
    const ctx = mask.getContext('2d')
    if (!ctx) return
    ctx.putImageData(snap, 0, 0)
    render()
    setHistoryLen(historyRef.current.length)
  }

  const apply = async () => {
    const canvas = canvasRef.current
    const base = baseRef.current
    const mask = maskRef.current
    if (!canvas || !base || !mask) return
    setBusy(true)
    setError('')
    try {
      const out = document.createElement('canvas')
      out.width = canvas.width
      out.height = canvas.height
      const ctx = out.getContext('2d')
      if (!ctx) throw new Error()
      ctx.drawImage(base, 0, 0)
      ctx.globalCompositeOperation = 'destination-in'
      ctx.drawImage(mask, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      const blob = await new Promise<Blob | null>((res) => out.toBlob(res, 'image/png'))
      if (!blob) throw new Error()
      onApply(blob)
    } catch {
      setError('تعذر حفظ التعديل. جرّب مرة أخرى.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-ink-950/70 p-3 sm:p-6" onClick={onClose}>
      <div
        className="mx-auto my-4 w-full max-w-3xl border border-ink-950/10 bg-ivory-50 p-4 shadow-2xl sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-royal text-xl font-bold text-ink-950">إصلاح يدوي للخلفية</h3>
            <p className="mt-1 text-[11px] leading-5 text-ink-500">
              امسح الأجزاء الزائدة، أو استعد الأجزاء التي مسحتها بالفرشاة. استخدم «تراجع» للعودة خطوة.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="grid size-9 shrink-0 place-items-center border border-ink-950/20 text-ink-700 transition hover:bg-ink-950 hover:text-ivory-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 flex justify-center overflow-hidden border border-ink-950/10 p-2" style={STUDIO_CHECKER}>
          <canvas
            ref={canvasRef}
            className={`${ready ? 'block' : 'hidden'} h-auto max-h-[58vh] w-auto max-w-full touch-none`}
            onPointerDown={(e) => {
              const mask = maskRef.current
              const ctx = mask?.getContext('2d')
              if (mask && ctx) {
                historyRef.current.push(ctx.getImageData(0, 0, mask.width, mask.height))
                if (historyRef.current.length > 3) historyRef.current.shift()
                setHistoryLen(historyRef.current.length)
              }
              e.currentTarget.setPointerCapture(e.pointerId)
              const p = point(e)
              if (!p) return
              drawingRef.current = true
              lastRef.current = p
              paint(p.x, p.y)
              render()
            }}
            onPointerMove={(e) => {
              if (!drawingRef.current) return
              const p = point(e)
              if (!p) return
              const last = lastRef.current
              const canvas = canvasRef.current
              if (last && canvas) {
                const radius = Math.max(2, (canvas.width * size) / 100)
                const dist = Math.hypot(p.x - last.x, p.y - last.y)
                const steps = Math.max(1, Math.ceil(dist / Math.max(1, radius / 2)))
                for (let i = 1; i <= steps; i++) {
                  paint(last.x + ((p.x - last.x) * i) / steps, last.y + ((p.y - last.y) * i) / steps)
                }
              } else {
                paint(p.x, p.y)
              }
              lastRef.current = p
              render()
            }}
            onPointerUp={() => {
              drawingRef.current = false
              lastRef.current = null
            }}
            onPointerCancel={() => {
              drawingRef.current = false
              lastRef.current = null
            }}
          />
          {!ready && <p className="py-16 text-xs text-ink-500">جارٍ تحميل الصورة...</p>}
        </div>

        {error && <p className="mt-3 border border-red-700/20 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

        <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setMode('erase')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition ${
                mode === 'erase' ? 'bg-ink-950 text-ivory-50' : 'border border-ink-950/20 text-ink-700'
              }`}
            >
              <Eraser size={14} /> مسح
            </button>
            <button
              type="button"
              onClick={() => setMode('restore')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition ${
                mode === 'restore' ? 'bg-ink-950 text-ivory-50' : 'border border-ink-950/20 text-ink-700'
              }`}
            >
              <RotateCcw size={14} /> استعادة
            </button>
          </div>
          <label className="block text-[11px] font-bold text-ink-600">
            <span className="flex items-center justify-between">
              <span>حجم الفرشاة</span>
              <span>{size.toLocaleString('ar-EG')}%</span>
            </span>
            <input
              type="range"
              min={1}
              max={15}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-[#8b6914]"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink-950/10 pt-4">
          <button
            type="button"
            onClick={undo}
            disabled={historyLen === 0 || busy}
            className="flex items-center gap-1.5 border border-ink-950/20 px-4 py-2 text-xs font-bold text-ink-800 transition hover:bg-ink-950 hover:text-ivory-50 disabled:opacity-35"
          >
            <RotateCcw size={14} /> تراجع
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-ink-950/20 px-4 py-2 text-xs font-bold text-ink-800 transition hover:bg-ink-950 hover:text-ivory-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => void apply()}
              disabled={!ready || busy}
              className="bg-gold-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-ink-950 disabled:opacity-40"
            >
              {busy ? 'جارٍ الحفظ...' : 'تطبيق التعديل'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StudioTab() {
  const { data, saveProduct, saveCategory, patchSettings } = useSite()
  const [source, setSource] = useState<Blob | null>(null)
  const [cutout, setCutout] = useState<Blob | null>(null)
  const [final, setFinal] = useState<Blob | null>(null)
  const sourceUrl = useObjectURL(source)
  const finalUrl = useObjectURL(final)

  const [padding, setPadding] = useState(8)
  const [aspect, setAspect] = useState<FrameAspect>('1:1')
  const [background, setBackground] = useState<string | null>(null)
  const [shadow, setShadow] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [downloadType, setDownloadType] = useState<'png' | 'webp'>('png')
  const [compare, setCompare] = useState(50)
  const [removing, setRemoving] = useState(false)
  const [framing, setFraming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState<BgProgress | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [targetType, setTargetType] = useState<'product' | 'category' | 'brand'>('product')
  const [targetId, setTargetId] = useState('')
  const [savedRef, setSavedRef] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const [brushOpen, setBrushOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setSource(null)
    setCutout(null)
    setFinal(null)
    setProgress(null)
    setError('')
    setSuccess('')
    setSavedRef(null)
    setCompare(50)
  }

  const loadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('اختر ملف صورة (JPG أو PNG أو WebP).')
      return
    }
    setError('')
    setSuccess('')
    setSavedRef(null)
    setCutout(null)
    setFinal(null)
    setCompare(50)
    setProgress({ label: 'جارٍ تجهيز الصورة...' })
    try {
      const blob = await compressImage(file, 1400, 0.9)
      setSource(blob)
    } catch {
      setError('تعذر قراءة الصورة. جرّب صورة أخرى.')
    } finally {
      setProgress(null)
    }
  }

  useEffect(() => {
    if (!cutout) {
      setFinal(null)
      setFraming(false)
      return
    }
    let cancelled = false
    setFraming(true)
    trimTransparent(cutout, { padding, aspect, background, shadow, brightness, contrast, saturation })
      .then((blob) => {
        if (!cancelled) setFinal(blob)
      })
      .catch(() => {
        if (!cancelled) {
          setFinal(null)
          setError('تعذر تجهيز الإطار — جرّب صورة أخرى.')
        }
      })
      .finally(() => {
        if (!cancelled) setFraming(false)
      })
    return () => {
      cancelled = true
    }
  }, [cutout, padding, aspect, background, shadow, brightness, contrast, saturation])

  useEffect(() => {
    setSavedRef(null)
  }, [final])

  const removeBackground = async () => {
    if (!source || removing) return
    if (!askBgModelConsent()) return
    setRemoving(true)
    setError('')
    setSuccess('')
    setSavedRef(null)
    setProgress({ label: 'جارٍ تحضير المحرك...' })
    try {
      const result = await removeImageBackground(source, setProgress)
      setCutout(result)
      setCompare(50)
      try {
        window.localStorage.setItem('ashour-bg-model', '1')
      } catch {
        /* ignore */
      }
    } catch {
      setError('تعذر إزالة الخلفية. تحقق من الاتصال وحاول مرة أخرى، أو ارفع صورة PNG شفافة جاهزة.')
    } finally {
      setRemoving(false)
      setProgress(null)
    }
  }

  const targets =
    targetType === 'product'
      ? data.products.map((p) => ({ id: p.id, label: `${p.name.ar}${p.latin ? ` — ${p.latin}` : ''}` }))
      : targetType === 'category'
        ? data.categories.map((c) => ({ id: c.id, label: c.name.ar }))
        : data.brands.map((b) => ({ id: b, label: b }))

  const saveTarget = async () => {
    if (!final) {
      setError('أزل الخلفية أولاً ثم أعد المحاولة.')
      return
    }
    if (!targetId) {
      setError('اختر المنتج أو التصنيف أو الماركة أولاً.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      let ref = savedRef
      if (!ref) {
        const upload = await compressImage(final, 1200, 0.9)
        if (upload.size > BIG_WARN && !(await confirmSize(upload.size, 'الصورة النهائية'))) return
        ref = await saveMediaSmart(upload)
        setSavedRef(ref)
      }

      if (targetType === 'product') {
        const product = data.products.find((x) => x.id === targetId)
        if (!product) throw new Error('المنتج غير موجود')
        saveProduct({ ...product, image: ref })
        setSuccess(`تم حفظ الصورة في المنتج «${product.name.ar}».`)
      } else if (targetType === 'category') {
        const cat = data.categories.find((x) => x.id === targetId)
        if (!cat) throw new Error('التصنيف غير موجود')
        saveCategory({ ...cat, image: ref })
        setSuccess(`تم حفظ الصورة في التصنيف «${cat.name.ar}».`)
      } else {
        const logos = data.settings.brandLogos ?? {}
        patchSettings({ brandLogos: { ...logos, [targetId]: ref } })
        setSuccess(`تم حفظ الشعار للماركة «${targetId}».`)
      }
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'تعذر الحفظ. تأكد من تسجيل الدخول واتصال الإنترنت.')
    } finally {
      setSaving(false)
    }
  }

  const resetEdits = () => {
    setPadding(8)
    setAspect('1:1')
    setBackground(null)
    setShadow(false)
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
  }

  const download = async () => {
    if (!final) return
    setError('')
    try {
      const stamp = Date.now()
      if (downloadType === 'webp') {
        const blob = await encodeImage(final, 'image/webp', 0.9)
        downloadBlob(blob, `ashour-image-${stamp}.webp`)
      } else {
        downloadBlob(final, `ashour-image-${stamp}.png`)
      }
    } catch {
      setError('تعذر تنزيل الصورة. جرّب مرة أخرى.')
    }
  }

  return (
    <div className="space-y-5">
      <div className="border border-ink-950/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-royal text-xl font-bold text-ink-950">استوديو الصور</h2>
            <p className="mt-1 max-w-2xl text-xs leading-6 text-ink-500">
              ارفع صورة، أزل خلفيتها بالذكاء الاصطناعي، اضبط الإطار والقص، ثم احفظها مباشرة في منتج أو تصنيف أو ماركة — أو نزّلها. الصور الناتجة شفافة.
            </p>
          </div>
          {mode === 'single' && source && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 border border-ink-950/20 px-3 py-2 text-xs font-bold text-ink-800 transition hover:bg-ink-950 hover:text-ivory-50"
              >
                <ImagePlus size={14} /> تغيير الصورة
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 border border-ink-950/20 px-3 py-2 text-xs font-bold text-ink-800 transition hover:bg-ink-950 hover:text-ivory-50"
              >
                <RotateCcw size={14} /> صورة جديدة
              </button>
            </div>
          )}
        </div>

        <div className="mb-4 flex w-fit gap-1 border border-ink-950/10 bg-ivory-50 p-1">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`px-4 py-2 text-xs font-bold transition ${
              mode === 'single' ? 'bg-ink-950 text-ivory-50' : 'text-ink-700 hover:bg-ink-950/5'
            }`}
          >
            صورة واحدة
          </button>
          <button
            type="button"
            onClick={() => setMode('bulk')}
            className={`px-4 py-2 text-xs font-bold transition ${
              mode === 'bulk' ? 'bg-ink-950 text-ivory-50' : 'text-ink-700 hover:bg-ink-950/5'
            }`}
          >
            دفعة صور
          </button>
        </div>

        {mode === 'single' ? (
          <>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void loadFile(f)
            e.target.value = ''
          }}
        />

        {progress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-ink-600">
              <span>{progress.label}</span>
              {progress.percent != null && <span>{progress.percent.toLocaleString('ar-EG')}%</span>}
            </div>
            <div className="mt-1 h-1.5 overflow-hidden bg-ink-950/10">
              <div className="h-full bg-gold-600 transition-all" style={{ width: `${progress.percent ?? 10}%` }} />
            </div>
          </div>
        )}

        {error && <p className="mt-4 border border-red-700/20 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        {success && (
          <p className="mt-4 border border-green-700/20 bg-green-50 px-3 py-2 text-xs leading-6 text-green-800">
            {success}
            <br />
            <span className="text-[10px]">لا تنسَ الضغط على «نشر الآن» أعلى اللوحة ليظهر التعديل للزوار.</span>
          </p>
        )}

        {!source ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                fileRef.current?.click()
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              const f = e.dataTransfer.files?.[0]
              if (f) void loadFile(f)
            }}
            className={`mt-5 flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-12 text-center transition ${
              dragging ? 'border-gold-600 bg-gold-500/5' : 'border-ink-950/20 bg-ivory-50 hover:border-gold-600'
            }`}
          >
            <ImagePlus size={34} className="text-gold-600" />
            <p className="mt-3 font-bold text-ink-950">اسحب صورة هنا أو اضغط للاختيار</p>
            <p className="mt-1 text-xs text-ink-500">JPG · PNG · WebP — تُضغط تلقائياً حتى 1400 بكسل</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-3">
              {finalUrl && sourceUrl ? (
                <StudioCompare before={sourceUrl} after={finalUrl} value={compare} onChange={setCompare} />
              ) : (
                <div className="relative aspect-square w-full overflow-hidden border border-ink-950/10" style={STUDIO_CHECKER}>
                  <img src={sourceUrl} alt="الصورة الأصلية" className="h-full w-full object-contain p-3" />
                </div>
              )}
              {framing && <p className="text-xs text-ink-500">جارٍ تجهيز الإطار...</p>}
            </div>

            <div className="space-y-4">
              <div className="border border-ink-950/10 bg-ivory-50 p-4">
                <p className="text-xs font-bold text-ink-700">1) إزالة الخلفية</p>
                <button
                  onClick={() => void removeBackground()}
                  disabled={removing}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 bg-ink-950 px-4 py-3 text-xs font-bold text-ivory-50 transition hover:bg-gold-600 disabled:cursor-wait disabled:opacity-60"
                >
                  <Wand2 size={15} />
                  {removing ? 'جارٍ إزالة الخلفية...' : cutout ? 'إعادة إزالة الخلفية' : 'إزالة الخلفية بالذكاء الاصطناعي'}
                </button>
                <p className="mt-2 text-[11px] leading-5 text-ink-500">
                  أول استخدام يحمّل النموذج (~50 ميجابايت) مرة واحدة، وقد يستغرق 1–3 دقائق على الهاتف.
                </p>
                {cutout && !removing && (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setBrushOpen(true)}
                      className="flex items-center gap-1 text-[11px] font-bold text-gold-700 underline"
                    >
                      <Eraser size={12} /> إصلاح يدوي (مسح/استعادة)
                    </button>
                    <button
                      onClick={() => {
                        setCutout(null)
                        setFinal(null)
                        setSavedRef(null)
                        setSuccess('')
                      }}
                      className="text-[11px] font-bold text-ink-600 underline"
                    >
                      استعادة الصورة الأصلية
                    </button>
                  </div>
                )}
              </div>

              <div className={`border border-ink-950/10 bg-white p-4 ${cutout ? '' : 'opacity-50'}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-ink-700">2) الإطار والخلفية</p>
                  <button
                    type="button"
                    onClick={resetEdits}
                    disabled={!cutout}
                    className="text-[11px] font-bold text-ink-500 underline"
                  >
                    إعادة ضبط
                  </button>
                </div>
                <label className="mt-3 flex items-center justify-between text-[11px] font-bold text-ink-600">
                  <span>الهامش حول العنصر</span>
                  <span>{padding.toLocaleString('ar-EG')}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={padding}
                  disabled={!cutout}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="mt-1 w-full accent-[#8b6914]"
                />
                <label className="mt-3 block text-[11px] font-bold text-ink-600">
                  المقاس
                  <select
                    value={aspect}
                    disabled={!cutout}
                    onChange={(e) => setAspect(e.target.value as FrameAspect)}
                    className={`${inp} mt-1 text-xs`}
                  >
                    <option value="original">المقاس الأصلي</option>
                    <option value="1:1">مربع 1:1 — صور المنتجات</option>
                    <option value="4:5">4:5 — إنستغرام</option>
                    <option value="9:16">9:16 — ستوري / ريلز</option>
                  </select>
                </label>
                <p className="mt-3 text-[11px] font-bold text-ink-600">الخلفية</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBackground(null)}
                    aria-label="خلفية شفافة"
                    title="شفافة"
                    className={`size-8 border border-ink-950/15 ${background === null ? 'ring-2 ring-gold-600 ring-offset-1' : ''}`}
                    style={STUDIO_CHECKER}
                  />
                  {['#f8f5f3', '#ffffff', '#e7e2da', '#111111'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBackground(color)}
                      aria-label={`خلفية ${color}`}
                      title={color}
                      className={`size-8 border border-ink-950/15 ${
                        background?.toLowerCase() === color ? 'ring-2 ring-gold-600 ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <label className="flex items-center gap-1 text-[10px] text-ink-500">
                    لون مخصص
                    <input
                      type="color"
                      value={background ?? '#f8f5f3'}
                      onChange={(e) => setBackground(e.target.value)}
                      className="size-8 cursor-pointer"
                    />
                  </label>
                </div>
                <label className="mt-3 flex items-center gap-2 text-xs text-ink-700">
                  <input
                    type="checkbox"
                    checked={shadow}
                    disabled={!cutout}
                    onChange={(e) => setShadow(e.target.checked)}
                    className="size-4 accent-[#8b6914]"
                  />
                  ظل خفيف تحت العنصر
                </label>
                <p className="mt-2 text-[11px] leading-5 text-ink-500">يقص الفراغات الشفافة ويوسّط العنصر تلقائياً.</p>
              </div>

              <div className={`border border-ink-950/10 bg-white p-4 ${cutout ? '' : 'opacity-50'}`}>
                <p className="text-xs font-bold text-ink-700">3) ضبط الألوان</p>
                {[
                  { label: 'الإضاءة', value: brightness, onChange: setBrightness },
                  { label: 'التباين', value: contrast, onChange: setContrast },
                  { label: 'التشبع', value: saturation, onChange: setSaturation },
                ].map((item) => (
                  <label key={item.label} className="mt-2 block">
                    <span className="flex items-center justify-between text-[11px] font-bold text-ink-600">
                      <span>{item.label}</span>
                      <span>{item.value.toLocaleString('ar-EG')}%</span>
                    </span>
                    <input
                      type="range"
                      min={50}
                      max={150}
                      value={item.value}
                      disabled={!cutout}
                      onChange={(e) => item.onChange(Number(e.target.value))}
                      className="w-full accent-[#8b6914]"
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setBrightness(100)
                    setContrast(100)
                    setSaturation(100)
                  }}
                  disabled={!cutout}
                  className="mt-2 text-[11px] font-bold text-ink-500 underline"
                >
                  إعادة ضبط الألوان
                </button>
              </div>

              <div className="border border-ink-950/10 bg-white p-4">
                <p className="text-xs font-bold text-ink-700">4) الحفظ في المتجر</p>
                <div className="mt-3 grid gap-2">
                  <select
                    value={targetType}
                    onChange={(e) => {
                      setTargetType(e.target.value as 'product' | 'category' | 'brand')
                      setTargetId('')
                      setError('')
                      setSuccess('')
                    }}
                    className={inp}
                  >
                    <option value="product">صورة منتج</option>
                    <option value="category">صورة تصنيف</option>
                    <option value="brand">شعار ماركة</option>
                  </select>
                  <select
                    value={targetId}
                    onChange={(e) => {
                      setTargetId(e.target.value)
                      setError('')
                      setSuccess('')
                    }}
                    disabled={targets.length === 0}
                    className={inp}
                  >
                    <option value="">{targets.length === 0 ? 'لا توجد عناصر' : 'اختر...'}</option>
                    {targets.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => void saveTarget()}
                  disabled={!final || !targetId || saving || framing}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 bg-gold-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-ink-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Upload size={14} /> {saving ? 'جارٍ الحفظ...' : 'حفظ في المتجر'}
                </button>
                <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                  <select
                    value={downloadType}
                    onChange={(e) => setDownloadType(e.target.value as 'png' | 'webp')}
                    className={`${inp} text-xs`}
                  >
                    <option value="png">PNG — شفاف</option>
                    <option value="webp">WebP — شفاف وأصغر</option>
                  </select>
                  <button
                    onClick={() => void download()}
                    disabled={!final}
                    className="flex items-center justify-center gap-1.5 border border-ink-950/20 px-4 py-2.5 text-xs font-bold text-ink-800 transition hover:bg-ink-950 hover:text-ivory-50 disabled:opacity-40"
                  >
                    <Download size={14} /> تنزيل
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        ) : (
          <BulkStudio />
        )}
      </div>

      {brushOpen && cutout && (
        <BrushEditor
          image={cutout}
          onApply={(blob) => {
            setCutout(blob)
            setBrushOpen(false)
            setSuccess('')
          }}
          onClose={() => setBrushOpen(false)}
        />
      )}

      <div className="border border-ink-950/10 bg-white p-4 text-xs leading-6 text-ink-500">
        <b className="text-ink-700">نصائح سريعة:</b> استخدم صوراً واضحة للزجاجة على خلفية بسيطة للحصول على أفضل قص. الهامش 8% مناسب لمعظم صور المنتجات. بعد الحفظ في المتجر اضغط «نشر الآن» أعلى اللوحة.
      </div>
    </div>
  )
}

/* ---------------- UI strings ---------------- */

const UI_LABELS: Record<string, string> = {
  /* تسميات متجر رامّة بعد الريلز */
  search: 'زر البحث (الشريط العلوي)',
  blackFriday: 'الجمعة السوداء (عنوان البانر)',
  blackFridayLive: 'نص: العرض مباشرة الآن',
  exploreBlackFriday: 'زر: تصفّح العرض',
  brandSub: 'تسوّق حسب الماركة (وصف)',
  featuredSub: 'مجموعات مختارة (وصف)',
  shopByBrand: 'تسوّق حسب الماركة',
  shopByPrice: 'تسوّق حسب السعر',
  allBrands: 'زر: كل الماركات',
  viewAll: 'زر: عرض الكل',
  onSale: 'عنوان: العروض',
  newArrivals: 'عنوان: وصل حديثاً',
  bestSellers: 'عنوان: الأكثر مبيعاً',
  featured: 'عنوان: مجموعات مختارة',
  testers: 'عنوان: تسترات',
  giftSets: 'عنوان: مجموعات الهدايا',
  arabicPerfumes: 'عنوان: العطور العربية',
  nichePerfumes: 'عنوان: عطور النيش',
  under100: 'سعر: أقل من ١٠٠',
  range100150: 'سعر: ١٠٠–١٥٠',
  range150250: 'سعر: ١٥٠–٢٥٠',
  range250400: 'سعر: ٢٥٠–٤٠٠',
  over400: 'سعر: ٤٠٠ فأكثر',
  home: 'الرئيسية (قائمة)',
  collection: 'المجموعة (قائمة)',
  maison: 'الدار (قائمة)',
  services: 'الخدمات (قائمة)',
  contact: 'تواصل (قائمة)',
  shopNow: 'زر تسوّق الآن',
  all: 'كلمة: الكل',
  addToCart: 'زر: أضف إلى السلة',
  bestSeller: 'شارة: الأكثر مبيعاً',
  isNew: 'شارة: جديد',
  off: 'شارة: خصم',
  top: 'نوتة: الافتتاحية',
  heart: 'نوتة: القلب',
  base: 'نوتة: القاعدة',
  intensity: 'تسمية: التركيز',
  cart: 'عنوان السلة',
  cartEmpty: 'السلة فارغة',
  cartEmptySub: 'نص السلة الفارغة',
  shipping: 'تسمية: الشحن',
  freeShip: 'كلمة: مجاني',
  shipCalc: 'نص: يُحسب عند التأكيد',
  total: 'تسمية: الإجمالي',
  checkout: 'زر: إتمام الطلب',
  viaWA: 'زر: عبر واتساب',
  waNote: 'ملاحظة الواتساب',
  prAll: 'سعر: الكل',
  pr1: 'سعر: النطاق 1',
  pr2: 'سعر: النطاق 2',
  pr3: 'سعر: النطاق 3',
  fCat: 'فلتر: العائلة',
  fBrand: 'فلتر: الدار',
  fPrice: 'فلتر: السعر',
  install: 'زر: ثبّت التطبيق',
  installTitle: 'نافذة التثبيت: العنوان',
  installDesc: 'نافذة التثبيت: الوصف',
  installLater: 'نافذة التثبيت: لاحقاً',
  iosHow: 'خطوات آيفون (| للفصل)',
  andHow: 'خطوات أندرويد (| للفصل)',
  admin: 'رابط: لوحة التحكم',
}

function StringsTab() {
  const { data, setUI } = useSite()
  return (
    <div className="border border-ink-950/10 bg-white p-5">
      <p className="mb-4 text-xs leading-6 text-ink-500">
        كل كلمة ثابتة في الواجهة (أزرار، تسميات، شارات) بالعربية والعبرية — بما فيها عناوين أقسام المتجر بعد الريلز
        (الجمعة السوداء، الماركات، المجموعات، الأسعار، العروض…). التعديل يظهر مباشرة في المتجر وبعد النشر للزوار.
      </p>
      <div className="space-y-3">
        {Object.entries(data.ui).map(([key, v]) => (
          <LPair key={key} label={UI_LABELS[key] ?? key} value={v} onChange={(nv) => setUI({ ...data.ui, [key]: nv })} />
        ))}
      </div>
    </div>
  )
}

/* ---------------- Settings ---------------- */

function SettingsTab() {
  const { data, patchSettings, resetAll, replaceAll, remote, user, lastPublished } = useSite()
  const s = data.settings
  const fileRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLInputElement>(null)
  const [newPin, setNewPin] = useState('')

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'ashour-site-backup.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importJSON = (file: File) => {
    const r = new FileReader()
    r.onload = () => {
      try {
        const parsed = JSON.parse(String(r.result))
        if (!parsed.products || !parsed.content || !parsed.settings) throw new Error('bad')
        replaceAll(parsed)
        window.alert('تم الاستيراد بنجاح')
      } catch {
        window.alert('ملف غير صالح')
      }
    }
    r.readAsText(file)
  }

  return (
    <div className="space-y-5">
      <Card title="الهوية واللغة">
        <LPair label="اسم الموقع" value={s.siteName} onChange={(v) => patchSettings({ siteName: v })} />
        <SRow label="اللغة الافتراضية">
          <select value={s.defaultLang} onChange={(e) => patchSettings({ defaultLang: e.target.value as 'ar' | 'he' })} className={inp}>
            <option value="ar">العربية</option>
            <option value="he">עברית (العبرية)</option>
          </select>
        </SRow>
        <LPair label="العملة" value={s.currency} onChange={(v) => patchSettings({ currency: v })} />
      </Card>

      <Card title="التواصل">
        <SRow label="واتساب (دولي بدون +)">
          <input value={s.whatsapp} onChange={(e) => patchSettings({ whatsapp: e.target.value.replace(/\D/g, '') })} className={inp} dir="ltr" />
        </SRow>
        <SRow label="البريد">
          <input value={s.email} onChange={(e) => patchSettings({ email: e.target.value })} className={inp} dir="ltr" />
        </SRow>
        <SRow label="الهاتف">
          <input value={s.phone} onChange={(e) => patchSettings({ phone: e.target.value })} className={inp} dir="ltr" />
        </SRow>
        <LPair label="العنوان" value={s.address} onChange={(v) => patchSettings({ address: v })} />
      </Card>

      <Card title="شريط الإعلانات (سطر لكل رسالة)">
        <div className="grid gap-2 md:grid-cols-2">
          <textarea value={s.announcements.ar.join('\n')} onChange={(e) => patchSettings({ announcements: { ...s.announcements, ar: e.target.value.split('\n') } })} rows={4} className={inp} placeholder="العربية" />
          <textarea value={s.announcements.he.join('\n')} onChange={(e) => patchSettings({ announcements: { ...s.announcements, he: e.target.value.split('\n') } })} rows={4} dir="auto" className={inp} placeholder="עברית" />
        </div>
      </Card>

      <Card title="خلفية الواجهة">
        <SRow label="النوع">
          <select value={s.heroBg.type} onChange={(e) => patchSettings({ heroBg: { ...s.heroBg, type: e.target.value as 'video' | 'image' } })} className={inp}>
            <option value="video">فيديو</option>
            <option value="image">صورة</option>
          </select>
        </SRow>
        <SRow label="مسار الفيديو">
          <input value={s.heroBg.video} onChange={(e) => patchSettings({ heroBg: { ...s.heroBg, video: e.target.value } })} className={inp} dir="ltr" />
        </SRow>
        <SRow label="الصورة">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input value={s.heroBg.image} onChange={(e) => patchSettings({ heroBg: { ...s.heroBg, image: e.target.value } })} className={inp} dir="ltr" />
              <button onClick={() => imgRef.current?.click()} className="flex shrink-0 items-center gap-1 border border-ink-950/20 px-3 text-xs font-bold transition hover:bg-ink-950 hover:text-ivory-50">
                <Upload size={13} /> رفع
              </button>
              <input
                ref={imgRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  try {
                    const blob = await compressImage(f, 1600, 0.85)
                    if (blob.size > BIG_WARN && !(await confirmSize(blob.size, 'صورة الخلفية'))) return
                    patchSettings({ heroBg: { ...s.heroBg, image: await saveMediaSmart(blob) } })
                  } catch {
                    window.alert('تعذر رفع صورة الخلفية')
                  }
                  e.target.value = ''
                }}
              />
            </div>
            <p className="text-[11px] text-ink-500">ارفع صورة من جهازك (تُضغط تلقائياً) أو الصق مساراً مثل /images/name.webp</p>
          </div>
        </SRow>
      </Card>

      <Card title="كوبون الخصم">
        <div className="grid gap-3 sm:grid-cols-2">
          <SRow label="رمز الكوبون">
            <input
              value={s.promo?.code ?? ''}
              onChange={(e) => patchSettings({ promo: { code: e.target.value, pct: s.promo?.pct ?? 10 } })}
              className={inp}
              placeholder="مثال: ASHOUR10 (اتركه فارغاً للتعطيل)"
            />
          </SRow>
          <SRow label="نسبة الخصم ٪">
            <input
              type="number"
              min={1}
              max={90}
              value={s.promo?.pct ?? 10}
              onChange={(e) => patchSettings({ promo: { code: s.promo?.code ?? '', pct: Math.min(90, Math.max(1, Number(e.target.value) || 10)) } })}
              className={inp}
            />
          </SRow>
        </div>
        <p className="text-[11px] text-ink-500">يظهر حقل الكوبون في السلة عند تعيين رمز — ويُطبق الخصم على الإجمالي ويظهر في رسالة الواتساب.</p>
      </Card>

      <Card title="الخطوط والعرض">
        <SRow label={`حجم العناوين (${Math.round(s.fontH * 100)}٪)`}>
          <input type="range" min={0.85} max={1.25} step={0.05} value={s.fontH} onChange={(e) => patchSettings({ fontH: Number(e.target.value) })} className="w-full accent-[#8a6c2a]" />
        </SRow>
        <SRow label={`حجم النصوص (${Math.round(s.fontB * 100)}٪)`}>
          <input type="range" min={0.85} max={1.25} step={0.05} value={s.fontB} onChange={(e) => patchSettings({ fontB: Number(e.target.value) })} className="w-full accent-[#8a6c2a]" />
        </SRow>
        <SRow label="منتجات لكل صفحة">
          <input type="number" min={4} max={48} value={s.perPage} onChange={(e) => patchSettings({ perPage: Math.min(48, Math.max(4, Number(e.target.value) || 12)) })} className={inp} />
        </SRow>
      </Card>

      <Card title="الخادم والمزامنة">
        {remote ? (
          <>
            <p className="text-xs leading-6 text-ink-500">
              متصل بـ Supabase — التعديلات تُنشر بزر «نشر الآن» أعلى الصفحة وتظهر فوراً لكل الزوار، والصور والفيديو
              تُرفع إلى السحابة.
            </p>
            <SRow label="الحساب">
              <span className="text-sm text-ink-900" dir="ltr">
                {user ?? '—'}
              </span>
            </SRow>
            <SRow label="آخر نشر">
              <span className="text-sm text-ink-900">
                {lastPublished ? new Date(lastPublished).toLocaleString('ar-EG') : 'لم يُنشر بعد'}
              </span>
            </SRow>
            <SRow label="النشر التلقائي">
              <label className="flex items-center gap-2 text-sm text-ink-900">
                <input
                  type="checkbox"
                  checked={!!data.settings.autoPublish}
                  onChange={(e) => patchSettings({ autoPublish: e.target.checked })}
                  className="size-4 accent-[#8a6c2a]"
                />
                نشر تلقائي (بعد 3 ثوانٍ خلفي)
              </label>
            </SRow>
          </>
        ) : (
          <p className="text-xs leading-6 text-ink-500">
            وضع محلي: كل شيء يُحفظ في متصفحك فقط. لتفعيل النشر للزوار راجع ملف <b>SYNC.md</b> في المشروع.
          </p>
        )}
      </Card>

      <Card title="الوسائط في السحابة">
        {remote ? (
          <MediaCloudTab />
        ) : (
          <p className="text-xs leading-6 text-ink-500">
            وضع محلي: الوسائط في هذا المتصفح فقط — عند التفعيل بما في السحابة تظهر هنا قائمة الملفات.
          </p>
        )}
      </Card>

      <Card title="الأمان والنسخ">
        <div className="flex flex-wrap gap-2">
          <input value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="رمز جديد" className={`${inp} max-w-[140px] text-center tracking-[0.3em]`} />
          <button
            disabled={newPin.length < 4}
            onClick={() => {
              patchSettings({ pin: newPin })
              setNewPin('')
              window.alert('تم تغيير الرمز')
            }}
            className="bg-ink-950 px-5 py-2 text-xs font-bold text-ivory-50 transition hover:bg-gold-600 disabled:opacity-40"
          >
            تغيير الرمز
          </button>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <button onClick={exportJSON} className="flex items-center gap-1.5 border border-ink-950/20 px-4 py-2 text-xs font-bold transition hover:bg-ink-950 hover:text-ivory-50">
            <Download size={13} /> تصدير نسخة (JSON)
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 border border-ink-950/20 px-4 py-2 text-xs font-bold transition hover:bg-ink-950 hover:text-ivory-50">
            <Upload size={13} /> استيراد نسخة
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importJSON(f)
              e.target.value = ''
            }}
          />
          <button
            onClick={() => {
              if (window.confirm('إعادة كل شيء للوضع الافتراضي؟ ستفقد تعديلاتك.')) resetAll()
            }}
            className="flex items-center gap-1.5 border border-red-700/30 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-700 hover:text-white"
          >
            <RotateCcw size={13} /> استعادة الافتراضي
          </button>
        </div>
        <p className="text-[11px] leading-5 text-ink-500">
          ملاحظة: الحفظ يتم في متصفحك الحالي. لنقل التعديلات لجهاز آخر استخدم «تصدير» ثم «استيراد» هناك.
        </p>
      </Card>
    </div>
  )
}
