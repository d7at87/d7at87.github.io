type FSVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void }

/** Open a video in fullscreen with sound + native controls (desktop & iOS/Android). */
export function playFullscreen(v: HTMLVideoElement): void {
  try {
    v.muted = false
  } catch {
    /* ignore */
  }
  v.controls = true
  try {
    const p = v.play()
    if (p) p.catch(() => undefined)
  } catch {
    /* ignore */
  }
  const el = v as FSVideo
  if (document.fullscreenEnabled && v.requestFullscreen) {
    v.requestFullscreen().catch(() => {
      try {
        el.webkitEnterFullscreen?.()
      } catch {
        /* ignore */
      }
    })
  } else {
    try {
      el.webkitEnterFullscreen?.()
    } catch {
      /* ignore */
    }
  }
}

/** Restore inline muted autoplay state after leaving fullscreen. */
export function restoreInline(v: HTMLVideoElement): void {
  v.controls = false
  try {
    v.muted = true
  } catch {
    /* ignore */
  }
  try {
    const p = v.play()
    if (p) p.catch(() => undefined)
  } catch {
    /* ignore */
  }
}
