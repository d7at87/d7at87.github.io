/**
 * Supabase backend (REST + Storage) — no SDK, plain fetch.
 *
 * Everything here is optional: when the two env vars are missing the app runs
 * in local mode exactly like before (localStorage + IndexedDB only).
 *
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJ...
 *
 * The anon key is public by design; row level security in supabase/schema.sql
 * decides who may write. See SYNC.md for the 10-minute setup.
 */

const BASE = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/+$/, '')
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const remoteConfigured = Boolean(BASE && ANON)

const SESSION_KEY = 'ashour-session'
const TABLE = 'site_state'
const ROW_ID = 'main'
const BUCKET = 'media'

export interface RemoteSession {
  access_token: string
  refresh_token: string
  expires_at: number
  email: string
}

export interface RemoteSite {
  data: unknown
  updatedAt: string
}

/* ------------------------------- session ------------------------------- */

export function getSession(): RemoteSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as RemoteSession
    if (!s || typeof s.access_token !== 'string' || typeof s.refresh_token !== 'string') return null
    return s
  } catch {
    return null
  }
}

function storeSession(s: RemoteSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

export function signOutRemote(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

function sessionFrom(
  json: { access_token: string; refresh_token: string; expires_in?: number; user?: { email?: string } },
  fallbackEmail: string,
): RemoteSession {
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: Date.now() + (json.expires_in ?? 3600) * 1000,
    email: json.user?.email ?? fallbackEmail,
  }
}

export async function signInRemote(email: string, password: string): Promise<RemoteSession> {
  const res = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    if (res.status === 400 || res.status === 401) throw new Error('البريد أو كلمة المرور غير صحيحة')
    throw new Error(`فشل تسجيل الدخول (${res.status})`)
  }
  const session = sessionFrom((await res.json()) as Parameters<typeof sessionFrom>[0], email)
  storeSession(session)
  return session
}

/** Valid access token, refreshed automatically when close to expiry. */
export async function getAccessToken(): Promise<string | null> {
  const session = getSession()
  if (!session) return null
  if (session.expires_at > Date.now() + 60_000) return session.access_token
  try {
    const res = await fetch(`${BASE}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    })
    if (!res.ok) {
      signOutRemote()
      return null
    }
    const next = sessionFrom((await res.json()) as Parameters<typeof sessionFrom>[0], session.email)
    storeSession(next)
    return next.access_token
  } catch {
    return null
  }
}

/* --------------------------------- data -------------------------------- */

export async function fetchSite(): Promise<RemoteSite | null> {
  const res = await fetch(`${BASE}/rest/v1/${TABLE}?id=eq.${ROW_ID}&select=data,updated_at`, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  })
  if (!res.ok) throw new Error(`تعذر تحميل بيانات الموقع (${res.status})`)
  const rows = (await res.json()) as { data: unknown; updated_at: string }[]
  if (!Array.isArray(rows) || rows.length === 0) return null
  return { data: rows[0].data, updatedAt: rows[0].updated_at }
}

export async function pushSite(data: unknown): Promise<void> {
  const token = await getAccessToken()
  if (!token) throw new Error('سجّل الدخول بحساب المشرف أولاً')
  const res = await fetch(`${BASE}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ id: ROW_ID, data, updated_at: new Date().toISOString() }),
  })
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('لا تملك صلاحية النشر — أضف حسابك إلى جدول admins')
    const detail = await res.text().catch(() => '')
    throw new Error(`فشل النشر (${res.status})${detail ? `: ${detail.slice(0, 140)}` : ''}`)
  }
}

/* -------------------------------- storage ------------------------------- */

function extFor(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('png')) return 'png'
  if (t.includes('webp')) return 'webp'
  if (t.includes('jpeg') || t.includes('jpg')) return 'jpg'
  if (t.includes('mp4')) return 'mp4'
  if (t.includes('quicktime')) return 'mov'
  if (t.includes('webm')) return 'webm'
  return 'bin'
}

/** Upload a blob to the public `media` bucket and return its public URL. */
/** Public storage URL of an object (used to check usage in the admin). */
export function mediaPublicUrl(name: string): string {
  return `${BASE}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(name)}`
}

function uploadErrorMessage(status: number, detail: string): string {
  const text = `${status} ${detail}`.toLowerCase()
  if (status === 413 || /quota|exceed|limit|storage/.test(text)) {
    return `حصّة التخزين في Supabase ممتلئة (ربما على باقة Free). قم بترقية الخطة أو احذف الفيديوهات القديمة من «الوسائط في السحابة» (${status})`
  }
  return `فشل رفع الملف (${status})${detail ? `: ${detail.slice(0, 140)}` : ''}`
}

export async function uploadMedia(blob: Blob): Promise<string> {
  const token = await getAccessToken()
  if (!token) throw new Error('سجّل الدخول أولاً لرفع الملفات')
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${extFor(blob.type)}`
  const res = await fetch(`${BASE}/storage/v1/object/${BUCKET}/${name}`, {
    method: 'POST',
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${token}`,
      'Content-Type': blob.type || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: blob,
  })
  if (!res.ok) throw new Error(uploadErrorMessage(res.status, await res.text().catch(() => '')))
  return mediaPublicUrl(name)
}

export interface MediaObject {
  name: string
  size: number
}

function mediaName(o: Record<string, unknown>): string {
  for (const k of ['name', 'key', 'id', 'path'] as const) {
    const v = o[k]
    if (typeof v === 'string' && v) return v
  }
  return ''
}

function mediaSize(o: Record<string, unknown>): number {
  const m = o.metadata as { size?: number } | undefined
  const n = o.size ?? m?.size
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

/** List media objects in the bucket (read-only — for the admin cleanup UI). */
export async function listMediaObjects(): Promise<MediaObject[]> {
  const token = await getAccessToken()
  const res = await fetch(`${BASE}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${token ?? ANON}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prefix: '', limit: 1000 }),
  })
  if (!res.ok) throw new Error(`فشل قراءة قائمة الملفات (${res.status})`)
  const rows = (await res.json()) as unknown[]
  if (!Array.isArray(rows)) return []
  return rows.map((o) => ({ name: mediaName(o as Record<string, unknown>), size: mediaSize(o as Record<string, unknown>) }))
}

/** Delete one media object (only the file — the URL disappears for everyone). */
export async function deleteMedia(name: string): Promise<void> {
  const token = await getAccessToken()
  if (!token) throw new Error('سجّل الدخول أولاً للحذف')
  const res = await fetch(`${BASE}/storage/v1/object/v1/${BUCKET}/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: { apikey: ANON, Authorization: `Bearer ${token}` },
  })
  if (res.status === 404) throw new Error('لم يُجده في التخزين الحالي')
  if (!res.ok) throw new Error(`فشل الحذف (${res.status})`)
}
