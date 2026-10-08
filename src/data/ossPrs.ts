import type { OpenSourceContribution } from '../types'

/**
 * Open Source PR data layer.
 *
 * Source of truth: GitHub. A build-time script (`scripts/fetch-oss-prs.mjs`,
 * run via `npm run oss:fetch` / `prebuild`) snapshots the four canonical PRs
 * into `public/oss-prs.json`. The UI merges that snapshot over the static
 * fallback below, so the portfolio still renders when GitHub (or the
 * snapshot) is unavailable.
 *
 * No tokens are involved on the client: the snapshot is a same-origin static
 * asset fetched without authentication.
 */

export type OssPrStatus = OpenSourceContribution['status']

export interface OssPrMeta {
  contributionId: string
  repository: string
  number: number
  title: string
  state: 'open' | 'closed'
  merged: boolean
  created_at: string
  merged_at: string | null
  html_url: string
}

export interface OssPrSnapshot {
  fetchedAt: string
  prs: OssPrMeta[]
}

/** Canonical PR registry. Links always use the PR's html_url — never /issues/{n}. */
export const OSS_PRS = [
  { id: 'agentj-locale-keyword', owner: 'anirudhnshandilya', repo: 'agentj', number: 24 },
  { id: 'quarkus-artifact-metadata', owner: 'quarkusio', repo: 'quarkus', number: 57221 },
  { id: 'kestra-plugin-serdes', owner: 'kestra-io', repo: 'plugin-serdes', number: 423 },
  { id: 'mcp-java-testkit', owner: 'senor14', repo: 'mcp-java-testkit', number: 25 },
] as const

/**
 * Fallback created_at values (from GitHub) used only to keep the static
 * fallback ordered newest-first when no live snapshot is available.
 */
const FALLBACK_CREATED_AT: Record<string, string> = {
  'agentj-locale-keyword': '2026-10-08T06:14:16Z',
  'quarkus-artifact-metadata': '2026-10-07T13:27:20Z',
  'kestra-plugin-serdes': '2026-09-24T06:37:27Z',
  'mcp-java-testkit': '2026-09-20T08:00:25Z',
}

/** GitHub PR state → portfolio status. No invented statuses. */
export function resolveOssStatus(meta: Pick<OssPrMeta, 'state' | 'merged'>): OssPrStatus {
  if (meta.merged) return 'merged'
  if (meta.state === 'open') return 'open'
  return 'closed'
}

const MONTH_LABEL = [
  'Jan.',
  'Feb.',
  'Mar.',
  'Apr.',
  'May',
  'Jun.',
  'Jul.',
  'Aug.',
  'Sep.',
  'Oct.',
  'Nov.',
  'Dec.',
] as const

function formatDay(iso: string): string {
  const d = new Date(iso)
  return `${MONTH_LABEL[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

function formatDayNoYear(iso: string): string {
  const d = new Date(iso)
  return `${MONTH_LABEL[d.getUTCMonth()]} ${d.getUTCDate()}`
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  )
}

/**
 * Contribution period from GitHub timestamps.
 * - merged PR: created_at → merged_at (single date when merged the same day)
 * - open PR: created_at
 * updated_at is never used as the contribution date.
 */
export function formatOssPeriod(
  createdAt: string,
  mergedAt: string | null,
  status: OssPrStatus,
): string {
  if (status === 'merged' && mergedAt) {
    if (isSameDay(createdAt, mergedAt)) return formatDay(createdAt)
    const startYear = new Date(createdAt).getUTCFullYear()
    const endYear = new Date(mergedAt).getUTCFullYear()
    if (startYear === endYear) return `${formatDayNoYear(createdAt)} – ${formatDay(mergedAt)}`
    return `${formatDay(createdAt)} – ${formatDay(mergedAt)}`
  }
  return formatDay(createdAt)
}

function snapshotById(snapshot: OssPrSnapshot | null): Map<string, OssPrMeta> {
  const map = new Map<string, OssPrMeta>()
  snapshot?.prs.forEach(pr => {
    map.set(pr.contributionId, pr)
  })
  return map
}

/**
 * Merge a live GitHub snapshot over static fallback contributions.
 * Live data wins for status / period / link; anything without live data
 * keeps its fallback values. Result is ordered newest-first by created_at.
 */
export function applyLiveOssData(
  fallback: OpenSourceContribution[],
  snapshot: OssPrSnapshot | null,
): OpenSourceContribution[] {
  const byId = snapshotById(snapshot)
  const merged = fallback.map(contribution => {
    const meta = byId.get(contribution.id)
    if (!meta) return contribution
    const status = resolveOssStatus(meta)
    return {
      ...contribution,
      status,
      period: formatOssPeriod(meta.created_at, meta.merged_at, status),
      // Canonical PR URL straight from GitHub — never constructed via /issues/.
      link: meta.html_url,
    }
  })
  const createdAtOf = (contribution: OpenSourceContribution): number => {
    const meta = byId.get(contribution.id)
    const iso = meta?.created_at ?? FALLBACK_CREATED_AT[contribution.id]
    const ts = iso ? Date.parse(iso) : NaN
    return Number.isNaN(ts) ? 0 : ts
  }
  return [...merged].sort((a, b) => createdAtOf(b) - createdAtOf(a))
}
