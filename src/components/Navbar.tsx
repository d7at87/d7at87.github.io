import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, Menu, ShoppingBag, X } from 'lucide-react'
import { useSite } from '../cms/store'
import { isIOSDevice, usePWAInstall } from '../pwa'

interface Props {
  cartCount: number
  onCartOpen: () => void
}

export default function Navbar({ cartCount, onCartOpen }: Props) {
  const { t, L, lang, setLang, data } = useSite()
  const { settings } = data
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const { installed, install } = usePWAInstall()

  const LINKS = [
    { label: t('home'), href: '#home' },
    { label: t('collection'), href: '#collection' },
    { label: t('maison'), href: '#maison' },
    { label: t('services'), href: '#services' },
    { label: t('contact'), href: '#contact' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const onInstallClick = async () => {
    const ok = await install()
    if (!ok) setHelpOpen(true)
  }

  const linkCls = scrolled
    ? 'text-ink-700 transition hover:text-gold-600'
    : 'text-ivory-100/80 transition hover:text-gold-300'

  const iconBtn = scrolled
    ? 'bg-ink-950/[0.03] text-ink-900 ring-ink-950/15 hover:bg-gold-500/15'
    : 'bg-white/10 text-ivory-100 ring-white/20 backdrop-blur hover:bg-white/20'

  const showSteps = (isIOSDevice() ? t('iosHow') : t('andHow')).split('|')

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-ivory-50/90 shadow-[0_8px_30px_rgba(20,17,11,0.08)] backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div
          className={`overflow-hidden bg-ink-950 text-ivory-100 transition-all duration-300 ${
            scrolled ? 'max-h-0' : 'max-h-10'
          }`}
        >
          <div className="marquee flex w-max items-center gap-14 py-1.5">
            {[...settings.announcements[lang], ...settings.announcements[lang]].map((a, i) => (
              <span key={i} className="eyebrow whitespace-nowrap">
                {a}
              </span>
            ))}
          </div>
        </div>

        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a
            href="#home"
            className={`font-royal text-2xl font-bold tracking-tight transition-colors ${
              scrolled ? 'text-ink-950' : 'text-ivory-50'
            }`}
          >
            {L(settings.siteName)}
          </a>

          <ul className="hidden items-center gap-9 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a className={`text-[13px] tracking-wide ${linkCls}`} href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setLang(lang === 'ar' ? 'he' : 'ar')}
              aria-label="language"
              className={`grid h-10 place-items-center rounded-full px-3 text-xs font-bold ring-1 transition ${iconBtn}`}
            >
              {lang === 'ar' ? 'עברית' : 'العربية'}
            </button>

            {!installed && (
              <button
                onClick={onInstallClick}
                aria-label={t('install')}
                title={t('install')}
                className={`relative grid size-10 place-items-center rounded-full ring-1 transition ${iconBtn}`}
              >
                <Download size={18} />
              </button>
            )}

            <button
              onClick={onCartOpen}
              aria-label={t('cart')}
              className={`relative grid size-10 place-items-center rounded-full ring-1 transition ${iconBtn}`}
            >
              <ShoppingBag size={18} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -end-1 grid min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-black text-ink-950"
                  >
                    {cartCount.toLocaleString(lang === 'ar' ? 'ar-EG' : 'he-IL')}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <a
              href="#collection"
              className="hidden bg-ink-950 px-6 py-2.5 text-[13px] font-bold tracking-wide text-ivory-50 transition hover:bg-gold-600 md:block"
            >
              {t('shopNow')}
            </a>

            <button
              onClick={() => setOpen(!open)}
              className={scrolled ? 'text-ink-900 md:hidden' : 'text-ivory-100 md:hidden'}
              aria-label="menu"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t hairline bg-ivory-50/95 backdrop-blur-xl md:hidden"
            >
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a onClick={() => setOpen(false)} className="block px-6 py-3 text-ink-700" href={l.href}>
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  onClick={() => setOpen(false)}
                  className="block px-6 py-3 font-bold text-gold-600"
                  href="#/admin"
                >
                  {t('admin')}
                </a>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {helpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setHelpOpen(false)}
            className="fixed inset-0 z-50 grid place-items-center bg-ink-950/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 30, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm border border-ink-950/10 bg-ivory-50 p-7 text-center shadow-2xl"
            >
              <span className="mx-auto grid size-14 place-items-center bg-ink-950/[0.04] text-gold-600 ring-1 ring-ink-950/10">
                <Download size={24} />
              </span>
              <h3 className="mt-4 font-royal text-2xl font-bold text-ink-950">{t('installTitle')}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-700/70">{t('installDesc')}</p>
              <ol className="mt-4 space-y-2 bg-white p-4 text-start ring-1 ring-ink-950/10">
                {showSteps.map((s, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-6 text-ink-700">
                    <span className="font-black text-gold-600">{i + 1}.</span> {s}
                  </li>
                ))}
              </ol>
              <button
                onClick={() => setHelpOpen(false)}
                className="mt-5 w-full bg-ink-950 py-3 text-sm font-bold text-ivory-50 transition hover:bg-gold-600"
              >
                {t('installLater')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
