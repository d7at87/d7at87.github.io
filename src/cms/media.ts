import { useEffect, useState } from 'react'

/**
 * Media storage in IndexedDB (much larger than localStorage).
 * References look like `media:<id>`. Plain paths/URLs/data-URLs pass through.
 */

const DB_NAME = 'ashour-media'
const STORE = 'files'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveMedia(blob: Blob): Promise<string> {
  const id = `m${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(blob, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
  return `media:${id}`
}

export async function getMedia(id: string): Promise<Blob | null> {
  try {
    const db = await openDB()
    const blob = await new Promise<Blob | null>((resolve) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(id)
      req.onsuccess = () => resolve((req.result as Blob) ?? null)
      req.onerror = () => resolve(null)
    })
    db.close()
    return blob
  } catch {
    return null
  }
}

const urlCache = new Map<string, string>()

/** Resolve any media ref (media:id, path, URL, data-URL) into a usable src. */
export function useMediaURL(ref: string | undefined): string {
  const [url, setUrl] = useState(() => (ref && !ref.startsWith('media:') ? ref : ''))

  useEffect(() => {
    if (!ref) {
      setUrl('')
      return
    }
    if (!ref.startsWith('media:')) {
      setUrl(ref)
      return
    }
    const id = ref.slice(6)
    const cached = urlCache.get(id)
    if (cached) {
      setUrl(cached)
      return
    }
    let live = true
    setUrl('')
    getMedia(id).then((blob) => {
      if (!blob || !live) return
      const u = URL.createObjectURL(blob)
      urlCache.set(id, u)
      setUrl(u)
    })
    return () => {
      live = false
    }
  }, [ref])

  return url
}

/** Downscale/compress an image to JPEG to keep storage small. */
export async function compressImage(file: File, maxDim = 900, quality = 0.82): Promise<Blob> {
  try {
    if (file.size < 250 * 1024) return file
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height))
    const w = Math.max(1, Math.round(bmp.width * scale))
    const h = Math.max(1, Math.round(bmp.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bmp, 0, 0, w, h)
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality))
    return blob ?? file
  } catch {
    return file
  }
}

export async function storageEstimate(): Promise<string> {
  try {
    const est = await navigator.storage.estimate()
    const used = ((est.usage ?? 0) / 1048576).toFixed(1)
    const quota = ((est.quota ?? 0) / 1048576).toFixed(0)
    return `${used} / ${quota} MB`
  } catch {
    return '—'
  }
}
