import { useSite } from '../../cms/store'
import { useMediaURL } from '../../cms/media'
import { categoryHref } from '../../catalog'
import ProductImage from '../ProductImage'
import type { Product } from '../../cms/types'
import { RamTitle, useStoreSection } from './RamParts'

const BADGES = ['ORIENTAL', 'WOODY', 'FRESH', 'SPICY']

function TileImage({ image, sample }: { image?: string; sample?: Product }) {
  const url = useMediaURL(image)
  if (url) return <img src={url} alt="" className="h-full w-full object-contain" />
  if (sample) return <ProductImage p={sample} className="max-h-full w-auto" />
  return null
}

export default function FeaturedCollections() {
  const { data, t, L } = useSite()
  const { visible, mode } = useStoreSection('featured', 'rail')
  const cats = data.categories
  if (!visible || cats.length === 0) return null

  const tiles = cats.slice(0, 4).map((cat, i) => ({
    key: cat.id,
    title: L(cat.name),
    badge: BADGES[i] ?? 'ASHOUR',
    href: categoryHref(cat.id),
    image: cat.image,
    sample: data.products.find((p) => !p.hidden && p.categoryId === cat.id),
  }))

  const best = data.products.find((p) => !p.hidden && p.isBestSeller) ?? data.products.find((p) => !p.hidden)
  if (best) {
    tiles.push({
      key: 'best',
      title: t('bestSellers'),
      badge: 'BEST',
      href: '#/collections/best',
      image: undefined,
      sample: best,
    })
  }

  return (
    <section className="rm bg-white py-12 lg:py-14">
      <div className="rm-container">
        <RamTitle title={t('featured')} sub={t('featuredSub')} />

        <div className={`mt-8 ${mode === 'grid' ? 'rm-grid-4' : 'rm-scroll-x'}`}>
          {tiles.map((tile) => (
            <a
              key={tile.key}
              href={tile.href}
              className={`group relative block aspect-square overflow-hidden border border-black/[0.06] bg-[#f8f5f3] ${
                mode === 'grid' ? 'w-full' : 'w-[min(42vw,10rem)] shrink-0'
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center p-8 transition duration-500 group-hover:scale-[1.04]">
                <TileImage image={tile.image} sample={tile.sample} />
              </div>
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent"
                aria-hidden="true"
              />
              <span className="rm-badge rm-badge-sale absolute end-3 top-3 z-10">{tile.badge}</span>
              <h3 className="absolute inset-x-4 bottom-4 z-10 text-start text-[clamp(1.05rem,2.2vw,1.25rem)] font-bold leading-tight text-white">
                {tile.title}
              </h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
