import { useRef, useState } from 'react'
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
  ArrowUp,
  ArrowDown,
  Copy,
  ImagePlus,
} from 'lucide-react'
import type { Category, Content, LText, Product } from '../cms/types'
import { useSite } from '../cms/store'
import { compressImage, saveMedia, useMediaURL } from '../cms/media'
import BottleSVG from '../components/BottleSVG'

const inp =
  'w-full bg-white px-3 py-2 text-sm text-ink-900 outline-none ring-1 ring-ink-950/15 transition placeholder:text-ink-500/40 focus:ring-gold-500'

function LPair({ label, value, onChange }: { label: string; value: LText; onChange: (v: LText) => void }) {
  return (
    <div className="grid items-start gap-2 md:grid-cols-[150px_1fr_1fr]">
      <span className="pt-2 text-xs font-bold text-ink-700">{label}</span>
      <input value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} placeholder="العربية" className={inp} />
      <input
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

type Tab = 'products' | 'cats' | 'brands' | 'videos' | 'content' | 'strings' | 'settings'

const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: 'products', label: 'المنتجات', icon: Package },
  { id: 'cats', label: 'التصنيفات', icon: Layers },
  { id: 'brands', label: 'الدور', icon: Store },
  { id: 'videos', label: 'الفيديوهات', icon: Clapperboard },
  { id: 'content', label: 'المحتوى والنصوص', icon: Type },
  { id: 'strings', label: 'نصوص الواجهة', icon: Languages },
  { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
]

export default function Admin() {
  const { data } = useSite()
  const [authed, setAuthed] = useState(() => {
    try {
      return sessionStorage.getItem('ashour-admin') === '1'
    } catch {
      return false
    }
  })
  const [pin, setPin] = useState('')
  const [pinErr, setPinErr] = useState(false)
  const [tab, setTab] = useState<Tab>('products')

  if (!authed) {
    return (
      <div className="grid min-h-screen place-items-center bg-ivory-100 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (pin === data.settings.pin) {
              try {
                sessionStorage.setItem('ashour-admin', '1')
              } catch {
                /* ignore */
              }
              setAuthed(true)
            } else setPinErr(true)
          }}
          className="w-full max-w-sm border border-ink-950/10 bg-white p-8 text-center shadow-xl"
        >
          <p className="font-royal text-3xl font-bold text-ink-950">لوحة التحكم</p>
          <p className="mt-2 text-sm text-ink-500">أدخل رمز الدخول (الافتراضي 1234)</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className={`${inp} mt-5 text-center tracking-[0.5em]`}
            placeholder="••••"
            autoFocus
          />
          {pinErr && <p className="mt-2 text-xs text-red-700">رمز خاطئ</p>}
          <button className="mt-4 w-full bg-ink-950 py-3 text-sm font-bold text-ivory-50 transition hover:bg-gold-600">
            دخول
          </button>
          <a href="#" className="mt-4 inline-block text-xs text-ink-500 underline">
            عودة للموقع
          </a>
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
                try {
                  sessionStorage.removeItem('ashour-admin')
                } catch {
                  /* ignore */
                }
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

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        {tab === 'products' && <ProductsTab />}
        {tab === 'cats' && <CatsTab />}
        {tab === 'brands' && <BrandsTab />}
        {tab === 'videos' && <VideosTab />}
        {tab === 'content' && <ContentTab />}
        {tab === 'strings' && <StringsTab />}
        {tab === 'settings' && <SettingsTab key={data.settings.pin} />}
      </div>
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
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في المنتجات..." className={`${inp} max-w-xs`} />
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
                        const id = await saveMedia(blob)
                        set('image', id)
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
              </div>
            </div>
            <p className="mt-2 text-[11px] text-ink-500">تُضغط الصورة تلقائياً وتُحفظ في جهازك — تظهر بدل الزجاجة المرسومة.</p>
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

function CatsTab() {
  const { data, saveCategory, deleteCategory } = useSite()
  const [showAdd, setShowAdd] = useState(false)
  const [draft, setDraft] = useState({ name: { ar: '', he: '' }, desc: { ar: '', he: '' }, color: '#d4a24c' })

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
          <button
            disabled={!draft.name.ar.trim()}
            onClick={() => {
              saveCategory({ id: `c-${Date.now()}`, ...draft })
              setDraft({ name: { ar: '', he: '' }, desc: { ar: '', he: '' }, color: '#d4a24c' })
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
        </div>
      ))}
    </div>
  )
}

/* ---------------- Brands ---------------- */

function BrandsTab() {
  const { data, setBrands } = useSite()
  const [name, setName] = useState('')

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
          <li key={b} className="flex items-center justify-between py-3">
            <div>
              <p className="font-bold text-ink-950">{b}</p>
              <p className="text-xs text-ink-500">{used(b).toLocaleString('ar-EG')} منتج</p>
            </div>
            <button
              onClick={() => {
                if (used(b) > 0) {
                  window.alert(`لا يمكن الحذف: يوجد ${used(b)} منتج بهذه الدار.`)
                  return
                }
                if (window.confirm(`حذف «${b}»؟`)) setBrands(data.brands.filter((x) => x !== b))
              }}
              className="grid size-8 place-items-center text-red-700 ring-1 ring-red-700/20 transition hover:bg-red-700 hover:text-white"
            >
              <Trash2 size={14} />
            </button>
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
      return await saveMedia(f)
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
                    const blob = await compressImage(f, 540, 0.75)
                    setDraft({ ...draft, poster: await saveMedia(blob) })
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

      <Card title="بلاطات العائلات + الأكثر مبيعاً + الفيديوهات + المجموعة">
        <LPair label="عائلات: علوي" value={c.families.eyebrow} onChange={(v) => patch((x) => (x.families.eyebrow = v))} />
        <LPair label="عائلات: عنوان" value={c.families.title1} onChange={(v) => patch((x) => (x.families.title1 = v))} />
        <LPair label="عائلات: عنوان مميز" value={c.families.title2} onChange={(v) => patch((x) => (x.families.title2 = v))} />
        <LPair label="الأكثر: علوي" value={c.best.eyebrow} onChange={(v) => patch((x) => (x.best.eyebrow = v))} />
        <LPair label="الأكثر: عنوان" value={c.best.title1} onChange={(v) => patch((x) => (x.best.title1 = v))} />
        <LPair label="الأكثر: مميز" value={c.best.title2} onChange={(v) => patch((x) => (x.best.title2 = v))} />
        <LPair label="الأكثر: وصف" value={c.best.sub} onChange={(v) => patch((x) => (x.best.sub = v))} />
        <LPair label="الفيديو: علوي" value={c.reels.eyebrow} onChange={(v) => patch((x) => (x.reels.eyebrow = v))} />
        <LPair label="الفيديو: عنوان" value={c.reels.title1} onChange={(v) => patch((x) => (x.reels.title1 = v))} />
        <LPair label="الفيديو: مميز" value={c.reels.title2} onChange={(v) => patch((x) => (x.reels.title2 = v))} />
        <LPair label="المجموعة: علوي" value={c.collection.eyebrow} onChange={(v) => patch((x) => (x.collection.eyebrow = v))} />
        <LPair label="المجموعة: عنوان" value={c.collection.title1} onChange={(v) => patch((x) => (x.collection.title1 = v))} />
        <LPair label="المجموعة: مميز" value={c.collection.title2} onChange={(v) => patch((x) => (x.collection.title2 = v))} />
        <LPair label="المجموعة: وصف" value={c.collection.sub} onChange={(v) => patch((x) => (x.collection.sub = v))} />
      </Card>

      <Card title="العروض (3 بطاقات)">
        <LPair label="علوي" value={c.offers.eyebrow} onChange={(v) => patch((x) => (x.offers.eyebrow = v))} />
        <LPair label="عنوان" value={c.offers.title1} onChange={(v) => patch((x) => (x.offers.title1 = v))} />
        <LPair label="مميز" value={c.offers.title2} onChange={(v) => patch((x) => (x.offers.title2 = v))} />
        {c.offers.items.map((it, i) => (
          <div key={i} className="space-y-2 border border-ink-950/10 bg-ivory-50 p-3">
            <p className="text-xs font-black text-gold-600">العرض {i + 1}</p>
            <LPair label="العنوان" value={it} onChange={(v) => patch((x) => (x.offers.items[i] = { ...x.offers.items[i], ...v }))} />
            <LPair label="الوصف" value={it.desc} onChange={(v) => patch((x) => (x.offers.items[i].desc = v))} />
            <LPair label="الزر" value={it.cta} onChange={(v) => patch((x) => (x.offers.items[i].cta = v))} />
          </div>
        ))}
      </Card>

      <Card title="الدار + المراحل + الأرقام">
        <LPair label="علوي" value={c.maison.eyebrow} onChange={(v) => patch((x) => (x.maison.eyebrow = v))} />
        <LPair label="عنوان" value={c.maison.title1} onChange={(v) => patch((x) => (x.maison.title1 = v))} />
        <LPair label="مميز" value={c.maison.title2} onChange={(v) => patch((x) => (x.maison.title2 = v))} />
        <LPair label="الوصف" value={c.maison.sub} onChange={(v) => patch((x) => (x.maison.sub = v))} />
        <LPair label="عنوان المراحل" value={c.maison.craftTitle} onChange={(v) => patch((x) => (x.maison.craftTitle = v))} />
        {c.maison.steps.map((st, i) => (
          <div key={i} className="space-y-2 border border-ink-950/10 bg-ivory-50 p-3">
            <p className="text-xs font-black text-gold-600">المرحلة {i + 1}</p>
            <LPair label="العنوان" value={st} onChange={(v) => patch((x) => (x.maison.steps[i] = { ...x.maison.steps[i], ...v }))} />
            <LPair label="الوصف" value={st.desc} onChange={(v) => patch((x) => (x.maison.steps[i].desc = v))} />
          </div>
        ))}
        {c.maison.numbers.map((n, i) => (
          <div key={i} className="space-y-2 border border-ink-950/10 bg-ivory-50 p-3">
            <p className="text-xs font-black text-gold-600">الرقم {i + 1}</p>
            <LPair label="القيمة" value={n.value} onChange={(v) => patch((x) => (x.maison.numbers[i].value = v))} />
            <LPair label="التسمية" value={n.label} onChange={(v) => patch((x) => (x.maison.numbers[i].label = v))} />
          </div>
        ))}
      </Card>

      <Card title="الخدمات (3) + الوعود (4) + الإحصائيات (3)">
        {c.services.items.map((sv, i) => (
          <div key={i} className="space-y-2 border border-ink-950/10 bg-ivory-50 p-3">
            <p className="text-xs font-black text-gold-600">الخدمة {i + 1}</p>
            <LPair label="العنوان" value={sv} onChange={(v) => patch((x) => (x.services.items[i] = { ...x.services.items[i], ...v }))} />
            <LPair label="الوصف" value={sv.desc} onChange={(v) => patch((x) => (x.services.items[i].desc = v))} />
            <LPair label="الزر" value={sv.cta} onChange={(v) => patch((x) => (x.services.items[i].cta = v))} />
          </div>
        ))}
        {c.promises.items.map((pr, i) => (
          <div key={i} className="space-y-2 border border-ink-950/10 bg-ivory-50 p-3">
            <p className="text-xs font-black text-gold-600">الوعد {i + 1}</p>
            <LPair label="العنوان" value={pr.title} onChange={(v) => patch((x) => (x.promises.items[i].title = v))} />
            <LPair label="الوصف" value={pr.desc} onChange={(v) => patch((x) => (x.promises.items[i].desc = v))} />
          </div>
        ))}
        {c.stats.items.map((st, i) => (
          <div key={i} className="space-y-2 border border-ink-950/10 bg-ivory-50 p-3">
            <p className="text-xs font-black text-gold-600">إحصائية {i + 1}</p>
            <LPair label="العنوان" value={st.title} onChange={(v) => patch((x) => (x.stats.items[i].title = v))} />
            <LPair label="الوصف" value={st.desc} onChange={(v) => patch((x) => (x.stats.items[i].desc = v))} />
          </div>
        ))}
      </Card>

      <Card title="الفوتر">
        <LPair label="نبذة" value={c.footer.about} onChange={(v) => patch((x) => (x.footer.about = v))} />
        <LPair label="عنوان النشرة" value={c.footer.newsTitle} onChange={(v) => patch((x) => (x.footer.newsTitle = v))} />
        <LPair label="الحقوق" value={c.footer.rights} onChange={(v) => patch((x) => (x.footer.rights = v))} />
      </Card>
    </div>
  )
}

/* ---------------- UI strings ---------------- */

const UI_LABELS: Record<string, string> = {
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
      <p className="mb-4 text-xs leading-6 text-ink-500">كل كلمة ثابتة في الواجهة (أزرار، تسميات، شارات) بالعربية والعبرية.</p>
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
  const { data, patchSettings, resetAll, replaceAll } = useSite()
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
                  const blob = await compressImage(f, 1600, 0.85)
                  patchSettings({ heroBg: { ...s.heroBg, image: await saveMedia(blob) } })
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
