import type { SiteData } from './types'
import { getMedia } from './media'
import { remoteConfigured, uploadMedia } from './remote'

/**
 * Media uploaded before the cloud backend was enabled lives in IndexedDB as
 * `media:<id>`. Those references mean nothing to visitors, so before every
 * publish we push the blobs to the storage bucket and rewrite the references
 * to public URLs.
 */

const PREFIX = 'media:'

export interface MigrateResult {
  data: SiteData
  moved: number
  failed: number
}

export async function migrateMediaToRemote(data: SiteData): Promise<MigrateResult> {
  if (!remoteConfigured) return { data, moved: 0, failed: 0 }

  const next = structuredClone(data)
  let moved = 0
  let failed = 0

  const fix = async (ref: string | undefined): Promise<string | undefined> => {
    if (!ref || !ref.startsWith(PREFIX)) return ref
    const blob = await getMedia(ref.slice(PREFIX.length))
    if (!blob) {
      failed += 1
      return ref
    }
    try {
      const url = await uploadMedia(blob)
      moved += 1
      return url
    } catch {
      failed += 1
      return ref
    }
  }

  for (const p of next.products) {
    p.image = await fix(p.image)
  }
  for (const v of next.videos) {
    v.src = (await fix(v.src)) ?? v.src
    v.poster = await fix(v.poster)
  }
  next.settings.heroBg.image = (await fix(next.settings.heroBg.image)) ?? ''
  next.settings.heroBg.video = (await fix(next.settings.heroBg.video)) ?? ''

  return { data: next, moved, failed }
}
