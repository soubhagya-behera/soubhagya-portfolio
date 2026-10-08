import { Fragment } from 'react'
import { Briefcase, GitPullRequest, GraduationCap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'
import { Sticker } from '../ui/Sticker'
import { ExperienceCard } from './ExperienceCard'
import { experience } from '../../data/experience'
import { useOssContributions } from '../../hooks/useOssPrs'
import type { ExperienceItem } from '../../types'
import './experience.css'

type ExperienceKind = ExperienceItem['kind']

interface ExperienceGroup {
  kind: ExperienceKind
  label: string
  accent: 'coral' | 'cobalt' | 'mint'
  Icon: LucideIcon
}

const GROUPS: ExperienceGroup[] = [
  { kind: 'independent', label: 'Open Source', accent: 'mint', Icon: GitPullRequest },
  { kind: 'internship', label: 'Internship', accent: 'coral', Icon: Briefcase },
  { kind: 'education', label: 'Education', accent: 'cobalt', Icon: GraduationCap },
]

export function Experience() {
  const ossContributions = useOssContributions()
  return (
    <section id="experience" className="section experience">
      <div className="container">
        <SectionHeader
          index="04"
          label="Experience & Open Source"
          accent="mint"
          deco="zigzag"
          decoColor="var(--mint)"
          title="The road so far."
          subtitle="Hands-on engineering through an internship, open source, and an MCA."
        />
        <ol className="timeline">
          {GROUPS.map(group => {
            const items = experience.filter(item => item.kind === group.kind)
            if (items.length === 0) return null
            const { Icon } = group
            return (
              <Fragment key={group.kind}>
                <li className="timeline__group">
                  <Sticker accent={group.accent} rotate={-2}>
                    <Icon size={13} aria-hidden="true" /> {group.label}
                  </Sticker>
                </li>
                {items.map((item, index) => (
                  <li key={item.id} className="timeline__item">
                    <span className={`timeline__node timeline__node--${item.kind}`} aria-hidden="true" />
                    <Reveal delay={index * 100}>
                      <ExperienceCard
                        item={item}
                        contributions={item.id === 'open-source' ? ossContributions : undefined}
                      />
                    </Reveal>
                  </li>
                ))}
              </Fragment>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
