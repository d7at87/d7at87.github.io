import { useSite } from '../../cms/store'
import { useMediaURL } from '../../cms/media'
import { brandHref } from '../../catalog'
import { RamOutlineButton, RamTitle, useStoreSection } from './RamParts'

function BrandLogo({ brand, logo }: { brand: string; logo?: string }) {
  const url = useMediaURL(logo)
  return (
    <span className="rm-brand-logo">
      {url ? (
        <img src={url} alt={brand} className="h-full w-full object-contain" />
      ) : (
        <span className="rm-heading text-[26px] leading-none text-[#8b6914]">{brand.trim().slice(0, 1)}</span>
      )}
    </span>
  )
}

export default function BrandSlider() {
  const { data, t } = useSite()
  const { visible, mode } = useStoreSection('brands', 'rail')
  const logos = data.settings.brandLogos ?? {}
  const brands = data.brands.filter(Boolean)
  if (!visible || brands.length === 0) return null

  return (
    <section className="rm bg-white py-12 lg:py-14">
      <div className="rm-container">
        <RamTitle title={t('shopByBrand')} sub={t('brandSub')} />

        <div className={`mt-8 ${mode === 'grid' ? 'rm-grid-4' : 'rm-scroll-x'}`} role="region" aria-label={t('shopByBrand')}>
          {brands.map((b) => (
            <a
              key={b}
              href={brandHref(b)}
              className={`rm-brand group flex flex-col items-center gap-2 text-center ${mode === 'grid' ? 'w-full' : 'w-24 shrink-0'}`}
            >
              <BrandLogo brand={b} logo={logos[b]} />
              <span className="w-full truncate text-xs font-semibold leading-tight text-[#1c1c1c]/85">{b}</span>
            </a>
          ))}
        </div>

        <RamOutlineButton href="#/collections" label={t('allBrands')} />
      </div>
    </section>
  )
}
