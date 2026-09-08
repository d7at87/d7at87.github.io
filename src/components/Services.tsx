import { motion } from 'framer-motion'
import { ArrowLeft, Compass, FlaskConical, Gift, PenTool, RotateCcw, Truck } from 'lucide-react'
import { useSite } from '../cms/store'

const SERVICE_ICONS = [PenTool, Gift, Compass]
const PROMISE_ICONS = [FlaskConical, Truck, Gift, RotateCcw]

export default function Services() {
  const { L, data } = useSite()
  const s = data.content.services
  const wa = data.settings.whatsapp

  return (
    <section id="services" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="eyebrow text-gold-600">{L(s.eyebrow)}</p>
        <h2 className="mt-4 font-royal text-5xl font-bold text-ink-950 lg:text-6xl">
          {L(s.title1)} <span className="text-gold-gradient">{L(s.title2)}</span>
        </h2>
        <div className="mx-auto mt-5 h-px w-20 bg-gold-500" />
      </motion.div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {s.items.map((item, i) => {
          const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length]
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group panel relative overflow-hidden p-8 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-25px_rgba(20,17,11,0.25)]"
            >
              <div className="pointer-events-none absolute -top-16 -end-16 size-44 rounded-full bg-gold-500/10 blur-3xl transition group-hover:bg-gold-500/20" />
              <span className="grid size-12 place-items-center bg-ink-950/[0.04] text-gold-600 ring-1 ring-ink-950/10">
                <Icon size={22} />
              </span>
              <h3 className="mt-5 font-royal text-2xl font-bold text-ink-950">{L(item)}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-700/65">{L(item.desc)}</p>
              <a
                href={`https://wa.me/${wa}?text=${encodeURIComponent(L(item.wa))}`}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 border-b border-gold-500 pb-1 text-sm font-bold text-ink-950 transition hover:gap-3 hover:text-gold-600"
              >
                {L(item.cta)} <ArrowLeft size={15} />
              </a>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 grid grid-cols-2 gap-px bg-ink-950/10 ring-1 ring-ink-950/10 lg:grid-cols-4"
      >
        {data.content.promises.items.map((pr, i) => {
          const Icon = PROMISE_ICONS[i % PROMISE_ICONS.length]
          return (
            <div key={i} className="flex items-center gap-4 bg-white p-6">
              <span className="grid size-11 shrink-0 place-items-center text-gold-600 ring-1 ring-ink-950/10">
                <Icon size={20} />
              </span>
              <div>
                <p className="text-sm font-bold text-ink-950">{L(pr.title)}</p>
                <p className="text-xs text-ink-500">{L(pr.desc)}</p>
              </div>
            </div>
          )
        })}
      </motion.div>
    </section>
  )
}
