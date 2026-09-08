import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useSite } from '../cms/store'
import BottleSVG from './BottleSVG'

interface Props {
  onPick: (id: string) => void
}

export default function FamilyTiles({ onPick }: Props) {
  const { L, data } = useSite()
  const f = data.content.families

  const count = (id: string) => data.products.filter((p) => p.categoryId === id && !p.hidden).length

  return (
    <section className="mx-auto max-w-7xl px-6 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="eyebrow text-gold-600">{L(f.eyebrow)}</p>
        <h2 className="mt-4 font-royal text-5xl font-bold text-ink-950 lg:text-6xl">
          {L(f.title1)} <span className="text-gold-gradient">{L(f.title2)}</span>
        </h2>
        <div className="mx-auto mt-5 h-px w-20 bg-gold-500" />
      </motion.div>

      <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {data.categories.map((cat, i) => (
          <motion.button
            key={cat.id}
            onClick={() => onPick(cat.id)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 4) * 0.08 }}
            className="group relative overflow-hidden border hairline bg-white p-6 text-center transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-25px_rgba(20,17,11,0.25)]"
          >
            <div className="pointer-events-none absolute -top-10 left-1/2 size-40 -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl transition group-hover:bg-gold-500/20" />
            <div className="mx-auto h-44 transition-transform duration-700 group-hover:scale-105">
              <BottleSVG
                variant={(i % 3) as 0 | 1 | 2}
                accent={cat.color}
                liquid={cat.color}
                className="h-full w-auto drop-shadow-lg"
              />
            </div>
            <h3 className="mt-4 font-royal text-2xl font-bold text-ink-950">{L(cat.name)}</h3>
            <p className="mt-1 text-xs text-ink-500">{L(cat.desc)}</p>
            <p className="eyebrow mt-2 text-gold-600">
              {count(cat.id).toLocaleString('ar-EG')} {L(f.unit)}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-950 transition group-hover:gap-3">
              {L(f.discover)} <ArrowLeft size={14} />
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
