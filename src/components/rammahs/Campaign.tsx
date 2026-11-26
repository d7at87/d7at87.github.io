import { useSite } from '../../cms/store'
import type { Product } from '../../cms/types'
import { RamCard, RamLayout, RamViewAll, useStoreSection } from './RamParts'

export default function CampaignProducts({
  onSelect,
  onAdd,
}: {
  onSelect: (p: Product) => void
  onAdd: (id: string) => void
}) {
  const { t, data } = useSite()
  const { visible, mode } = useStoreSection('blackFriday', 'grid')
  const items = data.products.filter((p) => !p.hidden).slice(0, 12)
  if (!visible || items.length === 0) return null

  return (
    <section className="rm bg-white pb-12 pt-8 lg:pb-16 lg:pt-10">
      <div className="rm-container">
        <h2 className="rm-heading text-start text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold leading-tight text-[#1c1c1c]">
          {t('blackFriday')}
        </h2>
        <div className="mt-7">
          <RamLayout mode={mode}>
            {items.map((p) => (
              <RamCard key={p.id} perfume={p} onSelect={onSelect} onAdd={onAdd} badge={t('blackFriday')} />
            ))}
          </RamLayout>
        </div>
        <RamViewAll href="#/price/sale" label={t('viewAll')} />
      </div>
    </section>
  )
}
