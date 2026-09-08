import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ChevronDown, Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useSite } from '../cms/store'
import { useMediaURL } from '../cms/media'
import { playFullscreen, restoreInline } from '../video-fullscreen'

const SPARKS = Array.from({ length: 14 }, (_, i) => i)

export default function Hero() {
  const { L, data } = useSite()
  const c = data.content.hero
  const bg = data.settings.heroBg
  const isVideo = bg.type === 'video'
  const bgVideo = useMediaURL(isVideo ? bg.video : '')
  const bgImage = useMediaURL(bg.image)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 50, damping: 20 })
  const sy = useSpring(my, { stiffness: 50, damping: 20 })

  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const v = videoRef.current
    if (!v || !bgVideo) return
    v.muted = true
    v.play().catch(() => setPlaying(false))
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onFsExit = () => {
      if (!document.fullscreenElement) {
        restoreInline(v)
        setMuted(true)
      }
    }
    const onWebkitEnd = () => {
      restoreInline(v)
      setMuted(true)
    }
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    document.addEventListener('fullscreenchange', onFsExit)
    v.addEventListener('webkitendfullscreen', onWebkitEnd)
    return () => {
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      document.removeEventListener('fullscreenchange', onFsExit)
      v.removeEventListener('webkitendfullscreen', onWebkitEnd)
    }
  }, [bg.video, bgVideo])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => undefined)
    else v.pause()
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const openFullscreen = () => {
    const v = videoRef.current
    if (v && isVideo) playFullscreen(v)
  }

  const onBgTap = (e: { target: EventTarget | null }) => {
    const el = e.target as HTMLElement | null
    if (!el || typeof (el as HTMLElement).closest !== 'function') return
    if ((el as HTMLElement).closest('a,button,input,textarea,select')) return
    if (typeof window !== 'undefined' && window.getSelection()?.toString()) return
    openFullscreen()
  }

  return (
    <section
      id="home"
      onClick={onBgTap}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(((e.clientX - r.left) / r.width - 0.5) * 22)
        my.set(((e.clientY - r.top) / r.height - 0.5) * 14)
      }}
      className="relative h-svh min-h-[620px] overflow-hidden bg-night-950"
    >
      <motion.div style={{ x: sx, y: sy }} className="absolute -inset-[4%]">
        {isVideo && bgVideo ? (
          <motion.video
            key={bg.video}
            ref={videoRef}
            src={bgVideo}
            poster={bgImage || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            initial={{ scale: 1.1 }}
            animate={{ scale: [1.1, 1.16, 1.1] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
            className="size-full object-cover object-center"
          />
        ) : bgImage ? (
          <motion.img
            key={bg.image}
            src={bgImage}
            alt=""
            initial={{ scale: 1.12 }}
            animate={{ scale: [1.12, 1.18, 1.12] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
            className="size-full object-cover object-center"
          />
        ) : null}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-night-950/30" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/30 to-night-950/40 lg:bg-[linear-gradient(to_left,rgba(10,8,6,0.95)_0%,rgba(10,8,6,0.55)_40%,transparent_68%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-night-950/80 to-transparent" />

      {isVideo && (
        <div className="absolute top-24 start-6 z-20 flex gap-2">
          <button
            onClick={togglePlay}
            aria-label="play-pause"
            className="grid size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25"
          >
            {playing ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <button
            onClick={toggleMute}
            aria-label="mute"
            className="grid size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25"
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <button
            onClick={openFullscreen}
            aria-label="fullscreen"
            className="grid size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25"
          >
            <Maximize2 size={17} />
          </button>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0">
        {SPARKS.map((i) => (
          <span
            key={i}
            className="dust"
            style={{
              left: `${(i * 53 + 7) % 100}%`,
              top: `${(i * 37 + 11) % 100}%`,
              animationDelay: `${(i % 6) * -1.3}s`,
              animationDuration: `${7 + (i % 4) * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-6 pb-24 lg:items-center lg:pb-0">
        <div className="max-w-xl [text-shadow:0_4px_30px_rgba(0,0,0,0.65)]">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="eyebrow text-gold-300"
          >
            {L(c.eyebrow)}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-5 font-royal text-6xl font-bold leading-[1.2] text-ivory-50 lg:text-8xl"
          >
            {L(c.title1)}
            <br />
            {L(c.title2)}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-6 h-px w-24 origin-right bg-gold-400"
          />

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-5 max-w-md text-lg leading-8 text-ivory-100/75"
          >
            {L(c.sub)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <a
              href="#collection"
              className="bg-ivory-50 px-9 py-3.5 text-sm font-bold tracking-wide text-ink-950 transition hover:bg-gold-300"
            >
              {L(c.cta1)}
            </a>
            <a
              href="#maison"
              className="border border-ivory-50/50 px-9 py-3.5 text-sm font-bold tracking-wide text-ivory-50 backdrop-blur transition hover:border-ivory-50 hover:bg-white/10"
            >
              {L(c.cta2)}
            </a>
          </motion.div>
        </div>
      </div>

      <motion.a
        href="#collection"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 text-ivory-100/60 transition hover:text-ivory-100 sm:block"
      >
        <span className="eyebrow mb-1 block text-center">{L(c.scroll)}</span>
        <ChevronDown size={20} className="mx-auto animate-bounce" />
      </motion.a>
    </section>
  )
}
