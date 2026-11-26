import { useSite } from '../../cms/store'
import type { Product } from '../../cms/types'
import { categoryHref } from '../../catalog'
import { RamCard, RamDivider, RamLayout, RamViewAll, useStoreSection } from './RamParts'

interface RowProps {
  onSelect: (p: Product) => void
  onAdd: (id: string) => void
}

interface Row {
  key: string
  title: string
  href: string
  items: Product[]
  heading: 'light' | 'bold'
  badge?: string
  badgeClass?: string
}

function dedupeFill(list: Product[], pool: Product[], min: number): Product[] {
  const out = [...list]
  for (const p of pool) {
    if (out.length >= min) break
    if (!out.some((x) => x.id === p.id)) out.push(p)
  }
  return out
}

export function OnSaleRow({ onSelect, onAdd }: RowProps) {
  const { data, t } = useSite()
  const section = useStoreSection('onSale', 'grid')
  const visible = data.products.filter((p) => !p.hidden)
  const sale = visible.filter((p) => Boolean(p.oldPriceNum) && p.priceNum < p.oldPriceNum!)
  const items = dedupeFill(sale, visible, 4).slice(0, 12)
  if (!section.visible || items.length === 0) return null

  return (
    <section className="rm bg-white px-0 py-12 lg:py-14">
      <div className="rm-container">
        <h2 className="rm-h2">{t('onSale')}</h2>
        <div className="mt-9">
          <RamLayout mode={section.mode}>
            {items.map((p) => (
              <RamCard key={p.id} perfume={p} onSelect={onSelect} onAdd={onAdd} />
            ))}
          </RamLayout>
        </div>
        <RamViewAll href="#/price/sale" label={t('viewAll')} />
      </div>
    </section>
  )
}

export default function ProductRows({ onSelect, onAdd }: RowProps) {
  const { data, lang, t } = useSite()
  const layouts = data.settings.layouts ?? {}
  const visibility = data.settings.visibility ?? {}
  const visible = data.products.filter((p) => !p.hidden)
  const firstCat = data.categories[0]?.id ?? ''
  const lastCat = data.categories[data.categories.length - 1]?.id ?? ''

  const testers = visible.filter((p) => /tester|تستر/i.test(p.latin) || /تستر/i.test(p.name.ar))
  const fresh = visible.filter((p) => p.isNew)
  const best = visible.filter((p) => p.isBestSeller)
  const gifts = visible.filter((p) => /gift|set|coffret/i.test(p.latin) || /هدية|مجموعة/i.test(p.name.ar))
  const arabic = visible.filter((p) => p.categoryId === firstCat)
  const niche = visible.filter((p) => p.priceNum >= 400 || p.categoryId === lastCat)

  const allRows: Row[] = [
    {
      key: 'testers',
      title: t('testers'),
      href: '#/collections',
      items: testers.slice(0, 4),
      heading: 'bold',
      badge: lang === 'ar' ? 'تستر' : 'Tester',
      badgeClass: 'rm-badge-tester',
    },
    {
      key: 'new',
      title: t('newArrivals'),
      href: '#/collections/new',
      items: dedupeFill(fresh, visible, 4).slice(0, 4),
      heading: 'light',
    },
    {
      key: 'best',
      title: t('bestSellers'),
      href: '#/collections/best',
      items: dedupeFill(best, visible, 4).slice(0, 4),
      heading: 'light',
    },
    {
      key: 'gifts',
      title: t('giftSets'),
      href: '#/collections',
      items: dedupeFill(gifts, visible, 4).slice(0, 4),
      heading: 'light',
    },
    {
      key: 'arabic',
      title: t('arabicPerfumes'),
      href: firstCat ? categoryHref(firstCat) : '#/collections',
      items: dedupeFill(arabic, visible, 4).slice(0, 4),
      heading: 'light',
    },
    {
      key: 'niche',
      title: t('nichePerfumes'),
      href: '#/collections',
      items: dedupeFill(niche, visible, 4).slice(0, 4),
      heading: 'light',
    },
  ]

  const rows = allRows.filter((row) => row.items.length > 0 && visibility[row.key] !== false)

  if (rows.length === 0) return null

  return (
    <div className="rm bg-white pb-4">
      {rows.map((row, i) => (
        <div key={row.key}>
          {i > 0 && <RamDivider />}
          <section className="py-12 lg:py-14">
            <div className="rm-container">
              <h2
                className={
                  row.heading === 'bold'
                    ? 'rm-heading mx-auto text-center text-[clamp(1.5rem,2.6vw,1.85rem)] text-[#1c1c1c]'
                    : 'rm-h2'
                }
              >
                {row.title}
              </h2>
              <div className="mt-9">
                <RamLayout mode={(layouts[row.key] ?? 'grid') as 'rail' | 'grid'}>
                  {row.items.map((p) => (
                    <RamCard
                      key={p.id}
                      perfume={p}
                      onSelect={onSelect}
                      onAdd={onAdd}
                      badge={row.badge}
                      badgeClass={row.badgeClass}
                    />
                  ))}
                </RamLayout>
              </div>
              <RamViewAll href={row.href} label={t('viewAll')} />
            </div>
          </section>
        </div>
      ))}
    </div>
  )
}
