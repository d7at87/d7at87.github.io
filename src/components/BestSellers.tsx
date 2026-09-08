import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import type { Product } from '../cms/types'
import { useSite } from '../cms/store'
import PerfumeCard from './PerfumeCard'

interface Props {
  onSelect: (p: Product) => void
  onAdd: (id: string) => void
}

export default function BestSellers({ onSelect, onAdd }: Props) {
  const { L, data } = useSite()
  const b = data.content.best
  const list = data.products.filter((p) => p.isBestSeller && !p.hidden)
  if (list.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-6 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="eyebrow inline-flex items-center gap-2 text-gold-600">
          <Flame size={13} /> {L(b.eyebrow)}
        </p>
        <h2 className="mt-4 font-royal text-5xl font-bold text-ink-950 lg:text-6xl">
          {L(b.title1)} <span className="text-gold-gradient">{L(b.title2)}</span>
        </h2>
        <div className="mx-auto mt-5 h-px w-20 bg-gold-500" />
        <p className="mx-auto mt-4 max-w-md leading-7 text-ink-700/70">{L(b.sub)}</p>
      </motion.div>

      <div className="scrollbar-hide mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
        {list.map((p) => (
          <div key={p.id} className="w-72 shrink-0 snap-start">
            <PerfumeCard perfume={p} onSelect={onSelect} onAdd={onAdd} />
          </div>
        ))}
      </div>
    </section>
  )
}
