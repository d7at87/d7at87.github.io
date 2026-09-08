import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import type { Product } from '../cms/types'
import { useSite } from '../cms/store'
import ProductImage from './ProductImage'

interface Props {
  perfume: Product
  onSelect: (p: Product) => void
  onAdd: (id: string) => void
}

export default function PerfumeCard({ perfume: p, onSelect, onAdd }: Props) {
  const { t, L, formatPrice, catName, lang } = useSite()
  const discount = p.oldPriceNum ? Math.round((1 - p.priceNum / p.oldPriceNum) * 100) : 0

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      onClick={() => onSelect(p)}
      className="group relative cursor-pointer border hairline bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-25px_rgba(20,17,11,0.25)]"
    >
      <div className="absolute top-0 start-0 z-10 flex flex-col items-start">
        {p.isBestSeller && (
          <span className="bg-ink-950 px-3 py-1 text-[10px] font-bold tracking-widest text-ivory-50">
            {t('bestSeller')}
          </span>
        )}
        {p.isNew && (
          <span className="bg-gold-500 px-3 py-1 text-[10px] font-bold tracking-widest text-ink-950">{t('isNew')}</span>
        )}
        {discount > 0 && !p.soldOut && (
          <span className="bg-[#8f1f1f] px-3 py-1 text-[10px] font-bold tracking-widest text-white">
            {t('off')} {discount.toLocaleString('ar-EG')}٪
          </span>
        )}
        {p.soldOut && (
          <span className="bg-ink-950 px-3 py-1 text-[10px] font-bold tracking-widest text-ivory-50">
            {lang === 'ar' ? 'نفدت الكمية' : 'אזל מהמלאי'}
          </span>
        )}
      </div>

      <div className="shimmer-sweep absolute inset-0" />

      <div className="flex h-64 items-center justify-center bg-gradient-to-b from-ivory-100 via-ivory-50 to-white px-8 pt-8">
        <div className="h-full transition-transform duration-700 ease-out group-hover:scale-[1.06]">
          <ProductImage p={p} className="h-full w-auto drop-shadow-xl" />
        </div>
      </div>

      <div className="border-t hairline p-5 text-center">
        <p className="eyebrow text-ink-500">{catName(p.categoryId)}</p>
        <h3 className="mt-2 font-royal text-[22px] font-bold leading-snug text-ink-950">{L(p.name)}</h3>
        <p className="mt-1 text-[10px] tracking-[0.25em] text-ink-500/70">{p.latin}</p>
        <p className="mt-1 text-xs text-ink-500">{p.brand}</p>

        <div className="mt-3 flex items-baseline justify-center gap-2">
          <span className="text-lg font-extrabold text-ink-950">{formatPrice(p.priceNum)}</span>
          {p.oldPriceNum && (
            <span className="text-xs text-ink-500/70 line-through">{formatPrice(p.oldPriceNum)}</span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            if (!p.soldOut) onAdd(p.id)
          }}
          disabled={p.soldOut}
          className="mt-4 flex w-full items-center justify-center gap-2 border border-ink-950 py-2.5 text-[13px] font-bold tracking-wide text-ink-950 transition duration-300 hover:bg-ink-950 hover:text-ivory-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-950"
          aria-label={t('addToCart')}
        >
          <ShoppingBag size={15} /> {t('addToCart')}
        </button>
      </div>
    </motion.article>
  )
}
