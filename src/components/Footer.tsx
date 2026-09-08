import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowUp, Check, Instagram, Mail, MapPin, Twitter } from 'lucide-react'
import { useSite } from '../cms/store'
import { WhatsAppIcon } from './CartDrawer'

export default function Footer() {
  const { t, L, data } = useSite()
  const f = data.content.footer
  const s = data.settings
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(() => {
    try {
      return localStorage.getItem('ashour-news') === '1'
    } catch {
      return false
    }
  })
  const [error, setError] = useState(false)

  const columns = [
    {
      title: L(f.colServices),
      links: [
        { label: t('cart'), href: '#collection' },
        { label: t('shipping'), href: '#services' },
        { label: t('services'), href: '#services' },
        { label: t('contact'), href: '#contact' },
      ],
    },
    {
      title: L(f.colMaison),
      links: [
        { label: t('maison'), href: '#maison' },
        { label: t('collection'), href: '#collection' },
        { label: t('bestSeller'), href: '#collection' },
        { label: t('contact'), href: '#contact' },
      ],
    },
  ]

  const subscribe = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(true)
      return
    }
    setError(false)
    try {
      localStorage.setItem('ashour-news', '1')
    } catch {
      /* ignore */
    }
    setDone(true)
  }

  return (
    <footer id="contact" className="relative scroll-mt-20 border-t hairline bg-ivory-100/70">
      <div className="mx-auto max-w-7xl px-6 pt-16">
        <div className="grid gap-12 pb-12 lg:grid-cols-[1.2fr_1fr_1fr_1.4fr]">
          <div>
            <p className="font-royal text-3xl font-bold text-ink-950">{L(s.siteName)}</p>
            <p className="mt-4 max-w-xs text-sm leading-7 text-ink-700/65">{L(f.about)}</p>
            <div className="mt-5 flex gap-3">
              {[
                { icon: Instagram, label: 'instagram' },
                { icon: Twitter, label: 'twitter' },
                { icon: Mail, label: 'mail' },
              ].map((sn) => (
                <a
                  key={sn.label}
                  href="#contact"
                  aria-label={sn.label}
                  className="grid size-10 place-items-center bg-white text-ink-700 ring-1 ring-ink-950/15 transition hover:bg-ink-950 hover:text-ivory-50"
                >
                  <sn.icon size={17} />
                </a>
              ))}
              <a
                href={`https://wa.me/${s.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                aria-label="whatsapp"
                className="grid size-10 place-items-center bg-white text-ink-700 ring-1 ring-ink-950/15 transition hover:bg-ink-950 hover:text-ivory-50"
              >
                <WhatsAppIcon className="size-[17px]" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="eyebrow text-ink-950">{col.title}</h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-ink-700/70 transition hover:text-gold-600">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="eyebrow text-ink-950">{L(f.colNews)}</h4>
            <p className="mt-5 font-royal text-2xl font-bold leading-snug text-ink-950">{L(f.newsTitle)}</p>
            {done ? (
              <p className="mt-4 flex items-center gap-2 bg-ink-950/[0.04] p-4 text-sm font-bold text-ink-900 ring-1 ring-ink-950/10">
                <Check size={16} className="text-gold-600" /> {L(f.newsOk)}
              </p>
            ) : (
              <form onSubmit={subscribe} className="mt-4">
                <div className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={L(f.newsPh)}
                    className="w-full bg-white px-4 py-3 text-sm text-ink-900 outline-none ring-1 ring-ink-950/15 transition placeholder:text-ink-500/50 focus:ring-gold-500"
                  />
                  <button
                    type="submit"
                    aria-label="subscribe"
                    className="grid w-14 shrink-0 place-items-center bg-ink-950 text-ivory-50 transition hover:bg-gold-600"
                  >
                    <ArrowLeft size={18} />
                  </button>
                </div>
                {error && <p className="mt-2 text-xs text-red-700">{L(f.newsErr)}</p>}
              </form>
            )}
            <ul className="mt-6 space-y-2 text-sm text-ink-700/70">
              <li className="flex items-center gap-2">
                <WhatsAppIcon className="size-4 text-gold-600" />
                <a
                  href={`https://wa.me/${s.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-gold-600"
                  dir="ltr"
                >
                  {s.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={15} className="text-gold-600" /> {L(s.address)}
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-gold-600" /> {s.email}
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t hairline py-6 sm:flex-row">
          <p className="text-xs text-ink-500">{L(f.rights)}</p>
          <div className="flex items-center gap-5 text-xs text-ink-500">
            <a href="#contact" className="transition hover:text-gold-600">
              {L(f.terms)}
            </a>
            <a href="#contact" className="transition hover:text-gold-600">
              {L(f.privacy)}
            </a>
            <a href="#/admin" className="transition hover:text-gold-600">
              {t('admin')}
            </a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="top"
              className="grid size-9 place-items-center bg-ink-950 text-ivory-50 transition hover:bg-gold-600"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
