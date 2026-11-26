import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { useSite } from '../../cms/store'
import type { Product } from '../../cms/types'
import { PRICE_RANGES, brandHref, categoryHref, pageTitle, priceHref, productsFor, type PageSpec } from '../../catalog'
import { RamCard } from '../rammahs/RamParts'
import { lb } from '../../cms/labels'

interface Props {
  spec: PageSpec
  onSelect: (p: Product) => void
  onAdd: (id: string) => void
}

type Sort = 'default' | 'asc' | 'desc' | 'name'

function initialQuery(): string {
  try {
    const q = sessionStorage.getItem('ashour-search') ?? ''
    sessionStorage.removeItem('ashour-search')
    return q
  } catch {
    return ''
  }
}

/** بحث يتجاهل التشكيل ويوحّد الألف والياء والتاء المربوطة (عربي/عبري/إنجليزي). */
const norm = (s: string) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')

export default function CatalogPage({ spec, onSelect, onAdd }: Props) {
  const { data, lang, L } = useSite()
  const [query, setQuery] = useState(initialQuery)
  const searchRef = useRef<HTMLInputElement>(null)
  const [sort, setSort] = useState<Sort>('default')
  const [visible, setVisible] = useState(12)
  const perPage = Math.max(4, data.settings.perPage || 12)

  useEffect(() => {
    setVisible(perPage)
  }, [spec.scope, spec.value, query, sort, perPage])

  useEffect(() => {
    let focus = false
    try {
      focus = sessionStorage.getItem('ashour-focus-search') === '1'
      sessionStorage.removeItem('ashour-focus-search')
    } catch {
      /* ignore */
    }
    if (focus) window.setTimeout(() => searchRef.current?.focus(), 120)
  }, [])

  const title = pageTitle(spec, data, lang)
  const list = useMemo(() => {
    const q = norm(query)
    const filtered = productsFor(data, spec).filter((p) => {
      if (!q) return true
      return (
        norm(p.name.ar).includes(q) ||
        norm(p.name.he).includes(q) ||
        norm(p.latin).includes(q) ||
        norm(p.brand).includes(q)
      )
    })
    if (sort === 'asc') return [...filtered].sort((a, b) => a.priceNum - b.priceNum)
    if (sort === 'desc') return [...filtered].sort((a, b) => b.priceNum - a.priceNum)
    if (sort === 'name') return [...filtered].sort((a, b) => L(a.name).localeCompare(L(b.name), lang))
    return filtered
  }, [data, spec, query, sort, lang, L])

  const shown = list.slice(0, visible)
  const brands = data.brands.filter((b) => data.products.some((p) => !p.hidden && p.brand === b))

  return (
    <div className="rm min-h-screen px-6 pb-20 pt-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-2 text-[11px] text-[color:var(--rm-muted)]">
          <a href="#/" className="rm-link">{lb('backHome', lang)}</a>
          <span>/</span>
          <span className="text-ink-950">{title}</span>
        </div>

        <div className="mt-6 border-b border-[color:var(--rm-border)] pb-8 text-center">
          <p className="rm-eyebrow text-[color:var(--rm-gold)]">{L(data.content.collection.eyebrow)}</p>
          <h1 className="rm-heading mt-3 text-3xl text-ink-950 sm:text-4xl">{title}</h1>
          <div className="mx-auto mt-4 h-px w-16 bg-[color:var(--rm-gold)]" />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-8">
            <div>
              <h2 className="rm-eyebrow text-ink-950">{lb('categories', lang)}</h2>
              <div className="mt-4 flex flex-col items-start gap-2">
                <a href="#/collections" className={`text-sm ${spec.scope === 'all' ? 'font-bold text-[color:var(--rm-gold)]' : 'text-[color:var(--rm-muted)] hover:text-ink-950'}`}>
                  {lb('allProducts', lang)}
                </a>
                {data.categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={categoryHref(cat.id)}
                    className={`text-sm ${spec.scope === 'category' && spec.value === cat.id ? 'font-bold text-[color:var(--rm-gold)]' : 'text-[color:var(--rm-muted)] hover:text-ink-950'}`}
                  >
                    {L(cat.name)}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h2 className="rm-eyebrow text-ink-950">{lb('brands', lang)}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {brands.map((b) => (
                  <a
                    key={b}
                    href={brandHref(b)}
                    dir="ltr"
                    className={`border px-2.5 py-1 text-[10px] ${spec.scope === 'brand' && spec.value === b ? 'border-[color:var(--rm-gold)] bg-[color:var(--rm-soft)] text-ink-950' : 'border-[color:var(--rm-border)] text-[color:var(--rm-muted)] hover:border-[color:var(--rm-gold)]'}`}
                  >
                    {b}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h2 className="rm-eyebrow text-ink-950">{lb('price', lang)}</h2>
              <div className="mt-4 flex flex-col items-start gap-2">
                <a href="#/price/sale" className={`text-sm ${spec.scope === 'sale' ? 'font-bold text-[color:var(--rm-gold)]' : 'text-[color:var(--rm-muted)] hover:text-ink-950'}`}>
                  {lb('onSale', lang)}
                </a>
                {PRICE_RANGES.map((r) => (
                  <a
                    key={r.id}
                    href={priceHref(r.id)}
                    className={`text-sm ${spec.scope === 'price' && spec.value === r.id ? 'font-bold text-[color:var(--rm-gold)]' : 'text-[color:var(--rm-muted)] hover:text-ink-950'}`}
                  >
                    {lb(r.labelKey, lang)}
                  </a>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="flex flex-col gap-3 border-b border-[color:var(--rm-border)] pb-5 sm:flex-row">
              <div className="relative flex-1">
                <Search size={16} className="absolute top-1/2 start-3 -translate-y-1/2 text-[color:var(--rm-muted)]" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={lb('searchProducts', lang)}
                  className="rm-input w-full py-2.5 ps-10 pe-3 text-sm"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                aria-label={lb('sort', lang)}
                className="border border-[color:var(--rm-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[color:var(--rm-gold)]"
              >
                <option value="default">{lb('sortDefault', lang)}</option>
                <option value="asc">{lb('priceAsc', lang)}</option>
                <option value="desc">{lb('priceDesc', lang)}</option>
                <option value="name">{lb('nameAZ', lang)}</option>
              </select>
            </div>

            <p className="rm-eyebrow mt-6 text-[10px] text-[color:var(--rm-muted)]">
              {lb('showing', lang)} {Math.min(visible, list.length)} {lb('of', lang)} {list.length} {lb('results', lang)}
            </p>

            {list.length === 0 ? (
              <div className="mt-14 text-center">
                <p className="rm-heading text-xl text-ink-950">{lb('noResults', lang)}</p>
                <p className="mt-2 text-sm text-[color:var(--rm-muted)]">{lb('noResultsSub', lang)}</p>
                <button
                  onClick={() => setQuery('')}
                  className="mt-5 border border-ink-950 px-6 py-2 text-xs font-bold tracking-[0.16em] text-ink-950 transition hover:bg-ink-950 hover:text-white"
                >
                  {lb('clear', lang)}
                </button>
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
                  {shown.map((p) => (
                    <RamCard key={p.id} perfume={p} onSelect={onSelect} onAdd={onAdd} />
                  ))}
                </div>
                {visible < list.length && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={() => setVisible((v) => v + perPage)}
                      className="bg-[color:var(--rm-ink)] px-10 py-3 text-xs font-bold tracking-[0.18em] text-white transition hover:bg-[color:var(--rm-gold)]"
                    >
                      {lb('loadMore', lang)}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
