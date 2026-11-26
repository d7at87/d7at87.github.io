import { useSite } from '../../cms/store'
import { PRICE_RANGES, priceHref } from '../../catalog'
import ProductImage from '../ProductImage'
import { RamTitle, useStoreSection } from './RamParts'

export default function ShopByPrice() {
  const { data, t } = useSite()
  const { visible, mode } = useStoreSection('price', 'rail')
  const products = data.products.filter((p) => !p.hidden)
  if (!visible) return null

  return (
    <section className="rm bg-white py-12 lg:py-14">
      <div className="rm-container">
        <RamTitle title={t('shopByPrice')} />

        <div className={`mt-8 ${mode === 'grid' ? 'rm-grid-4' : 'rm-scroll-x'}`}>
          {PRICE_RANGES.map((range, i) => {
            const sample = products.find(range.test) ?? products[i % Math.max(products.length, 1)]
            return (
              <a
                key={range.id}
                href={priceHref(range.id)}
                className={`group relative block aspect-square overflow-hidden border border-black/[0.06] bg-[#f8f5f3] ${
                  mode === 'grid' ? 'w-full' : 'w-[min(40vw,9.5rem)] shrink-0'
                }`}
              >
                {sample && (
                  <div className="absolute inset-0 flex items-center justify-center p-10 transition duration-500 group-hover:scale-[1.04]">
                    <ProductImage p={sample} className="max-h-full w-auto" />
                  </div>
                )}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent"
                  aria-hidden="true"
                />
                <h3 className="absolute inset-x-4 bottom-4 z-10 text-start text-[clamp(1.05rem,2.2vw,1.25rem)] font-bold leading-tight text-white">
                  {t(range.labelKey)}
                </h3>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
