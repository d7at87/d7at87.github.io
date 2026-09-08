import { motion } from 'framer-motion'
import { ArrowLeft, Gift, Percent, Truck } from 'lucide-react'
import { useSite } from '../cms/store'

const ICONS = [Gift, Percent, Truck]

export default function Offers() {
  const { L, data } = useSite()
  const o = data.content.offers

  return (
    <section className="border-y hairline bg-ink-950 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="eyebrow text-gold-300">{L(o.eyebrow)}</p>
          <h2 className="mt-4 font-royal text-5xl font-bold text-ivory-50 lg:text-6xl">
            {L(o.title1)} <span className="text-gold-300">{L(o.title2)}</span>
          </h2>
          <div className="mx-auto mt-5 h-px w-20 bg-gold-500" />
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {o.items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <motion.a
                key={i}
                href="#collection"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative block overflow-hidden bg-white/[0.04] p-8 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1.5 hover:ring-gold-500/50"
              >
                <div className="pointer-events-none absolute -top-16 -end-16 size-44 rounded-full bg-gold-500/15 blur-3xl" />
                <span className="relative grid size-12 place-items-center bg-gold-500/10 text-gold-300 ring-1 ring-gold-500/40">
                  <Icon size={22} />
                </span>
                <h3 className="relative mt-4 font-royal text-2xl font-bold text-ivory-50">{L(item)}</h3>
                <p className="relative mt-2 min-h-14 text-sm leading-7 text-ivory-100/65">{L(item.desc)}</p>
                <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-gold-300 transition group-hover:gap-3">
                  {L(item.cta)} <ArrowLeft size={15} />
                </span>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
