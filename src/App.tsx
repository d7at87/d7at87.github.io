import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react'
import { SiteProvider, useSite } from './cms/store'
import type { Product } from './cms/types'
import { parseHash } from './catalog'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Reels from './components/Reels'
import CampaignProducts from './components/rammahs/Campaign'
import BrandSlider from './components/rammahs/BrandSlider'
import { OnSaleRow } from './components/rammahs/ProductRows'
import FeaturedCollections from './components/rammahs/FeaturedCollections'
import ShopByPrice from './components/rammahs/ShopByPrice'
import ProductRows from './components/rammahs/ProductRows'
import CatalogPage from './components/store/CatalogPage'
import Footer from './components/Footer'
import PerfumeModal from './components/PerfumeModal'
import CartDrawer from './components/CartDrawer'
import WhatsAppFloat from './components/WhatsAppFloat'
import BackgroundFX from './components/BackgroundFX'
const Admin = lazy(() => import('./admin/Admin'))

type Cart = Record<string, number>

function loadCart(): Cart {
  try {
    return JSON.parse(localStorage.getItem('ashour-cart') || '{}') as Cart
  } catch {
    return {}
  }
}

function Shell() {
  const { data } = useSite()
  const [hash, setHash] = useState(() => window.location.hash)
  const [selected, setSelected] = useState<Product | null>(null)
  const [cart, setCart] = useState<Cart>(loadCart)
  const [cartOpen, setCartOpen] = useState(false)
  const spec = parseHash(hash)

  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    // الروابط القديمة ما زالت تعمل كأنكور داخل الصفحة.
    if (hash.startsWith('#/') || !hash) {
      window.scrollTo({ top: 0 })
      return
    }
    requestAnimationFrame(() => {
      const target = document.getElementById(hash.slice(1))
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else window.scrollTo({ top: 0 })
    })
  }, [hash])

  useEffect(() => {
    try {
      localStorage.setItem('ashour-cart', JSON.stringify(cart))
    } catch {
      /* ignore */
    }
  }, [cart])

  if (spec.kind === 'admin')
    return (
      <Suspense
        fallback={
          <div className="grid min-h-screen place-items-center bg-ivory-100">
            <p className="text-sm font-bold text-ink-500">جارٍ تحميل لوحة التحكم...</p>
          </div>
        }
      >
        <Admin />
      </Suspense>
    )

  const addToCart = (id: string, qty = 1) => {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + qty }))
    setSelected(null)
    setCartOpen(true)
  }

  const setQty = (id: string, qty: number) => {
    setCart((c) => {
      const next = { ...c }
      if (qty <= 0) delete next[id]
      else next[id] = qty
      return next
    })
  }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const fs = { '--h-scale': data.settings.fontH, '--b-scale': data.settings.fontB } as CSSProperties

  return (
    <div className="min-h-screen" style={fs}>
      <BackgroundFX />
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />

      <main>
        {spec.kind === 'list' ? (
          <CatalogPage spec={spec} onSelect={setSelected} onAdd={addToCart} />
        ) : (
          <>
            {/* الواجهة الرئيسية ثم الريلز مباشرة — كما طلبت */}
            <Hero />
            <Reels />

            {/* نسخة كاملة من تصميم المتجر المستهدف بعد الريلز */}
            <div id="collection" className="scroll-mt-20">
              <CampaignProducts onSelect={setSelected} onAdd={addToCart} />
            </div>
            <BrandSlider />
            <OnSaleRow onSelect={setSelected} onAdd={addToCart} />
            <div id="maison" className="scroll-mt-20">
              <FeaturedCollections />
            </div>
            <ShopByPrice />
            <div id="services" className="scroll-mt-20">
              <ProductRows onSelect={setSelected} onAdd={addToCart} />
            </div>
          </>
        )}
      </main>

      <Footer />
      <PerfumeModal perfume={selected} onClose={() => setSelected(null)} onAdd={addToCart} />
      <CartDrawer open={cartOpen} cart={cart} onClose={() => setCartOpen(false)} onQty={setQty} />
      <WhatsAppFloat />
    </div>
  )
}

export default function App() {
  return (
    <SiteProvider>
      <Shell />
    </SiteProvider>
  )
}
