import { useEffect, useState, type CSSProperties } from 'react'
import { SiteProvider, useSite } from './cms/store'
import type { Product } from './cms/types'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FamilyTiles from './components/FamilyTiles'
import Reels from './components/Reels'
import BestSellers from './components/BestSellers'
import Collection from './components/Collection'
import Offers from './components/Offers'
import Maison from './components/Maison'
import Services from './components/Services'
import Footer from './components/Footer'
import PerfumeModal from './components/PerfumeModal'
import CartDrawer from './components/CartDrawer'
import WhatsAppFloat from './components/WhatsAppFloat'
import BackgroundFX from './components/BackgroundFX'
import Admin from './admin/Admin'

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
  const [route, setRoute] = useState(() => window.location.hash)
  const [selected, setSelected] = useState<Product | null>(null)
  const [cart, setCart] = useState<Cart>(loadCart)
  const [cartOpen, setCartOpen] = useState(false)
  const [filterId, setFilterId] = useState('all')

  useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash)
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('ashour-cart', JSON.stringify(cart))
    } catch {
      /* ignore */
    }
  }, [cart])

  if (route === '#/admin') return <Admin />

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

  const pickFamily = (id: string) => {
    setFilterId(id)
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
  }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const fs = { '--h-scale': data.settings.fontH, '--b-scale': data.settings.fontB } as CSSProperties

  return (
    <div className="min-h-screen" style={fs}>
      <BackgroundFX />
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <main>
        <Hero />
        <FamilyTiles onPick={pickFamily} />
        <Reels />
        <BestSellers onSelect={setSelected} onAdd={addToCart} />
        <Collection onSelect={setSelected} onAdd={addToCart} filterId={filterId} setFilterId={setFilterId} />
        <Offers />
        <Maison />
        <Services />
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
