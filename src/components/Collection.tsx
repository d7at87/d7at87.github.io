import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Award, Clock3, Gem, Search } from 'lucide-react'
import type { Product } from '../cms/types'
import { useSite } from '../cms/store'
import PerfumeCard from './PerfumeCard'

interface Props {
  onSelect: (p: Product) => void
  onAdd: (id: string) => void
  filterId: string
  setFilterId: (id: string) => void
}

const PRICE_TESTS = [() => true, (n: number) => n < 350, (n: number) => n >= 350 && n <= 450, (n: number) => n > 450]

function Chip({
  id,
  active,
  onClick,
  children,
}: {
  id: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-1.5 text-xs transition ${
        active ? '' : 'border hairline text-ink-700/70 hover:border-gold-500'
      }`}
    >
      {active && (
        <motion.span
          layoutId={id}
          className="absolute inset-0 bg-ink-950"
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        />
      )}
      <span className={`relative z-10 ${active ? 'font-bold text-ivory-50' : ''}`}>{children}</span>
    </button>
  )
}

export default function Collection({ onSelect, onAdd, filterId, setFilterId }: Props) {
  const { t, L, data } = useSite()
  const c = data.content.collection
  const perPage = Math.max(4, data.settings.perPage || 12)

  const [brand, setBrand] = useState('all')
  const [priceIdx, setPriceIdx] = useState(0)
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(perPage)

  useEffect(() => {
    setVisible(perPage)
  }, [filterId, brand, priceIdx, query, perPage])

  const priceLabels = [t('prAll'), t('pr1'), t('pr2'), t('pr3')]

  const list = useMemo(
    () =>
      data.products
        .filter((p) => !p.hidden)
        .filter((p) => filterId === 'all' || p.categoryId === filterId)
        .filter((p) => brand === 'all' || p.brand === brand)
        .filter((p) => PRICE_TESTS[priceIdx](p.priceNum))
        .filter((p) => {
          const q = query.trim().toLowerCase()
          if (!q) return true
          return (
            p.name.ar.includes(query.trim()) ||
            p.name.he.includes(query.trim()) ||
            p.latin.toLowerCase().includes(q) ||
            p.brand.includes(query.trim())
          )
        }),
    [data.products, filterId, brand, priceIdx, query],
  )

  const shown = list.slice(0, visible)
  const statIcons = [Gem, Clock3, Award]

  return (
    <section id="collection" className="relative mx-auto max-w-7xl scroll-mt-24 px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="eyebrow text-gold-600">{L(c.eyebrow)}</p>
        <h2 className="mt-4 font-royal text-5xl font-bold text-ink-950 lg:text-6xl">
          {L(c.title1)} <span className="text-gold-gradient">{L(c.title2)}</span>
        </h2>
        <div className="mx-auto mt-5 h-px w-20 bg-gold-500" />
        <p className="mx-auto mt-4 max-w-xl leading-7 text-ink-700/70">{L(c.sub)}</p>
      </motion.div>

      <div className="my-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {data.content.stats.items.map((s, i) => {
          const Icon = statIcons[i % statIcons.length]
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="panel flex items-center gap-4 p-5"
            >
              <span className="grid size-12 shrink-0 place-items-center bg-ink-950/[0.04] text-gold-600 ring-1 ring-ink-950/10">
                <Icon size={22} />
              </span>
              <div>
                <p className="font-bold text-ink-950">{L(s.title)}</p>
                <p className="text-sm text-ink-700/60">{L(s.desc)}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="panel p-5"
      >
        <div className="relative">
          <Search size={18} className="absolute top-1/2 start-4 -translate-y-1/2 text-ink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={L(c.searchPh)}
            className="w-full bg-ivory-100 py-3 pe-4 ps-11 text-sm text-ink-900 outline-none ring-1 ring-ink-950/10 transition placeholder:text-ink-500/60 focus:ring-gold-500"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="eyebrow me-1 text-ink-500">{t('fCat')}</span>
          <Chip id="chip-cat" active={filterId === 'all'} onClick={() => setFilterId('all')}>
            {t('all')}
          </Chip>
          {data.categories.map((cat) => (
            <Chip key={cat.id} id="chip-cat" active={filterId === cat.id} onClick={() => setFilterId(cat.id)}>
              {L(cat.name)}
            </Chip>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="eyebrow me-1 text-ink-500">{t('fBrand')}</span>
          <Chip id="chip-brand" active={brand === 'all'} onClick={() => setBrand('all')}>
            {t('all')}
          </Chip>
          {data.brands.map((b) => (
            <Chip key={b} id="chip-brand" active={brand === b} onClick={() => setBrand(b)}>
              {b}
            </Chip>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="eyebrow me-1 text-ink-500">{t('fPrice')}</span>
          {priceLabels.map((label, i) => (
            <Chip key={label} id="chip-price" active={priceIdx === i} onClick={() => setPriceIdx(i)}>
              {label}
            </Chip>
          ))}
        </div>
      </motion.div>

      {list.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-royal text-2xl font-bold text-ink-700">{L(c.noRes)}</p>
          <p className="mt-2 text-sm text-ink-500">{L(c.noResSub)}</p>
        </div>
      ) : (
        <>
          <p className="mt-10 text-center text-xs text-ink-500">
            {L(c.showing)} {Math.min(visible, list.length).toLocaleString('ar-EG')} {L(c.of)}{' '}
            {list.length.toLocaleString('ar-EG')}
          </p>
          <motion.div layout className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {shown.map((p) => (
                <PerfumeCard key={p.id} perfume={p} onSelect={onSelect} onAdd={onAdd} />
              ))}
            </AnimatePresence>
          </motion.div>
          {visible < list.length && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setVisible((v) => v + perPage)}
                className="bg-ink-950 px-10 py-3.5 text-sm font-bold tracking-wide text-ivory-50 transition hover:bg-gold-600"
              >
                {L(c.loadMore)}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
