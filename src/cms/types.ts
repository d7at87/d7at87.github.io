export type Lang = 'ar' | 'he'

export interface LText {
  ar: string
  he: string
}

export interface Notes {
  top: string[]
  heart: string[]
  base: string[]
}

export interface Product {
  id: string
  name: LText
  latin: string
  brand: string
  categoryId: string
  priceNum: number
  oldPriceNum?: number
  isNew?: boolean
  isBestSeller?: boolean
  hidden?: boolean
  soldOut?: boolean
  image?: string
  description: LText
  notes: { ar: Notes; he: Notes }
  longevity: LText
  intensity: number
  variant: 0 | 1 | 2
  colors: { accent: string; liquid: string }
}

export interface Category {
  id: string
  name: LText
  desc: LText
  color: string
}

export interface VideoItem {
  id: string
  title: LText
  src: string
  poster?: string
}

export interface OfferItem extends LText {
  desc: LText
  cta: LText
}

export interface StepItem extends LText {
  desc: LText
}

export interface ServiceItem extends LText {
  desc: LText
  cta: LText
  wa: LText
}

export interface Content {
  hero: { eyebrow: LText; title1: LText; title2: LText; sub: LText; cta1: LText; cta2: LText; scroll: LText }
  families: { eyebrow: LText; title1: LText; title2: LText; discover: LText; unit: LText }
  best: { eyebrow: LText; title1: LText; title2: LText; sub: LText }
  reels: { eyebrow: LText; title1: LText; title2: LText }
  collection: {
    eyebrow: LText
    title1: LText
    title2: LText
    sub: LText
    searchPh: LText
    noRes: LText
    noResSub: LText
    loadMore: LText
    showing: LText
    of: LText
  }
  offers: { eyebrow: LText; title1: LText; title2: LText; items: OfferItem[] }
  maison: {
    eyebrow: LText
    title1: LText
    title2: LText
    sub: LText
    craftTitle: LText
    steps: StepItem[]
    numbers: { value: LText; label: LText }[]
  }
  services: { eyebrow: LText; title1: LText; title2: LText; items: ServiceItem[] }
  promises: { items: { title: LText; desc: LText }[] }
  stats: { items: { title: LText; desc: LText }[] }
  footer: {
    about: LText
    newsTitle: LText
    newsPh: LText
    newsOk: LText
    newsErr: LText
    rights: LText
    colServices: LText
    colMaison: LText
    colNews: LText
    terms: LText
    privacy: LText
  }
}

export interface Settings {
  siteName: LText
  defaultLang: Lang
  currency: LText
  whatsapp: string
  email: string
  phone: string
  address: LText
  announcements: { ar: string[]; he: string[] }
  heroBg: { type: 'video' | 'image'; video: string; image: string }
  fontH: number
  fontB: number
  perPage: number
  pin: string
  promo?: { code: string; pct: number }
}

export interface SiteData {
  products: Product[]
  categories: Category[]
  brands: string[]
  videos: VideoItem[]
  content: Content
  ui: Record<string, LText>
  settings: Settings
}
