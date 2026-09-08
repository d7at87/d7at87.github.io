import type { Product } from '../cms/types'
import { useMediaURL } from '../cms/media'
import BottleSVG from './BottleSVG'

/** Product visual: uploaded photo when present, procedural bottle otherwise. */
export default function ProductImage({ p, className }: { p: Product; className?: string }) {
  const url = useMediaURL(p.image)
  if (url) {
    return <img src={url} alt="" loading="lazy" className={`${className ?? ''} object-contain`} />
  }
  return <BottleSVG variant={p.variant} accent={p.colors.accent} liquid={p.colors.liquid} className={className} />
}
