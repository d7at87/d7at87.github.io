import { motion } from 'framer-motion'
import { Boxes, Palette, PenTool, Sun } from 'lucide-react'
import { useSite } from '../cms/store'

const STEP_ICONS = [PenTool, Boxes, Palette, Sun]

const BLUEPRINTS = [
  { src: '/blueprints/wf1.webp', cap: 'SUBDIV 0' },
  { src: '/blueprints/wf2.webp', cap: 'SUBDIV 3' },
]

const CORNERS = [
  'top-2 start-2 border-t-2 border-s-2',
  'top-2 end-2 border-t-2 border-e-2',
  'bottom-2 start-2 border-b-2 border-s-2',
  'bottom-2 end-2 border-b-2 border-e-2',
]

export default function Maison() {
  const { L, data } = useSite()
  const m = data.content.maison

  return (
    <section id="maison" className="relative scroll-mt-20 border-b hairline bg-ivory-100/60 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="eyebrow text-gold-600">{L(m.eyebrow)}</p>
          <h2 className="mt-4 font-royal text-5xl font-bold text-ink-950 lg:text-6xl">
            {L(m.title1)} <span className="text-gold-gradient">{L(m.title2)}</span>
          </h2>
          <div className="mx-auto mt-5 h-px w-20 bg-gold-500" />
          <p className="mt-4 leading-8 text-ink-700/70">{L(m.sub)}</p>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-px bg-ink-950/10 ring-1 ring-ink-950/10 lg:grid-cols-4">
          {m.numbers.map((n, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-ivory-50 p-8 text-center"
            >
              <p className="font-royal text-4xl font-bold text-ink-950">{L(n.value)}</p>
              <p className="eyebrow mt-2 text-ink-500">{L(n.label)}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-2">
          <div className="space-y-5">
            {BLUEPRINTS.map((b, i) => (
              <motion.figure
                key={b.src}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="blueprint-grid scanline group relative overflow-hidden border border-ink-950/15 bg-white p-3"
              >
                {CORNERS.map((cn) => (
                  <span key={cn} className={`absolute z-10 size-4 border-gold-600/70 ${cn}`} />
                ))}
                <img
                  src={b.src}
                  alt={b.cap}
                  loading="lazy"
                  className="w-full opacity-90 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                />
                <figcaption className="mt-3 text-center text-xs tracking-wider text-ink-500">{b.cap}</figcaption>
              </motion.figure>
            ))}
          </div>

          <div className="space-y-4 lg:pt-2">
            <p className="eyebrow text-gold-600">{L(m.eyebrow)}</p>
            <h3 className="font-royal text-4xl font-bold leading-snug text-ink-950">{L(m.craftTitle)}</h3>
            {m.steps.map((s, i) => {
              const Icon = STEP_ICONS[i % STEP_ICONS.length]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="panel flex items-start gap-4 p-5"
                >
                  <span className="grid size-11 shrink-0 place-items-center bg-ink-950/[0.04] text-gold-600 ring-1 ring-ink-950/10">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="font-bold text-ink-950">
                      <span className="me-2 font-royal text-gold-600">0{i + 1}</span>
                      {L(s)}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-ink-700/60">{L(s.desc)}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
