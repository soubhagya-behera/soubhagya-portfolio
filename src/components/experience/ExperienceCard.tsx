import { ArrowUpRight, Calendar, GitMerge, GitPullRequest, MapPin } from 'lucide-react'
import type { ExperienceItem, OpenSourceContribution } from '../../types'

interface ExperienceCardProps {
  item: ExperienceItem
  contributions?: OpenSourceContribution[]
}

const PULL_REQUEST_NUMBER = /\/pull\/(\d+)/

const STATUS_META = {
  merged: { label: 'Merged', Icon: GitMerge },
  open: { label: 'Open', Icon: GitPullRequest },
  closed: { label: 'Closed', Icon: GitPullRequest },
} as const

function ContributionBlock({ contribution }: { contribution: OpenSourceContribution }) {
  const pullNumber = PULL_REQUEST_NUMBER.exec(contribution.link)?.[1]
  const statusMeta = STATUS_META[contribution.status]
  const StatusIcon = statusMeta.Icon

  return (
    <li className="xp-card__oss-item">
      <h4 className="xp-card__oss-title">{contribution.project}</h4>

      <div className="xp-card__oss-meta">
        <p className="xp-card__oss-date mono">
          <Calendar size={12} aria-hidden="true" /> {contribution.period}
        </p>
        {pullNumber ? (
          <a
            className={`xp-card__pr mono xp-card__pr--${contribution.status}`}
            href={contribution.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <StatusIcon size={12} aria-hidden="true" />
            {statusMeta.label} · PR #{pullNumber}
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        ) : null}
      </div>

      <p className="xp-card__oss-summary">{contribution.summary}</p>

      {contribution.technologies.length > 0 && (
        <ul className="xp-card__tech xp-card__oss-tech">
          {contribution.technologies.map(technology => (
            <li key={technology} className="chip">
              {technology}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export function ExperienceCard({ item, contributions: contributionsOverride }: ExperienceCardProps) {
  const contributions = contributionsOverride ?? item.contributions ?? []
  const hasContributions = contributions.length > 0
  const className = ['xp-card', `xp-card--${item.kind}`, item.size === 'compact' ? 'xp-card--compact' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <article className={className}>
      {hasContributions ? (
        <>
          <header className="xp-card__head">
            <h3 className="display-lg">{item.role}</h3>
            <p className="xp-card__period mono">{item.period}</p>
          </header>
          <ul className="xp-card__oss">
            {contributions.map(contribution => (
              <ContributionBlock key={contribution.id} contribution={contribution} />
            ))}
          </ul>
        </>
      ) : (
        <>
          <header className="xp-card__head">
            <p className="xp-card__period mono">{item.period}</p>
          </header>

          <h3 className="display-lg">{item.role}</h3>
          <p className="xp-card__org">{item.org}</p>

          <div className="xp-card__meta">
            <p className="xp-card__loc mono">
              <MapPin size={13} aria-hidden="true" /> {item.location}
            </p>
          </div>

          {item.description ? <p className="xp-card__desc">{item.description}</p> : null}

          {item.achievements.length > 0 &&
            (item.kind === 'education' ? (
              <ul className="xp-card__facts mono">
                {item.achievements.map(achievement => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            ) : (
              <ul className="xp-card__list">
                {item.achievements.map(achievement => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            ))}
        </>
      )}

      {item.technologies.length > 0 && (
        <ul className="xp-card__tech">
          {item.technologies.map(technology => (
            <li key={technology} className="chip">
              {technology}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
