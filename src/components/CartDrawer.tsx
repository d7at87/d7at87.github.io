import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import type { Product } from '../cms/types'
import { useSite } from '../cms/store'
import ProductImage from './ProductImage'

interface Props {
  open: boolean
  cart: Record<string, number>
  onClose: () => void
  onQty: (id: string, qty: number) => void
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function CartDrawer({ open, cart, onClose, onQty }: Props) {
  const { t, L, lang, data, formatPrice } = useSite()
  const wa = data.settings.whatsapp
  const [code, setCode] = useState('')
  const [promoErr, setPromoErr] = useState(false)

  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ p: data.products.find((x) => x.id === id && !x.hidden), qty }))
    .filter((l): l is { p: Product; qty: number } => Boolean(l.p))

  const subtotal = lines.reduce((s, l) => s + l.p.priceNum * l.qty, 0)
  const promo = data.settings.promo
  const applied = !!promo && promo.code.trim() !== '' && code.trim().toLowerCase() === promo.code.trim().toLowerCase() && !promoErr
  const discount = applied ? Math.round((subtotal * promo.pct) / 100) : 0
  const total = subtotal - discount
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const num = (n: number) => n.toLocaleString(lang === 'ar' ? 'ar-EG' : 'he-IL')

  const waText = encodeURIComponent(
    `${t('checkout')}:\n` +
      lines.map((l) => `• ${L(l.p.name)} ×${l.qty} — ${formatPrice(l.p.priceNum)}`).join('\n') +
      (applied ? `\n${t('off')} (${promo.code}): -${formatPrice(discount)}` : '') +
      `\n${t('total')}: ${formatPrice(total)}`,
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="fixed inset-y-0 start-0 z-50 flex w-full max-w-md flex-col border-e border-ink-950/10 bg-ivory-50 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b hairline p-5">
              <h3 className="flex items-center gap-2 font-royal text-2xl font-bold text-ink-950">
                {t('cart')}
                {count > 0 && (
                  <span className="bg-ink-950 px-2 py-0.5 text-xs font-bold text-ivory-50">{num(count)}</span>
                )}
              </h3>
              <button
                onClick={onClose}
                aria-label="close"
                className="grid size-9 place-items-center bg-white text-ink-700 ring-1 ring-ink-950/15 transition hover:bg-ink-950 hover:text-ivory-50"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <span className="grid size-20 place-items-center bg-ink-950/[0.04] text-gold-600 ring-1 ring-ink-950/10">
                    <ShoppingBag size={32} />
                  </span>
                  <p className="font-royal text-2xl font-bold text-ink-950">{t('cartEmpty')}</p>
                  <p className="text-sm text-ink-500">{t('cartEmptySub')}</p>
                  <a
                    href="#collection"
                    onClick={onClose}
                    className="bg-ink-950 px-8 py-3 text-sm font-bold text-ivory-50 transition hover:bg-gold-600"
                  >
                    {t('shopNow')}
                  </a>
                </div>
              ) : (
                <ul className="space-y-4">
                  {lines.map(({ p, qty }) => (
                    <motion.li
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 bg-white p-3 ring-1 ring-ink-950/10"
                    >
                      <div className="h-24 w-16 shrink-0 bg-ivory-100">
                        <ProductImage p={p} className="h-full w-full" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-royal text-lg font-bold leading-snug text-ink-950">{L(p.name)}</p>
                            <p className="eyebrow mt-0.5 text-ink-500">{p.brand}</p>
                          </div>
                          <button
                            onClick={() => onQty(p.id, 0)}
                            aria-label="remove"
                            className="text-ink-500/60 transition hover:text-red-700"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 bg-ivory-100 p-1 ring-1 ring-ink-950/10">
                            <button
                              onClick={() => onQty(p.id, qty - 1)}
                              aria-label="minus"
                              className="grid size-6 place-items-center text-ink-700 transition hover:bg-ink-950/5"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="min-w-5 text-center text-sm font-bold text-ink-950">{num(qty)}</span>
                            <button
                              onClick={() => onQty(p.id, qty + 1)}
                              aria-label="plus"
                              className="grid size-6 place-items-center text-ink-700 transition hover:bg-ink-950/5"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="text-sm font-extrabold text-ink-950">{formatPrice(p.priceNum * qty)}</p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t hairline bg-white p-5">
                {promo && promo.code.trim() !== '' && (
                  <div className="mb-3 flex gap-2">
                    <input
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value)
                        setPromoErr(false)
                      }}
                      placeholder={lang === 'ar' ? 'كوبون الخصم' : 'קופון'}
                      className="w-full bg-ivory-100 px-3 py-2 text-sm text-ink-900 outline-none ring-1 ring-ink-950/15 placeholder:text-ink-500/50 focus:ring-gold-500"
                    />
                    <button
                      onClick={() => setPromoErr(code.trim().toLowerCase() !== promo.code.trim().toLowerCase())}
                      className="shrink-0 bg-ink-950 px-4 text-xs font-bold text-ivory-50 transition hover:bg-gold-600"
                    >
                      {lang === 'ar' ? 'تطبيق' : 'החל'}
                    </button>
                  </div>
                )}
                {promoErr && <p className="mb-2 text-xs text-red-700">{lang === 'ar' ? 'الكوبون غير صالح' : 'קופון לא תקף'}</p>}
                <div className="mb-1 flex items-center justify-between text-sm text-ink-700/70">
                  <span>{t('shipping')}</span>
                  <span>{total >= 500 ? t('freeShip') : t('shipCalc')}</span>
                </div>
                {applied && (
                  <div className="mb-1 flex items-center justify-between text-sm font-bold text-green-700">
                    <span>
                      {t('off')} ({promo.code}) {promo.pct}٪
                    </span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-bold text-ink-950">{t('total')}</span>
                  <span className="font-royal text-2xl font-bold text-ink-950">{formatPrice(total)}</span>
                </div>
                <a
                  href={`https://wa.me/${wa}?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 bg-ink-950 py-3.5 text-sm font-bold tracking-wide text-ivory-50 transition hover:bg-gold-600"
                >
                  {t('checkout')} <ArrowLeft size={16} />
                </a>
                <a
                  href={`https://wa.me/${wa}?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex w-full items-center justify-center gap-2 bg-[#25D366] py-3 text-sm font-bold text-white transition hover:brightness-110"
                >
                  <WhatsAppIcon className="size-4" /> {t('viaWA')}
                </a>
                <p className="mt-3 text-center text-[11px] text-ink-500">{t('waNote')}</p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
