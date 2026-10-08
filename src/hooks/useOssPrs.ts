import { useEffect, useState } from 'react'
import type { OpenSourceContribution } from '../types'
import { applyLiveOssData, type OssPrSnapshot } from '../data/ossPrs'
import { experience } from '../data/experience'

const OSS_FALLBACK: OpenSourceContribution[] =
  experience.find(item => item.id === 'open-source')?.contributions ?? []

function isSnapshot(value: unknown): value is OssPrSnapshot {
  if (typeof value !== 'object' || value === null) return false
  return Array.isArray((value as OssPrSnapshot).prs)
}

/**
 * Live OSS contributions.
 *
 * Fetches the build-time GitHub snapshot (`public/oss-prs.json`, refreshed by
 * `npm run oss:fetch` / `prebuild`) — a same-origin static asset, no auth, a
 * single request, no retries. Until it loads (or if it fails), the static
 * fallback renders so the portfolio never breaks because of GitHub.
 */
export function useOssContributions(): OpenSourceContribution[] {
  const [contributions, setContributions] = useState<OpenSourceContribution[]>(() =>
    applyLiveOssData(OSS_FALLBACK, null),
  )

  useEffect(() => {
    const ctrl = new AbortController()
    let alive = true

    async function load() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}oss-prs.json`, {
          signal: ctrl.signal,
        })
        if (!res.ok) return
        const json: unknown = await res.json()
        if (!alive || !isSnapshot(json)) return
        setContributions(applyLiveOssData(OSS_FALLBACK, json))
      } catch {
        // Offline / aborted / invalid JSON → keep rendering the fallback.
      }
    }

    load()
    return () => {
      alive = false
      ctrl.abort()
    }
  }, [])

  return contributions
}
