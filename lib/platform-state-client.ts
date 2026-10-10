import { INITIAL_PLATFORM_STATE, PlatformStateData } from './platform-store'

const LOCAL_STORAGE_KEY = 'maestrotech_platform_state_v2'

let cachedState: PlatformStateData | null = null

function getBaseUrl(): string {
  if (typeof window !== 'undefined') return ''
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export async function fetchPlatformState(): Promise<PlatformStateData> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/platform-state`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const data = (await res.json()) as PlatformStateData
      cachedState = data
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
        } catch {
          // ignore storage quota errors
        }
      }
      return data
    }
  } catch {
    // Fallback a localStorage o memoria
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as PlatformStateData
        cachedState = parsed
        return parsed
      }
    } catch {
      // ignore
    }
  }

  if (!cachedState) {
    cachedState = structuredClone(INITIAL_PLATFORM_STATE)
  }
  return cachedState
}

export async function mutatePlatformState(
  action: string,
  payload: unknown
): Promise<PlatformStateData> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/platform-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    })
    if (res.ok) {
      const json = await res.json()
      if (json.state) {
        cachedState = json.state as PlatformStateData
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cachedState))
          } catch {
            // ignore
          }
        }
        return cachedState
      }
    }
  } catch {
    // Fallback local si el servidor no responde
  }

  const current = await fetchPlatformState()
  return current
}
