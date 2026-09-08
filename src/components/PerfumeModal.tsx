import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Droplets, Flower2, Gem, Minus, Mountain, Plus, ShoppingBag, X } from 'lucide-react'
import type { Product } from '../cms/types'
import { useSite } from '../cms/store'
import ProductImage from './ProductImage'

interface Props {
  perfume: Product | null
  onClose: () => void
  onAdd: (id: string, qty: number) => void
}

export default function PerfumeModal({ perfume, onClose, onAdd }: Props) {
  const { t, L, formatPrice, catName, lang } = useSite()
  const [qty, setQty] = useState(1)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = perfume ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [perfume])

  useEffect(() => {
    setQty(1)
  }, [perfume?.id])

  const rows = perfume
    ? [
        { title: t('top'), icon: Droplets, items: perfume.notes[lang].top },
        { title: t('heart'), icon: Flower2, items: perfume.notes[lang].heart },
        { title: t('base'), icon: Mountain, items: perfume.notes[lang].base },
      ]
    : []

  return (
    <AnimatePresence>
      {perfume && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink-950/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl overflow-hidden border border-ink-950/10 bg-ivory-50 shadow-2xl"
          >
            <div
              className="pointer-events-none absolute -top-32 -start-32 size-96 rounded-full opacity-20 blur-[120px]"
              style={{ background: perfume.colors.accent }}
            />
            <button
              onClick={onClose}
              aria-label="close"
              className="absolute top-4 end-4 z-10 grid size-10 place-items-center bg-white text-ink-700 ring-1 ring-ink-950/15 transition hover:bg-ink-950 hover:text-ivory-50"
            >
              <X size={18} />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="relative flex items-center justify-center bg-gradient-to-b from-ivory-100 to-ivory-50 p-10">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-52"
                >
                  <ProductImage p={perfume} className="w-full drop-shadow-2xl" />
                </motion.div>
              </div>

              <div className="p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-ink-950 px-3 py-1 text-[11px] font-bold tracking-widest text-ivory-50">
                    {catName(perfume.categoryId)}
                  </span>
                  <span className="px-3 py-1 text-[11px] text-ink-700 ring-1 ring-ink-950/15">{perfume.brand}</span>
                  <span className="px-3 py-1 text-[11px] text-ink-700 ring-1 ring-ink-950/15">
                    {L(perfume.longevity)}
                  </span>
                </div>

                <h3 className="mt-4 font-royal text-4xl font-bold text-ink-950">{L(perfume.name)}</h3>
                <p className="eyebrow mt-1 text-ink-500">{perfume.latin}</p>
                <p className="mt-4 text-sm leading-7 text-ink-700/75">{L(perfume.description)}</p>

                <div className="mt-6 space-y-3">
                  {rows.map((row, i) => (
                    <motion.div
                      key={row.title}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.08 }}
                      className="flex items-start gap-3 bg-white p-3 ring-1 ring-ink-950/10"
                    >
                      <span className="grid size-10 shrink-0 place-items-center bg-ink-950/[0.04] text-gold-600 ring-1 ring-ink-950/10">
                        <row.icon size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-ink-950">{row.title}</p>
                        <p className="text-xs text-ink-700/60">{row.items.join(' · ')}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between border-t hairline pt-5">
                  <div>
                    <p className="eyebrow mb-1 text-ink-500">{t('intensity')}</p>
                    <span className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Gem
                          key={i}
                          size={14}
                          className={i < perfume.intensity ? 'fill-gold-500/70 text-gold-600' : 'text-ink-950/15'}
                        />
                      ))}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    {perfume.oldPriceNum && (
                      <span className="text-sm text-ink-500/70 line-through">{formatPrice(perfume.oldPriceNum)}</span>
                    )}
                    <span className="font-royal text-3xl font-bold text-ink-950">{formatPrice(perfume.priceNum)}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white p-1.5 ring-1 ring-ink-950/15">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      aria-label="minus"
                      className="grid size-8 place-items-center text-ink-700 transition hover:bg-ink-950/5"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-6 text-center font-bold text-ink-950">{qty.toLocaleString('ar-EG')}</span>
                    <button
                      onClick={() => setQty(Math.min(9, qty + 1))}
                      aria-label="plus"
                      className="grid size-8 place-items-center text-ink-700 transition hover:bg-ink-950/5"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => onAdd(perfume.id, qty)}
                    disabled={perfume.soldOut}
                    className="flex flex-1 items-center justify-center gap-2 bg-ink-950 py-3.5 text-sm font-bold tracking-wide text-ivory-50 transition hover:bg-gold-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ShoppingBag size={17} /> {t('addToCart')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
