import { Children, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { ArrowLeft, Check, Plus } from 'lucide-react'
import { useSite } from '../../cms/store'
import type { Product } from '../../cms/types'
import ProductImage from '../ProductImage'

/* ------------------------------------------------------------------ */
/* Shared storefront primitives — values copied from the source theme. */
/* ------------------------------------------------------------------ */

export type StoreLayout = 'rail' | 'grid'

/** يقرأ إعدادات العرض والإظهار من لوحة التحكم (تبويب «عرض الأقسام»). */
export function useStoreSection(key: string, defaultMode: StoreLayout = 'grid') {
  const { data } = useSite()
  const layouts = data.settings.layouts ?? {}
  const visibility = data.settings.visibility ?? {}
  return {
    visible: visibility[key] !== false,
    mode: (layouts[key] ?? defaultMode) as StoreLayout,
  }
}

/** شبكة 4 أعمدة أو صف جانبي قابل للتمرير — حسب اختيار المدير. */
export function RamLayout({ mode, children }: { mode: StoreLayout; children: ReactNode }) {
  if (mode === 'grid') {
    return <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">{children}</div>
  }
  return (
    <div className="rm-scroll-x">
      {Children.map(children, (child, i) => (
        <div key={i} className="w-[44vw] shrink-0 sm:w-44 lg:w-48">
          {child}
        </div>
      ))}
    </div>
  )
}

export function RamTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h2 className="rm-title">{title}</h2>
      {sub && <p className="rm-subtitle">{sub}</p>}
    </div>
  )
}

export function RamDivider() {
  return (
    <div className="rm-container">
      <div className="rm-rule" />
    </div>
  )
}

export function RamGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">{children}</div>
}

export function RamViewAll({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-10 text-center">
      <a href={href} className="rm-btn">
        {label}
      </a>
    </div>
  )
}

export function RamOutlineButton({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-8 flex justify-center">
      <a href={href} className="rm-btn rm-btn-outline min-h-[2.875rem] gap-2.5 px-7">
        <span>{label}</span>
        <ArrowLeft size={15} className="rtl:rotate-0 ltr:rotate-180" />
      </a>
    </div>
  )
}

interface CardProps {
  perfume: Product
  onSelect: (p: Product) => void
  onAdd: (id: string) => void
  badge?: string
  badgeClass?: string
}

export function RamCard({ perfume: p, onSelect, onAdd, badge, badgeClass }: CardProps) {
  const { L, lang, formatPrice, t } = useSite()
  const [added, setAdded] = useState(false)
  const timer = useRef<number | null>(null)
  const discount = p.oldPriceNum ? Math.round((1 - p.priceNum / p.oldPriceNum) * 100) : 0

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  const add = (e: MouseEvent) => {
    e.stopPropagation()
    if (p.soldOut) return
    onAdd(p.id)
    setAdded(true)
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1400)
  }

  const badges: { label: string; cls: string }[] = []
  if (badge) badges.push({ label: badge, cls: badgeClass ?? 'rm-badge-sale' })
  if (p.isNew) badges.push({ label: t('isNew'), cls: 'rm-badge-new' })
  if (p.soldOut) badges.push({ label: lang === 'ar' ? 'نفدت الكمية' : 'אזל', cls: 'rm-badge-sold' })
  else if (!badge && discount > 0) badges.push({ label: lang === 'ar' ? 'تخفيض' : 'Sale', cls: 'rm-badge-sale' })

  return (
    <article className="rm-card group relative cursor-pointer" onClick={() => onSelect(p)}>
      <div className="rm-card-img p-4">
        <div className="absolute top-2 end-2 z-10 flex flex-col items-end gap-1">
          {badges.map((b) => (
            <span key={b.label} className={`rm-badge ${b.cls}`}>
              {b.label}
            </span>
          ))}
        </div>

        <ProductImage p={p} className="max-h-[84%] max-w-[84%]" />

        <button onClick={add} disabled={p.soldOut} aria-label={t('addToCart')} className="rm-quick">
          {added ? <Check size={14} /> : <Plus size={16} />}
        </button>
      </div>

      <div className="mt-2 px-1 text-center">
        <h3 className="rm-card-title">{L(p.name)}</h3>
        <div className="mt-1 flex flex-wrap items-baseline justify-center gap-1.5">
          {p.oldPriceNum && <span className="rm-price-old">{formatPrice(p.oldPriceNum)}</span>}
          <span className="rm-price">{formatPrice(p.priceNum)}</span>
        </div>
      </div>
    </article>
  )
}
