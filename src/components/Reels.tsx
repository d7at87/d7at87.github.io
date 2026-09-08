import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { VideoItem } from '../cms/types'
import { useSite } from '../cms/store'
import { useMediaURL } from '../cms/media'
import { playFullscreen, restoreInline } from '../video-fullscreen'

function ReelCard({
  v,
  index,
  register,
}: {
  v: VideoItem
  index: number
  register: (id: string, el: HTMLVideoElement | null) => void
}) {
  const { L } = useSite()
  const src = useMediaURL(v.src)
  const poster = useMediaURL(v.poster)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: (index % 4) * 0.08, duration: 0.5 }}
      className="relative w-52 shrink-0 snap-start overflow-hidden bg-ink-950 sm:w-60"
    >
      {src ? (
        <video
          ref={(el) => register(v.id, el)}
          src={src}
          poster={poster || undefined}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          onClick={(e) => playFullscreen(e.currentTarget)}
          className="aspect-[9/16] w-full cursor-pointer object-cover"
        />
      ) : (
        <div className="aspect-[9/16] w-full animate-pulse bg-ink-950" />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pt-12">
        <p className="font-royal text-xl font-bold leading-snug text-white">{L(v.title)}</p>
      </div>
    </motion.div>
  )
}

export default function Reels() {
  const { L, data } = useSite()
  const r = data.content.reels
  const list = data.videos
  const els = useRef<Map<string, HTMLVideoElement>>(new Map())

  const register = (id: string, el: HTMLVideoElement | null) => {
    if (el) els.current.set(id, el)
    else els.current.delete(id)
  }

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const v = en.target as HTMLVideoElement
          if (en.isIntersecting) {
            if (v.muted) v.play().catch(() => undefined)
          } else {
            v.pause()
          }
        })
      },
      { threshold: 0.35 },
    )
    const onFsExit = () => {
      if (!document.fullscreenElement) els.current.forEach((v) => restoreInline(v))
    }
    const onWebkitEnd = (e: Event) => restoreInline(e.currentTarget as HTMLVideoElement)
    els.current.forEach((el) => {
      obs.observe(el)
      el.addEventListener('webkitendfullscreen', onWebkitEnd)
    })
    document.addEventListener('fullscreenchange', onFsExit)
    return () => {
      obs.disconnect()
      document.removeEventListener('fullscreenchange', onFsExit)
      els.current.forEach((el) => el.removeEventListener('webkitendfullscreen', onWebkitEnd))
    }
  }, [list])

  if (list.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-6 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="eyebrow text-gold-600">{L(r.eyebrow)}</p>
        <h2 className="mt-4 font-royal text-5xl font-bold text-ink-950 lg:text-6xl">
          {L(r.title1)} <span className="text-gold-gradient">{L(r.title2)}</span>
        </h2>
        <div className="mx-auto mt-5 h-px w-20 bg-gold-500" />
      </motion.div>

      <div className="scrollbar-hide mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
        {list.map((v, i) => (
          <ReelCard key={v.id} v={v} index={i} register={register} />
        ))}
      </div>
    </section>
  )
}
