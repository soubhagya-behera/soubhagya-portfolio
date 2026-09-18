import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import './hacker-boot.css'

type Props = {
  onDone: () => void
}

const LINES = [
  { text: 'INITIALIZING SOUBHAGYA-DEV...', accent: false },
  { text: 'ESTABLISHING SECURE CONNECTION...', accent: false },
  { text: 'LOADING PORTFOLIO MODULES...', accent: false },
  { text: 'VERIFYING SYSTEM...', accent: false },
  { text: 'ACCESS GRANTED', accent: true },
] as const

export function HackerBoot({ onDone }: Props) {
  const reduced = usePrefersReducedMotion()
  const [visible, setVisible] = useState(reduced ? LINES.length : 0)
  const [showTitle, setShowTitle] = useState(reduced)
  const [progress, setProgress] = useState(reduced ? 100 : 0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // lock scroll while boot is visible
    const prevHtml = document.documentElement.style.overflow
    const prevBody = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      document.documentElement.style.overflow = prevHtml
      document.body.style.overflow = prevBody
    }
  }, [])

  useEffect(() => {
    if (reduced) {
      const t1 = window.setTimeout(() => setExiting(true), 380)
      const t2 = window.setTimeout(() => onDone(), 580)
      return () => {
        window.clearTimeout(t1)
        window.clearTimeout(t2)
      }
    }

    const timers: number[] = []

    // sequential line reveal — ~2.8s readable boot
    // 0.0s INITIALIZING → 0.5s CONNECTING → 1.0s LOADING → 1.5s VERIFYING → 2.0s ACCESS GRANTED
    const delays = [0, 500, 1000, 1500, 2000]
    delays.forEach((d, i) => {
      timers.push(
        window.setTimeout(() => setVisible(i + 1), d),
      )
    })

    // ACCESS GRANTED pause → title reveal at ~2.35s, then intentional pause before exit
    timers.push(window.setTimeout(() => setShowTitle(true), 2380))
    timers.push(window.setTimeout(() => setProgress(100), 2420))
    timers.push(window.setTimeout(() => setExiting(true), 2800))
    timers.push(window.setTimeout(() => onDone(), 3130))

    return () => timers.forEach(window.clearTimeout)
  }, [onDone, reduced])

  return (
    <div
      className={`hboot${exiting ? ' is-exiting' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Booting portfolio"
      aria-busy={!exiting}
    >
      <div className="hboot__scan" aria-hidden="true" />
      <div className="hboot__vignette" aria-hidden="true" />

      <div className="hboot__content">
        <div className="hboot__lines">
          {LINES.map((line, idx) => (
            <div
              key={line.text}
              className={`hboot__line${idx < visible ? ' is-visible' : ''}${line.accent ? ' is-accent' : ''}`}
            >
              <span className="hboot__prompt">&gt;</span>
              <span className="hboot__text">{line.text}</span>
              {line.accent && idx < visible && <span className="hboot__check" aria-hidden="true"> ✓</span>}
            </div>
          ))}
          {/* keep layout stable: placeholder for cursor line before title appears */}
          {!showTitle && visible > 0 && visible < LINES.length && (
            <div className="hboot__line is-visible">
              <span className="hboot__prompt">&gt;</span>
              <span className="hboot__cursor" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className={`hboot__reveal${showTitle ? ' is-visible' : ''}`}>
          <div className="hboot__title-row">
            <h1 className="hboot__title">SOUBHAGYA-DEV</h1>
            <span className="hboot__cursor hboot__cursor--title" aria-hidden="true" />
          </div>
          <p className="hboot__subtitle">JAVA FULL-STACK DEVELOPER</p>

          <div className="hboot__progress-wrap" aria-hidden="true">
            <div className="hboot__progress">
              <div className="hboot__progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="hboot__progress-meta">
              <span>[{'█'.repeat(20)}]</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
