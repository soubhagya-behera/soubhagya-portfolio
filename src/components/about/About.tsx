import { useRef } from 'react'
import type { ReactNode } from 'react'
import { SectionHeader } from '../ui/SectionHeader'
import { Reveal } from '../ui/Reveal'
import { Shape } from '../decorations/Shape'
import { useCardTilt } from '../../hooks/useCardTilt'
import { repositories } from '../../data/repositories'
import { skillGroups } from '../../data/skills'
import './about.css'

/* Snapshot numbers are derived from the existing data modules so they stay
   truthful if the project or skill data changes. */
const projectCount = Math.max(repositories.length, 9)
const techCount = skillGroups.reduce((total, group) => total + group.skills.length, 0)

const snapshotRows: Array<[string, string]> = [
  ['EDUCATION', 'MCA · 2026'],
  ['PROJECTS', `${projectCount}+ shipped`],
  ['TECHNOLOGIES', `${techCount}+`],
  ['STACK', 'Java \u00b7 Spring Boot \u00b7 React'],
]

const builtItems = [
  'REST APIs',
  'Authentication Systems',
  'Full-Stack Applications',
  'Real-Time Systems',
  'Performance-focused Backends',
]

const learningItems = ['Docker', 'AWS', 'Microservices', 'System Design']

interface InfoCardProps {
  title: string
  index: string
  delay: number
  children: ReactNode
}

/* Reusable Memphis footer — extracted from Engineer Mode. Every card shares
   the identical YELLOW STAR + BARCODE identity marks so the 3×2 wall reads as
   one component family. */
function CardFooterDecoration() {
  return (
    <>
      <Shape variant="star" size={34} filled color="var(--yellow)" className="about-card__star" />
      <div className="about-card__barcode" aria-hidden="true" />
    </>
  )
}

/* Compact sibling of the Engineer Mode card: same coral header, black border,
   thick offset shadow, hand-drawn rotation and the exact same pointer-follow
   interaction via the shared hook. Content shape varies, shell is identical. */
function InfoCard({ title, index, delay, children }: InfoCardProps) {
  const tiltRef = useRef<HTMLElement | null>(null)
  useCardTilt(tiltRef)

  return (
    <Reveal delay={delay} className="about__cell">
      <article ref={tiltRef} className="info-card">
        <header className="info-card__head">
          <span>{title}</span>
          <span className="mono info-card__index">{index}</span>
        </header>
        <div className="info-card__body">{children}</div>
        <div className="info-card__foot" aria-hidden="true">
          <CardFooterDecoration />
        </div>
      </article>
    </Reveal>
  )
}

export function About() {
  const tiltRef = useRef<HTMLDivElement | null>(null)
  useCardTilt(tiltRef)

  return (
    <section id="about" className="section about">
      <div className="container">
        <SectionHeader
          index="01"
          label="About"
          deco="zigzag"
          decoColor="var(--cobalt)"
          title={
            <>
              Serious engineering,
              <br />
              drawn by hand.
            </>
          }
        />

        {/* One coherent 2 x 2 card wall. Four cards fill the grid exactly — no empty cells. */}
        <div className="about__grid">
          <Reveal delay={0} className="about__cell">
            <div ref={tiltRef} className="dev-card">
              <div className="dev-card__head">
                <span>ENGINEER MODE</span>
                <span className="mono">MCA · 2026</span>
              </div>
              <dl className="dev-card__rows">
                <div>
                  <dt>NAME</dt>
                  <dd>Soubhagya Kumar Behera</dd>
                </div>
                <div>
                  <dt>ROLE</dt>
                  <dd>Java Full-Stack Developer</dd>
                </div>
                <div>
                  <dt>FOCUS</dt>
                  <dd>Java · Spring Boot · Backend Systems</dd>
                </div>
                <div>
                  <dt>LOOKING FOR</dt>
                  <dd>Java Backend / Full-Stack Roles</dd>
                </div>
              </dl>
              <div className="dev-card__foot">
                <CardFooterDecoration />
              </div>
            </div>
          </Reveal>

          <InfoCard title="DEVELOPER SNAPSHOT" index="02" delay={70}>
            <dl className="info-card__rows">
              {snapshotRows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </InfoCard>

          <InfoCard title="WHAT I BUILD" index="03" delay={140}>
            <ul className="info-card__list">
              {builtItems.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </InfoCard>

          <InfoCard title="CURRENTLY LEARNING" index="04" delay={210}>
            <ul className="info-card__list">
              {learningItems.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </InfoCard>
        </div>
      </div>
    </section>
  )
}

