import { useEffect, useMemo, useState } from 'react'
import { Reveal } from '../ui/Reveal'
import { Sticker } from '../ui/Sticker'
import './github.css'

type Stats = {
  repos: number | null
  contributions: number | null
  languages: number | null
  commits: number | null
}

type Day = {
  date: string
  count: number
  level: number
}

const GH_USER = 'soubhagya-behera'
const CONTRIB_API = `https://github-contributions-api.jogruber.de/v4/${GH_USER}`

function getLast120DaysRange() {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const start = new Date(end)
  start.setDate(end.getDate() - 119)
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

function toISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

function levelForCount(count: number): number {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 6) return 2
  if (count <= 9) return 3
  return 4
}

export function GitHubSection() {
  const [stats, setStats] = useState<Stats>({
    repos: null,
    contributions: null,
    languages: null,
    commits: null,
  })
  const [days, setDays] = useState<Day[]>([])
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const range = useMemo(() => getLast120DaysRange(), [])
  const rangeLabel = useMemo(() => {
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    return `${fmt(range.start)} — ${fmt(range.end)}`
  }, [range])

  useEffect(() => {
    const ctrl = new AbortController()
    let alive = true

    async function fetchAll() {
      try {
        const [userRes, reposRes, contribRes] = await Promise.allSettled([
          fetch(`https://api.github.com/users/${GH_USER}`, { signal: ctrl.signal, headers: { Accept: 'application/vnd.github.v3+json' } }),
          fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100`, { signal: ctrl.signal, headers: { Accept: 'application/vnd.github.v3+json' } }),
          fetch(CONTRIB_API, { signal: ctrl.signal }),
        ])

        let repos: number | null = null
        let languages: number | null = null
        let contributions: number | null = null
        let commits: number | null = null
        let contribDays: Day[] = []

        if (userRes.status === 'fulfilled' && userRes.value.ok) {
          try {
            const j = await userRes.value.json()
            if (typeof j.public_repos === 'number') repos = j.public_repos
          } catch {}
        }

        if (reposRes.status === 'fulfilled' && reposRes.value.ok) {
          try {
            const arr = await reposRes.value.json()
            if (Array.isArray(arr)) {
              const langs = new Set<string>()
              arr.forEach((r: { language?: string | null }) => {
                if (r.language) langs.add(r.language)
              })
              languages = langs.size
            }
          } catch {}
        }

        if (contribRes.status === 'fulfilled' && contribRes.value.ok) {
          try {
            const j = await contribRes.value.json()
            const list: Day[] = Array.isArray(j.contributions) ? j.contributions : []
            if (list.length) {
              const map = new Map<string, Day>()
              let totalAll = 0
              list.forEach((d: Day) => {
                map.set(d.date, d)
                totalAll += d.count || 0
              })
              commits = totalAll

              const startISO = toISO(range.start)
              const endISO = toISO(range.end)
              let sum4m = 0
              const windowDays: Day[] = []
              // Build window from start to end, using real levels where available else 0
              const cur = new Date(range.start)
              while (cur <= range.end) {
                const iso = toISO(cur)
                const found = map.get(iso)
                const count = found ? found.count : 0
                const level = found ? found.level : levelForCount(count)
                windowDays.push({ date: iso, count, level })
                if (iso >= startISO && iso <= endISO) sum4m += count
                cur.setDate(cur.getDate() + 1)
              }
              contributions = sum4m
              contribDays = windowDays
            }
          } catch {}
        }

        // Fallback: if contributions API failed, still build empty window so heatmap renders gracefully
        if (!contribDays.length) {
          const cur = new Date(range.start)
          const windowDays: Day[] = []
          while (cur <= range.end) {
            windowDays.push({ date: toISO(cur), count: 0, level: 0 })
            cur.setDate(cur.getDate() + 1)
          }
          contribDays = windowDays
        }

        if (!alive) return
        setStats({ repos, contributions, languages, commits })
        setDays(contribDays)
        setHasError(false)
      } catch {
        if (!alive) return
        setHasError(true)
      } finally {
        if (alive) setLoading(false)
      }
    }

    fetchAll()
    return () => {
      alive = false
      ctrl.abort()
    }
  }, [range.start, range.end])

  const weeks = useMemo(() => {
    if (!days.length) return [] as Day[][]
    // Align to Monday-start weeks for clean columns
    const first = new Date(days[0].date)
    const dayOfWeek = (first.getDay() + 6) % 7 // 0=Mon
    const padded: (Day | null)[] = Array(dayOfWeek).fill(null)
    const all: (Day | null)[] = [...padded, ...days]
    // Pad tail to complete weeks
    while (all.length % 7 !== 0) all.push(null)
    const out: Day[][] = []
    for (let i = 0; i < all.length; i += 7) {
      out.push(all.slice(i, i + 7) as Day[])
    }
    return out
  }, [days])

  const monthLabels = useMemo(() => {
    if (!weeks.length) return [] as string[]
    const seen = new Set<string>()
    return weeks.map((col, i) => {
      const daysInCol = col.filter(Boolean) as Day[]
      if (!daysInCol.length) return ''
      // First column: always label its month (covers partial start month like May)
      if (i === 0) {
        const d = new Date(daysInCol[0].date)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        seen.add(key)
        return d.toLocaleDateString('en-US', { month: 'short' })
      }
      // For other columns: label if column contains a day 1–7 whose month hasn't been labeled yet
      const candidate = daysInCol.find((d) => {
        const dt = new Date(d.date)
        return dt.getDate() >= 1 && dt.getDate() <= 7
      })
      if (!candidate) return ''
      const dt = new Date(candidate.date)
      const key = `${dt.getFullYear()}-${dt.getMonth()}`
      if (seen.has(key)) return ''
      seen.add(key)
      return dt.toLocaleDateString('en-US', { month: 'short' })
    })
  }, [weeks])

  return (
    <section id="github" className="section gh">
      <div className="container">
        <Reveal className="gh__eyebrow">
          <Sticker accent="cobalt" rotate={-1.5}>06 / GITHUB</Sticker>
        </Reveal>

        <Reveal delay={60}>
          <h2 className="display-xl gh__title">WHERE THE CODE GETS SHIPPED.</h2>
        </Reveal>

        <Reveal delay={110}>
          <p className="lead gh__sub">A snapshot of my public repositories, commit activity and contribution graph.</p>
        </Reveal>

        <div className="gh__stats" role="list" aria-label="GitHub statistics">
          <Reveal className="gh-stat" delay={140}>
            <div className="gh-stat__card">
              <Sticker accent="coral" rotate={-2}>PUBLIC REPOS</Sticker>
              <span className="gh-stat__value">{stats.repos !== null ? stats.repos : loading ? '—' : '—'}</span>
            </div>
          </Reveal>
          <Reveal className="gh-stat" delay={200}>
            <div className="gh-stat__card">
              <Sticker accent="cobalt" rotate={2}>CONTRIBUTIONS</Sticker>
              <span className="gh-stat__value">{stats.contributions !== null ? stats.contributions : loading ? '—' : '—'}</span>
            </div>
          </Reveal>
          <Reveal className="gh-stat" delay={260}>
            <div className="gh-stat__card">
              <Sticker accent="yellow" rotate={-1.5}>LANGUAGES</Sticker>
              <span className="gh-stat__value">{stats.languages !== null ? stats.languages : loading ? '—' : '—'}</span>
            </div>
          </Reveal>
          <Reveal className="gh-stat" delay={320}>
            <div className="gh-stat__card">
              <Sticker accent="mint" rotate={1.5}>COMMITS</Sticker>
              <span className="gh-stat__value">{stats.commits !== null ? stats.commits : loading ? '—' : '—'}</span>
            </div>
          </Reveal>
        </div>

        <Reveal className="gh__activity-head" delay={360}>
          <h3 className="gh__activity-title">GITHUB ACTIVITY</h3>
          <p className="mono gh__activity-sub">Last 120 days <span className="gh__activity-range">· {rangeLabel}</span></p>
        </Reveal>

        <Reveal delay={420}>
          <div className="gh__heatmap-wrap">
            <div className="gh__heatmap" role="img" aria-label={`GitHub contribution heatmap for last 120 days, ${days.filter(d=>d.count>0).length} active days`}>
              {loading && days.length === 0 ? (
                <div className="gh__heatmap-loading mono">Loading activity…</div>
              ) : hasError && !days.length ? (
                <div className="gh__heatmap-loading mono">GitHub data unavailable</div>
              ) : (
                <>
                  <div className="gh__heatmap-months mono" aria-hidden="true" style={{ ['--weeks' as string]: weeks.length } as React.CSSProperties}>
                    {monthLabels.map((label, i) => (
                      <span key={i} className="gh__heatmap-month">{label}</span>
                    ))}
                  </div>
                  <div className="gh__heatmap-grid" style={{ ['--weeks' as string]: weeks.length } as React.CSSProperties}>
                    {weeks.map((col, ci) => (
                      <div key={ci} className="gh__heatmap-col">
                        {col.map((day, ri) => {
                          if (!day) return <span key={ri} className="gh__cell gh__cell--empty" aria-hidden="true" />
                          return (
                            <span
                              key={day.date}
                              className={`gh__cell gh__cell--${day.level}`}
                              title={`${day.date}: ${day.count} contribution${day.count===1 ? '' : 's'}`}
                              aria-label={`${day.date}: ${day.count}`}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="gh__legend mono" aria-hidden="true">
              <span>Less</span>
              <span className="gh__legend-cells">
                <i className="gh__cell gh__cell--0 gh__cell--legend" />
                <i className="gh__cell gh__cell--1 gh__cell--legend" />
                <i className="gh__cell gh__cell--2 gh__cell--legend" />
                <i className="gh__cell gh__cell--3 gh__cell--legend" />
                <i className="gh__cell gh__cell--4 gh__cell--legend" />
              </span>
              <span>More</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
