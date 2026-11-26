import { lb } from './cms/labels'
import type { Lang, Product, SiteData } from './cms/types'

export type Scope = 'all' | 'best' | 'new' | 'sale' | 'category' | 'brand' | 'price'

export interface PageSpec {
  kind: 'home' | 'list' | 'admin'
  scope?: Scope
  value?: string
}

interface PriceRange {
  id: string
  labelKey: string
  test: (p: Product) => boolean
}

export const PRICE_RANGES: PriceRange[] = [
  { id: 'under100', labelKey: 'under100', test: (p) => p.priceNum < 100 },
  { id: '100-150', labelKey: 'range100150', test: (p) => p.priceNum >= 100 && p.priceNum < 150 },
  { id: '150-250', labelKey: 'range150250', test: (p) => p.priceNum >= 150 && p.priceNum < 250 },
  { id: '250-400', labelKey: 'range250400', test: (p) => p.priceNum >= 250 && p.priceNum < 400 },
  { id: '400plus', labelKey: 'over400', test: (p) => p.priceNum >= 400 },
]

const safeDecode = (v: string): string => {
  try {
    return decodeURIComponent(v)
  } catch {
    return v
  }
}

/** كل المسارات تستخدم hash حتى يعمل النشر الثابت على Render بلا rewrite. */
export function parseHash(hash: string): PageSpec {
  if (hash === '#/admin') return { kind: 'admin' }
  if (!hash || hash === '#' || hash === '#/') return { kind: 'home' }
  if (!hash.startsWith('#/')) return { kind: 'home' }

  const parts = hash.slice(2).split('/').filter(Boolean).map(safeDecode)
  if (parts[0] === 'collections') {
    if (parts[1] === 'best') return { kind: 'list', scope: 'best' }
    if (parts[1] === 'new') return { kind: 'list', scope: 'new' }
    if (parts[1] && parts[1] !== 'all') return { kind: 'list', scope: 'category', value: parts[1] }
    return { kind: 'list', scope: 'all' }
  }
  if (parts[0] === 'brands' && parts[1]) return { kind: 'list', scope: 'brand', value: parts[1] }
  if (parts[0] === 'price' && parts[1]) {
    if (parts[1] === 'sale') return { kind: 'list', scope: 'sale' }
    if (PRICE_RANGES.some((r) => r.id === parts[1])) return { kind: 'list', scope: 'price', value: parts[1] }
  }
  return { kind: 'list', scope: 'all' }
}

export function productsFor(data: SiteData, spec: PageSpec): Product[] {
  const visible = data.products.filter((p) => !p.hidden)
  switch (spec.scope) {
    case 'best':
      return visible.filter((p) => p.isBestSeller)
    case 'new':
      return visible.filter((p) => p.isNew)
    case 'sale':
      return visible.filter((p) => Boolean(p.oldPriceNum) && p.priceNum < p.oldPriceNum!)
    case 'category':
      return visible.filter((p) => p.categoryId === spec.value)
    case 'brand':
      return visible.filter((p) => p.brand === spec.value)
    case 'price': {
      const range = PRICE_RANGES.find((r) => r.id === spec.value)
      return range ? visible.filter(range.test) : visible
    }
    default:
      return visible
  }
}

export function pageTitle(spec: PageSpec, data: SiteData, lang: Lang): string {
  switch (spec.scope) {
    case 'best':
      return lb('bestSellers', lang)
    case 'new':
      return lb('newArrivals', lang)
    case 'sale':
      return lb('onSale', lang)
    case 'price': {
      const range = PRICE_RANGES.find((r) => r.id === spec.value)
      return range ? lb(range.labelKey, lang) : lb('shopByPrice', lang)
    }
    case 'brand':
      return spec.value ?? lb('brands', lang)
    case 'category': {
      const cat = data.categories.find((c) => c.id === spec.value)
      return cat ? cat.name[lang] ?? cat.name.ar : lb('categories', lang)
    }
    default:
      return lb('allProducts', lang)
  }
}

export const categoryHref = (id: string): string => `#/collections/${encodeURIComponent(id)}`
export const brandHref = (brand: string): string => `#/brands/${encodeURIComponent(brand)}`
export const priceHref = (id: string): string => `#/price/${encodeURIComponent(id)}`
